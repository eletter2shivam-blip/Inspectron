const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

// Derive a consistent 32-byte encryption key from environment secret
function getEncryptionKey() {
  const secret = process.env.AUTH_SECRET || process.env.JWT_SECRET || 'inspectron-default-secret-encryption-key-2026';
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypts a plain-text secret string using AES-256-GCM.
 * @param {string} text - Plain text secret
 * @returns {string} - Encrypted string formatted as iv:ciphertext:tag (hex)
 */
function encryptSecret(text) {
  if (!text || typeof text !== 'string') return '';
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${encrypted}:${tag}`;
}

/**
 * Decrypts an AES-256-GCM encrypted string.
 * @param {string} encryptedString - String formatted as iv:ciphertext:tag (hex)
 * @returns {string} - Plain text secret
 */
function decryptSecret(encryptedString) {
  if (!encryptedString || typeof encryptedString !== 'string') return '';
  const parts = encryptedString.split(':');
  if (parts.length !== 3) {
    // If not in encrypted format (e.g. legacy plain text), return as-is
    return encryptedString;
  }
  
  try {
    const key = getEncryptionKey();
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const tag = Buffer.from(parts[2], 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Failed to decrypt secret:', err.message);
    return '';
  }
}

/**
 * Masks a sensitive string, exposing only the last 4 characters.
 * @param {string} secret - Plain text secret
 * @returns {string} - Masked string (e.g. ************KzdO)
 */
function maskSecret(secret) {
  if (!secret || typeof secret !== 'string') return '';
  if (secret.length <= 4) return '****';
  const visible = secret.slice(-4);
  const maskedLength = Math.max(8, secret.length - 4);
  return '*'.repeat(maskedLength) + visible;
}

module.exports = {
  encryptSecret,
  decryptSecret,
  maskSecret
};
