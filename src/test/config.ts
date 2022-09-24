import { PropertiesVolume } from '../main/modules/properties-volume';
import { Application } from 'express';

if (!process.env.TEST_PASSWORD) {
  new PropertiesVolume().enableFor({ locals: { developmentMode: true } } as unknown as Application);
}

const username = process.env.CITIZEN_USERNAME;
const password = process.env.CITIZEN_PASSWORD;
const defaultPassword = 'Password12!';

export const config = {
  TestUrl: process.env.TEST_URL || 'https://civil-citizen-ui.demo.platform.hmcts.net',
  env: process.env.ENVIRONMENT_NAME || 'local',
  TestForAccessibility: process.env.TESTS_FOR_ACCESSIBILITY === 'true',
  TestHeadlessBrowser: process.env.TEST_HEADLESS ? process.env.TEST_HEADLESS === 'true' : true,
  TestSlowMo: 250,
  WaitForTimeout: 20000,
  helpers: {},
  Username:username,
  Password:password,
  runningEnv: process.env.ENVIRONMENT,
  idamStub: {
    enabled: process.env.IDAM_STUB_ENABLED || false,
    url: 'http://localhost:5555',
  },
  url: {
    manageCase: process.env.URL || 'https://manage-case.demo.platform.hmcts.net/',
    authProviderApi: process.env.SERVICE_AUTH_PROVIDER_API_BASE_URL || 'http://rpe-service-auth-provider-demo.service.core-compute-demo.internal',
    ccdDataStore: process.env.CCD_DATA_STORE_URL || 'http://ccd-data-store-api-demo.service.core-compute-demo.internal',
    dmStore:process.env.DM_STORE_URL || 'http://dm-store-demo.service.core-compute-demo.internal',
    idamApi: process.env.IDAM_API_URL || 'https://idam-api.demo.platform.hmcts.net',
    civilService: process.env.CIVIL_SERVICE_URL || 'http://civil-service-demo.service.core-compute-demo.internal'
    // manageCase: process.env.URL || 'http://localhost:3333',
    // authProviderApi: process.env.SERVICE_AUTH_PROVIDER_API_BASE_URL || 'http://localhost:4502',
    // ccdDataStore: process.env.CCD_DATA_STORE_URL || 'http://localhost:4452',
    // dmStore: process.env.DM_STORE_URL || 'http://dm-store:8080',
    // idamApi: process.env.IDAM_API_URL || 'http://localhost:5000',
    // civilService: process.env.CIVIL_SERVICE_URL || 'http://localhost:4000',
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
  defendantSolicitorUser: {
    password: defaultPassword,
    email: 'hmcts.civil+organisation.2.solicitor.1@gmail.com',
    type: 'defendant_solicitor',
  },
  secondDefendantSolicitorUser: {
    password: defaultPassword,
    email: 'hmcts.civil+organisation.3.solicitor.1@gmail.com',
    type: 'defendant_solicitor',
  },
  adminUser: {
    password: defaultPassword,
    email: 'civil-admin@mailnesia.com',
    type: 'admin',
  },
  systemupdate: {
    password: defaultPassword,
    email: 'hmcts.civil+organisation.1.superuser@gmail.com',
    type: 'systemupdate',
  },
  definition: {
    jurisdiction: 'CIVIL',
    caseType: 'CIVIL',
  },
  
  claimantSolicitorOrgId: process.env.ENVIRONMENT == 'demo' ? 'B04IXE4' : 'Q1KOKP2',
  defendant1SolicitorOrgId: process.env.ENVIRONMENT == 'demo' ? 'DAWY9LJ' : '79ZRSOU',
  defendant2SolicitorOrgId: process.env.ENVIRONMENT == 'demo' ? 'LCVTI1I' : 'H2156A0',
};

config.helpers = {
  Playwright: {
    url: config.TestUrl,
    show: !config.TestHeadlessBrowser,
    browser: 'chromium',
    waitForTimeout: config.WaitForTimeout,
    timeout: 20000,
    waitForAction: 1000,
    waitForNavigation: 'networkidle0',
    ignoreHTTPSErrors: true,
  },
};
