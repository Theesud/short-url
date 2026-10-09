$ErrorActionPreference = 'Stop'

$BaseUrl = 'http://localhost:4000'
$stamp = Get-Date -Format 'yyyyMMddHHmmss'
$password = 'password123'
$script:passed = 0
$script:failed = 0

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

$email1 = "test1_$stamp@gmail.com"
$email2 = "test2_$stamp@gmail.com"

# --- Register / login ---
$r = Invoke-Api 'POST' '/api/auth/register' @{ email = $email1; password = $password }
Test-Case '01 register new user -> 201' ($r.Status -eq 201 -and [bool]$r.Data.token) "status=$($r.Status)"
$token1 = $r.Data.token

$r = Invoke-Api 'POST' '/api/auth/register' @{ email = $email1; password = $password }
Test-Case '02 register same email again -> 409' ($r.Status -eq 409) "status=$($r.Status)"

$r = Invoke-Api 'POST' '/api/auth/register' @{ email = 'abc'; password = $password }
Test-Case '03 register invalid email -> 400' ($r.Status -eq 400) "status=$($r.Status)"

$r = Invoke-Api 'POST' '/api/auth/register' @{ email = "short_$stamp@gmail.com"; password = '123' }
Test-Case '04 register short password -> 400' ($r.Status -eq 400) "status=$($r.Status)"

$r = Invoke-Api 'POST' '/api/auth/login' @{ email = $email1; password = $password }
Test-Case '05 login correct -> 200 + token' ($r.Status -eq 200 -and [bool]$r.Data.token) "status=$($r.Status)"

$r = Invoke-Api 'POST' '/api/auth/login' @{ email = $email1; password = 'wrong-password' }
Test-Case '06 login wrong password -> 401' ($r.Status -eq 401) "status=$($r.Status)"

# --- Current user ---
$r = Invoke-Api 'GET' '/api/auth/me' $null $token1
Test-Case '07 /me with token -> 200' ($r.Status -eq 200 -and $r.Data.user.email -eq $email1) "status=$($r.Status)"

$r = Invoke-Api 'GET' '/api/auth/me'
Test-Case '08 /me without token -> 401' ($r.Status -eq 401) "status=$($r.Status)"

# --- Create links ---
$r = Invoke-Api 'POST' '/api/urls' @{ originalUrl = 'https://www.synerry.com' }
Test-Case '09 create link as guest -> 201, owned=false' ($r.Status -eq 201 -and $r.Data.owned -eq $false) "status=$($r.Status)"
$guestCode = $r.Data.shortCode

$r = Invoke-Api 'POST' '/api/urls' @{ originalUrl = 'https://www.synerry.com' } $token1
Test-Case '10 create link with token -> 201, owned=true' ($r.Status -eq 201 -and $r.Data.owned -eq $true) "status=$($r.Status)"
$ownedCode = $r.Data.shortCode

# --- History / stats ownership ---
$r = Invoke-Api 'GET' '/api/urls' $null $token1
Test-Case '11 history shows only my own link' ($r.Status -eq 200 -and $r.Data.total -eq 1 -and $r.Data.items[0].shortCode -eq $ownedCode) "status=$($r.Status)"

$r = Invoke-Api 'GET' '/api/urls'
Test-Case '12 history without token -> 401' ($r.Status -eq 401) "status=$($r.Status)"

$r = Invoke-Api 'GET' "/api/urls/$ownedCode/stats" $null $token1
Test-Case '13 stats of my link -> 200' ($r.Status -eq 200) "status=$($r.Status)"

$r = Invoke-Api 'POST' '/api/auth/register' @{ email = $email2; password = $password }
$token2 = $r.Data.token
$r = Invoke-Api 'GET' "/api/urls/$ownedCode/stats" $null $token2
Test-Case "14 stats of someone else's link -> 404" ($r.Status -eq 404) "status=$($r.Status)"

$r = Invoke-Api 'GET' "/api/urls/$guestCode/stats" $null $token1
Test-Case '15 stats of a guest link -> 404' ($r.Status -eq 404) "status=$($r.Status)"

$r = Invoke-Api 'GET' '/api/urls' $null 'abc'
Test-Case '16 invalid token -> 401' ($r.Status -eq 401) "status=$($r.Status)"

Write-Host ''
Write-Host "Passed: $script:passed   Failed: $script:failed"
if ($script:failed -gt 0) { exit 1 }