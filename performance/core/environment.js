export const setting = (name, fallback) => (__ENV[name] === undefined || __ENV[name] === '' ? fallback : __ENV[name]);

export const required = (name) => {
  const value = __ENV[name];
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set.`);
  }
  return value;
};

export const environment = {
  get target() {
    return required('TARGET_URL').replace(/\/$/, '');
  },
  idamApi: setting('IDAM_API_URL', 'https://idam-api.aat.platform.hmcts.net'),
  idamTestSupportApi: setting('IDAM_TEST_SUPPORT_API_URL', 'https://idam-testing-support-api.aat.platform.hmcts.net'),
  idamAdminUser: setting('IDAM_ADMIN_USER', 'ctsc_admin@justice.gov.uk'),
  password: setting('DEFAULT_PASSWORD', 'Password12!'),
  solicitorUser: setting('SOLICITOR_USER', 'hmcts.civil+organisation.1.solicitor.1@gmail.com'),
  profile: setting('PROFILE', 'smoke'),
  runId: setting('RUN_ID', `${Date.now()}`),
  resultsDir: setting('RESULTS_DIR', '.'),
  nfrMs: Number(setting('NFR_P95_MS', 1500)),
};
