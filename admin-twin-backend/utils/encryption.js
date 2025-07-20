const crypto = require("crypto");

// Get the encryption key from environment variables.
// IMPORTANT: This key should be a 32-character string and must be kept secret.
// It's defined in your .env file.
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "a_default_32_character_secret_key"; // Fallback for safety, but should be set in .env
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Encrypts a piece of text.
 * @param {string} text The text to encrypt.
 * @returns {string} The encrypted text, formatted as 'iv:encryptedData'.
 */
function encrypt(text) {
  if (!text) {
    return null;
  }
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Decrypts a piece of text.
 * @param {string} text The encrypted text, formatted as 'iv:encryptedData'.
 * @returns {string} The decrypted text.
 */
function decrypt(text) {
  if (!text) {
    return null;
  }
  try {
    const textParts = text.split(":");
    const iv = Buffer.from(textParts.shift(), "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(ENCRYPTION_KEY),
      iv
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error(
      "Decryption failed. This might be due to an incorrect key or corrupted data.",
      error
    );
    return null;
  }
}

module.exports = { encrypt, decrypt };
