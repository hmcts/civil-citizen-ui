
const PropertiesVolume = require('./secretsConfig');

const defaultPassword = process.env.CITIZEN_PASSWORD;
const testUrl = process.env.TEST_URL || 'https://civil-citizen-ui.demo.platform.hmcts.net/';
const testHeadlessBrowser = process.env.TEST_HEADLESS ? process.env.TEST_HEADLESS === 'true' : true;

if (!process.env.TEST_PASSWORD) {
  PropertiesVolume.enableFor({ locals: { developmentMode: true } });
}
module.exports = {
  TestUrl: testUrl,
  env: process.env.ENVIRONMENT_NAME || 'local',
  TestHeadlessBrowser: testHeadlessBrowser,
  TestSlowMo: 250,
  WaitForTimeout: 20000,
  helpers: {
    Playwright: {
      url: testUrl,
      show: false,
      browser: 'chromium',
      waitForTimeout: 20000,
      timeout: 20000,
      waitForAction: 1000,
      waitForNavigation: 'networkidle0',
      ignoreHTTPSErrors: true,
    },
  },
  Username: process.env.CITIZEN_USERNAME,
  Password: process.env.CITIZEN_PASSWORD,
  idamStub: {
    enabled: process.env.IDAM_STUB_ENABLED || false,
    url: 'http://localhost:5555',
  },
  url: {
    manageCase: process.env.URL || 'https://manage-case.demo.platform.hmcts.net/',
    authProviderApi: process.env.SERVICE_AUTH_PROVIDER_API_BASE_URL || 'http://rpe-service-auth-provider-demo.service.core-compute-demo.internal',
    ccdDataStore: process.env.CCD_DATA_STORE_URL || 'http://ccd-data-store-api-demo.service.core-compute-demo.internal',
    dmStore: process.env.DM_STORE_URL || 'http://dm-store-demo.service.core-compute-demo.internal',
    idamApi: process.env.IDAM_API_URL || 'https://idam-api.demo.platform.hmcts.net',
    civilService: process.env.CIVIL_SERVICE_URL || 'http://civil-service-demo.service.core-compute-demo.internal',
  },
  s2s: {
    microservice: 'civil_service',
    secret: process.env.S2S_SECRET || '4W4QUXOYX623JW64',
  },
  applicantSolicitorUser: {
    password: defaultPassword,
    email: 'hmcts.civil+organisation.1.solicitor.1@gmail.com',
    type: 'applicant_solicitor',
  },
  defendantCitizenUser: {
    password: defaultPassword,
    email: 'cuiuser@gmail.com',
    type: 'defendant_solicitor',
  },
  definition: {
    jurisdiction: 'CIVIL',
    caseType: 'CIVIL',
  },
  TestOutputDir: process.env.E2E_OUTPUT_DIR || 'test-results/functional',
  runningEnv: process.env.ENVIRONMENT,
  claimantSolicitorOrgId: process.env.ENVIRONMENT == 'demo' ? 'B04IXE4' : 'Q1KOKP2',
  defendant1SolicitorOrgId: process.env.ENVIRONMENT == 'demo' ? 'DAWY9LJ' : '79ZRSOU',
  defendant2SolicitorOrgId: process.env.ENVIRONMENT =='demo' ? 'LCVTI1I' : 'H2156A0',
};
