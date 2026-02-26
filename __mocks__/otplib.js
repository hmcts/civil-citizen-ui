/** Mock otplib so Jest does not load ESM-only @scure/base (avoids "Unexpected token 'export'"). */
module.exports = {
  generateSync: jest.fn(() => '123456'),
};
