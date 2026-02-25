/**
 * Mock for otplib to avoid loading ESM-only @scure/base in Jest.
 * The real otplib (v13) depends on @scure/base which uses ES modules;
 * Jest does not transform node_modules by default, causing "Unexpected token 'export'".
 */
module.exports = {
  generateSync: jest.fn(() => '123456'),
};
