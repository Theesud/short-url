$ErrorActionPreference = 'Stop'

$BaseUrl = 'http://localhost:4000'
$stamp = Get-Date -Format 'yyyyMMddHHmmss'
$password = 'password123'
$aliasA = "alias$stamp"
$script:passed = 0
$script:failed = 0

if (-not (Get-Command curl.exe -ErrorAction SilentlyContinue)) {
    throw 'curl.exe not found. It ships with Windows 10 (1803 or newer) and Windows 11.'
}

function Invoke-Api {
    param(
        [string]$Method,
        [string]$Path,
        $Body = $null,
        [string]$Token = $null
    )

    $headers = @{}
    if ($Token) { $headers['Authorization'] = "Bearer $Token" }

    $params = @{
        Uri             = "$BaseUrl$Path"
        Method          = $Method
        Headers         = $headers
        UseBasicParsing = $true
    }
    if ($null -ne $Body) {
        $params['ContentType'] = 'application/json'
        $params['Body'] = ($Body | ConvertTo-Json -Compress)
    }

    $status = 0
    $text = ''
    try {
        $response = Invoke-WebRequest @params
        $status = [int]$response.StatusCode
        $text = $response.Content
    }
    catch {
        if ($_.Exception.Response) {
            $status = [int]$_.Exception.Response.StatusCode
            if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
                $text = $_.ErrorDetails.Message
            }
            else {
                try {
                    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                    $text = $reader.ReadToEnd()
                }
                catch { }
            }
        }
        else {
            throw "Request did not get a response: $Method $Path -> $($_.Exception.Message) (check the backend terminal for errors)"
        }
    }

    $data = $null
    if ($text) {
        try { $data = $text | ConvertFrom-Json } catch { }
    }

    return [pscustomobject]@{ Status = $status; Data = $data }
}

# ส่ง GET ด้วย curl.exe (ไม่ตาม redirect) เพื่ออ่านรหัสสถานะและปลายทางของ redirect
function Invoke-Curl {
    param(
        [string]$Path,
        [string]$Accept
    )

    $output = & curl.exe -s -o NUL -w '%{http_code}|%{redirect_url}' -H "Accept: $Accept" "$BaseUrl$Path"
    if ($LASTEXITCODE -ne 0) {
        throw "curl.exe failed for GET $Path (exit code $LASTEXITCODE). Is the backend running?"
    }

    $parts = ([string]$output) -split '\|', 2
    return [pscustomobject]@{ Status = [int]$parts[0]; Location = $parts[1] }
}

function Test-Case {
    param(
        [string]$Name,
        [bool]$Condition,
        [string]$Detail = ''
    )

    if ($Condition) {
        Write-Host "PASS  $Name" -ForegroundColor Green
        $script:passed++
    }
    else {
        Write-Host "FAIL  $Name   $Detail" -ForegroundColor Red
        $script:failed++
    }
}

Write-Host "Testing $BaseUrl ..."
Write-Host ''

$site = 'https://www.synerry.com'

$r = Invoke-Api 'POST' '/api/auth/register' @{ email = "linka_$stamp@gmail.com"; password = $password }
$tokenA = $r.Data.token
$r = Invoke-Api 'POST' '/api/auth/register' @{ email = "linkb_$stamp@gmail.com"; password = $password }
$tokenB = $r.Data.token
Test-Case '01 register two test users' ([bool]$tokenA -and [bool]$tokenB) "status=$($r.Status)"

# --- Custom alias ---
$r = Invoke-Api 'POST' '/api/urls' @{ originalUrl = $site; alias = $aliasA } $tokenA
Test-Case '02 create link with custom alias -> 201, shortCode = alias' ($r.Status -eq 201 -and $r.Data.shortCode -eq $aliasA) "status=$($r.Status)"

$r = Invoke-Api 'POST' '/api/urls' @{ originalUrl = $site; alias = $aliasA }
Test-Case '03 same alias again -> 409' ($r.Status -eq 409) "status=$($r.Status)"

