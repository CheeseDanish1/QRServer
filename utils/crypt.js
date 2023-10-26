const Crypto = require("crypto-js");
const jwt = require("jsonwebtoken");
const key = process.env.ENCRYPTION_KEY;

function encrypt(token) {
  return Crypto.AES.encrypt(token, key);
}

function decrypt(token) {
  return Crypto.AES.decrypt(token, key)?.toString(Crypto.enc.Utf8);
}

function encryptData(data, time) {
  return jwt.sign(data, key, { expiresIn: time });
}

function decryptData(data) {
  if (!data) return;
  let res;
  try {
    res = jwt.verify(data, key);
  } catch (e) {
    res = null;
  }
  return res;
}

module.exports = { encrypt, decrypt, encryptData, decryptData };
