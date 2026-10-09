const crypto = require('crypto');

const ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const DEFAULT_LENGTH = 7;

function generateShortCode(length = DEFAULT_LENGTH) {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += ALPHABET[crypto.randomInt(ALPHABET.length)];
  }
  return code;
}

module.exports = { generateShortCode };