import {decryptSessionValue, encryptSessionValue} from 'services/firstcontact/sessionValueCrypto';

describe('first-contact session value encryption', () => {
  const secret = 'first-contact-test-secret';
  // Fixed fixture: SHA-256 of the test secret as key, IV 000102030405060708090a0b, plaintext "yes".
  // Do not generate this through encryptSessionValue: both functions changing format must not hide a rollout break.
  const savedValue = 'AAECAwQFBgcICQoL:4GBxu7JBxlGXnl2vImoJAg==:XnGC';

  it('reads a value saved in the existing AES-GCM session format', () => {
    expect(decryptSessionValue(savedValue, secret)).toBe('yes');
  });

  it('does not read an existing session value with the wrong secret', () => {
    expect(decryptSessionValue(savedValue, 'different-secret')).toBe('');
  });

  it.each([0, 1, 2])('rejects tampering with encrypted field %i', field => {
    const parts = savedValue.split(':');
    const bytes = Buffer.from(parts[field], 'base64');
    bytes[0] ^= 1;
    parts[field] = bytes.toString('base64');
    expect(decryptSessionValue(parts.join(':'), secret)).toBe('');
  });

  it.each(['', 'not-an-encrypted-value', 'AAECAwQFBgcICQoL:missing-tag'])('rejects malformed session data %p', value => {
    expect(decryptSessionValue(value, secret)).toBe('');
  });

  it('round-trips newly saved session values', () => {
    expect(decryptSessionValue(encryptSessionValue('yes', secret), secret)).toBe('yes');
  });
});
