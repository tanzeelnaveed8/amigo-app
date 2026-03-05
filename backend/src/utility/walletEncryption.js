const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const SALT_LENGTH = 32;

function getMasterKey() {
  const key = process.env.WALLET_ENCRYPTION_KEY || process.env.JWT_SECRET_KEY || 'amigo-wallet-default-key-32-bytes!!';
  return crypto.scryptSync(key, 'amigo-wallet-salt', KEY_LENGTH);
}

function encryptBuffer(plainBuffer) {
  const key = getMasterKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });
  const encrypted = Buffer.concat([cipher.update(plainBuffer), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    encrypted: Buffer.concat([encrypted, tag]),
    iv: iv.toString('base64'),
  };
}

function decryptBuffer(encryptedBuffer, ivBase64) {
  const key = getMasterKey();
  const iv = Buffer.from(ivBase64, 'base64');
  const tag = encryptedBuffer.subarray(encryptedBuffer.length - TAG_LENGTH);
  const data = encryptedBuffer.subarray(0, encryptedBuffer.length - TAG_LENGTH);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]);
}

module.exports = {
  encryptBuffer,
  decryptBuffer,
  getMasterKey,
};
