import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_LENGTH = 16;

export function encrypt(text: string, passphrase: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = crypto.scryptSync(passphrase, salt, KEY_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return Buffer.concat([salt, iv, encrypted]).toString('base64');
}

export function decrypt(ciphertext: string, passphrase: string): string {
  const data = Buffer.from(ciphertext, 'base64');
  const salt = data.subarray(0, SALT_LENGTH);
  const iv = data.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const encrypted = data.subarray(SALT_LENGTH + IV_LENGTH);
  const key = crypto.scryptSync(passphrase, salt, KEY_LENGTH);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}
