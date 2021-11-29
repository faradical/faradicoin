const EC = require("elliptic").ec;
const ec = new EC("secp256k1");
var key = ec.genKeyPair();
var public_key = key.getPublic('hex');
var private_key = key.getPrivate('hex');

console.log();
console.log("Private Key: " + private_key);
console.log("Public Key: " + public_key);