import {createCipheriv, createDecipheriv, createHash, randomBytes} from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const ENCODING_SEPARATOR = ':';

function getKey(secret: string): Buffer {
  return createHash('sha256').update(secret).digest();
}

export function encryptSessionValue(value: string, secret: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, getKey(secret), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [iv.toString('base64'), authTag.toString('base64'), encrypted.toString('base64')].join(ENCODING_SEPARATOR);
}

export function decryptSessionValue(encryptedValue: string, secret: string): string {
  const [ivBase64, authTagBase64, encryptedBase64] = encryptedValue.split(ENCODING_SEPARATOR);
  if (!ivBase64 || !authTagBase64 || !encryptedBase64) {
    return '';
  }

  try {
    const decipher = createDecipheriv(ALGORITHM, getKey(secret), Buffer.from(ivBase64, 'base64'));
    decipher.setAuthTag(Buffer.from(authTagBase64, 'base64'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedBase64, 'base64')),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  } catch {
    return '';
  }
}
