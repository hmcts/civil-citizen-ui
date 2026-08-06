import {decryptWithPassphrase, encryptWithPassphrase} from 'common/utils/encryptionUtils';

describe('encryptionUtils', () => {
  it('should encrypt and decrypt a value with the same passphrase', () => {
    const passphrase = 'H4WYG26R6PA9';
    const plaintext = 'yes';

    const ciphertext = encryptWithPassphrase(plaintext, passphrase);
    const result = decryptWithPassphrase(ciphertext, passphrase);

    expect(result).toEqual(plaintext);
    expect(ciphertext).not.toEqual(plaintext);
  });

  it('should return empty string when passphrase is incorrect', () => {
    const ciphertext = encryptWithPassphrase('yes', 'H4WYG26R6PA9');

    expect(decryptWithPassphrase(ciphertext, 'wrong-passphrase')).toEqual('');
  });

  it('should return empty string for invalid ciphertext', () => {
    expect(decryptWithPassphrase('not-valid-ciphertext', 'H4WYG26R6PA9')).toEqual('');
  });
});
