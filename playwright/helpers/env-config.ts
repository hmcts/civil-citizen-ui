function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set.`);
  }
  return value;
}

export const config = {
  environment: process.env.ENVIRONMENT || 'preview',

  get testUrl(): string {
    return requireEnv('TEST_URL');
  },
  get idamApiUrl(): string {
    return process.env.IDAM_API_URL || 'https://idam-api.aat.platform.hmcts.net';
  },
  get idamTestSupportApiUrl(): string {
    return process.env.IDAM_TEST_SUPPORT_API_URL || 'https://idam-testing-support-api.aat.platform.hmcts.net';
  },
  get defaultPassword(): string {
    return process.env.DEFAULT_PASSWORD || 'Password12!';
  },
  get adminUser(): string {
    return process.env.IDAM_ADMIN_USER || 'ctsc_admin@justice.gov.uk';
  },
  get adminPassword(): string {
    return process.env.DEFAULT_PASSWORD || 'Password12!';
  },
};