$r = Invoke-Api 'POST' '/api/urls' @{ originalUrl = $site; alias = 'ab' }
Test-Case '04 alias too short -> 400' ($r.Status -eq 400) "status=$($r.Status)"

$r = Invoke-Api 'POST' '/api/urls' @{ originalUrl = $site; alias = 'bad alias!' }
Test-Case '05 alias with invalid characters -> 400' ($r.Status -eq 400) "status=$($r.Status)"

$r = Invoke-Api 'POST' '/api/urls' @{ originalUrl = $site; alias = 'API' }
Test-Case '06 reserved alias -> 400' ($r.Status -eq 400) "status=$($r.Status)"

# --- Expiry ---
$r = Invoke-Api 'POST' '/api/urls' @{ originalUrl = $site; expiresInDays = 0 }
Test-Case '07 expiresInDays = 0 -> 400' ($r.Status -eq 400) "status=$($r.Status)"

$r = Invoke-Api 'POST' '/api/urls' @{ originalUrl = $site; expiresInDays = 999 }
Test-Case '08 expiresInDays = 999 -> 400' ($r.Status -eq 400) "status=$($r.Status)"

$r = Invoke-Api 'POST' '/api/urls' @{ originalUrl = $site; expiresInDays = 7 } $tokenA
Test-Case '09 create link expiring in 7 days -> 201 with expiresAt' ($r.Status -eq 201 -and [bool]$r.Data.expiresAt) "status=$($r.Status)"
$codeExp = $r.Data.shortCode

# --- Redirect ---
$r = Invoke-Curl "/$aliasA" 'text/html'
Test-Case '10 open valid alias -> 302 to the original site' ($r.Status -eq 302 -and $r.Location -like 'https://www.synerry.com*') "status=$($r.Status) location=$($r.Location)"

# --- Delete ---
$r = Invoke-Api 'DELETE' "/api/urls/$aliasA" $null $tokenB
Test-Case "11 delete someone else's link -> 404" ($r.Status -eq 404) "status=$($r.Status)"

$r = Invoke-Api 'DELETE' "/api/urls/$aliasA"
Test-Case '12 delete without token -> 401' ($r.Status -eq 401) "status=$($r.Status)"

$r = Invoke-Api 'DELETE' "/api/urls/$aliasA" $null $tokenA
Test-Case '13 delete own link -> 204' ($r.Status -eq 204) "status=$($r.Status)"

$r = Invoke-Curl "/$aliasA" 'application/json'
Test-Case '14 open deleted link (JSON client) -> 404' ($r.Status -eq 404) "status=$($r.Status)"

# --- Expired link ---
docker exec shorturl-postgres psql -U shorturl -d shorturl -c "UPDATE urls SET expires_at = now() - interval '1 hour' WHERE short_code = '$codeExp';" | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'docker exec failed. Is Docker running and the container named shorturl-postgres?' }

$r = Invoke-Curl "/$codeExp" 'application/json'
Test-Case '15 open expired link (JSON client) -> 410' ($r.Status -eq 410) "status=$($r.Status)"

$r = Invoke-Curl "/$codeExp" 'text/html'
Test-Case '16 open expired link (browser) -> 302 to friendly page' ($r.Status -eq 302 -and $r.Location -like '*/link-unavailable?reason=expired') "status=$($r.Status) location=$($r.Location)"

$r = Invoke-Api 'GET' '/api/urls' $null $tokenA
$item = $r.Data.items | Where-Object { $_.shortCode -eq $codeExp }
Test-Case '17 history marks expired link (expired = true)' ($r.Status -eq 200 -and $null -ne $item -and $item.expired -eq $true) "status=$($r.Status)"

$r = Invoke-Curl "/nope$stamp" 'text/html'
Test-Case '18 open unknown link (browser) -> 302 to friendly page' ($r.Status -eq 302 -and $r.Location -like '*/link-unavailable?reason=not-found') "status=$($r.Status) location=$($r.Location)"

Write-Host ''
Write-Host "Passed: $script:passed   Failed: $script:failed"
if ($script:failed -gt 0) { exit 1 }