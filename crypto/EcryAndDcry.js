//Checking the crypto module
const crypto = require('crypto');
const assert = require("assert");
const algorithm = 'aes256'; //Using AES encryption
const key = "qqshopifyteam";


//Encrypting text
function encrypt(text) {
    let cipher = crypto.createCipher(algorithm, key); 
    return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
}

// Decrypting text
function decrypt(encrypted) {
    let decipher = crypto.createDecipher(algorithm, key);
    return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
}

function compaire(decrypted,text) {
    return assert.equal(decrypted, text);
}

module.exports = {
    encrypt: encrypt,
    decrypt: decrypt,
    compaire: compaire
}