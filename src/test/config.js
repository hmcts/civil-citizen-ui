
const PropertiesVolume = require('./secretsConfig');

const defaultPassword = process.env.CITIZEN_PASSWORD;
const judgeDefaultPassword = process.env.JUDGE_PASSWORD;
const testUrl = process.env.TEST_URL || 'https://civil-citizen-ui.demo.platform.hmcts.net';
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
  WaitForText: 60,
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
  idamStub: {
    enabled: process.env.IDAM_STUB_ENABLED === 'true',
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
    email: 'citizen2.user@gmail.com',
    type: 'defendant',
  },
  defendantLRCitizenUser:{
    password: defaultPassword,
    email: 'cuiuseraat@gmail.com',
    type: 'defendant',
  },
  adminUser: {
    password: defaultPassword,
    email: 'civil-admin@mailnesia.com',
    type: 'admin',
  },
  judgeUserWithRegionId1: {
    password: judgeDefaultPassword,
    email: '4917924EMP-@ejudiciary.net',
    type: 'judge',
    roleCategory: 'JUDICIAL',
    regionId: '1',
  },
  judgeUserWithRegionId3: {
    password: judgeDefaultPassword,
    email: '4924221EMP-@ejudiciary.net',
    type: 'judge',
    roleCategory: 'JUDICIAL',
    regionId: '1',
  },
  hearingCenterAdminWithRegionId1: {
    email: 'hearing_center_admin_reg1@justice.gov.uk',
    password: defaultPassword,
    type: 'hearing-center-admin',
    roleCategory: 'ADMIN',
    regionId: '1',
  },
  definition: {
    jurisdiction: 'CIVIL',
    caseType: 'CIVIL',
  },
  caseWorker: {
    email: 'ga_ctsc_team_leader_national@justice.gov.uk',
    password: defaultPassword,
    type: 'caseworker',
  },
  TestOutputDir: process.env.E2E_OUTPUT_DIR || 'test-results/functional',
  runningEnv: process.env.ENVIRONMENT,
  claimantSolicitorOrgId: process.env.ENVIRONMENT == 'demo' ? 'B04IXE4' : 'Q1KOKP2',
  defendant1SolicitorOrgId: process.env.ENVIRONMENT == 'demo' ? 'DAWY9LJ' : '79ZRSOU',
  defendant2SolicitorOrgId: process.env.ENVIRONMENT =='demo' ? 'LCVTI1I' : 'H2156A0',
  defendantSelectedCourt:'Leeds Combined Court Centre - The Court House, 1 Oxford Row - LS1 3BG',
  claimantLRSelectedCourt:'Leeds Combined Court Centre - The Court House, 1 Oxford Row - LS1 3BG',
  defenceType: {
    admitAllPayImmediate: 'ADMIT_ALL_PAU_IMMEDIATE',
    admitAllPayBySetDate: 'ADMIT_ALL_PAY_BY_SET_DATE',
    admitAllPayByInstallment: 'ADMIT_ALL_PAY_BY_INSTALLMENTS',
    partAdmitAmountPaid: 'PART_ADMIT_ALREADY_PAID',
    partAdmitHaventPaidPartiallyWantsToPayImmediately: 'PART_ADMIT_PAY_IMMEDIATELY',
    partAdmitWithPartPaymentOnSpecificDate: 'PART_ADMIT_PAY_BY_SET_DATE',
    partAdmitWithPartPaymentAsPerInstallmentPlan: 'PART_ADMIT_PAY_BY_INSTALLMENTS',
    rejectAll: 'REJECT_ALL',
    rejectAllAlreadyPaid: 'REJECT_ALL_ALREADY_PAID',
    rejectAllDisputeAll: 'REJECT_ALL_DISPUTE_ALL',
  },
  sdoSelectionType: {
    judgementSumSelectedYesAssignToSmallClaimsYes: 'JUDGEMENT_SUM_YES_SMALL_CLAIMS_YES',
    judgementSumSelectedYesAssignToSmallClaimsNoDisposalHearing: 'JUDGEMENT_SUM_YES_SMALL_CLAIMS_NO_DISPOSAL_HEARING',
    judgementSumSelectedYesAssignToSmallClaimsNoTrialHearing: 'JUDGEMENT_SUM_YES_SMALL_CLAIMS_NO_TRIAL_HEARING',
    judgementSumSelectedNoAssignToSmallClaimsYes: 'JUDGEMENT_SUM_NO_SMALL_CLAIMS_YES',
    judgementSumSelectedNoAssignToFastTrackYes: 'JUDGEMENT_SUM_NO_FAST_TRACK_YES',
  },
  claimState: {
    PROCEEDS_IN_HERITAGE_SYSTEM: 'PROCEEDS_IN_HERITAGE_SYSTEM',
    AWAITING_RESPONDENT_ACKNOWLEDGEMENT: 'AWAITING_RESPONDENT_ACKNOWLEDGEMENT',
    AWAITING_APPLICANT_INTENTION: 'AWAITING_APPLICANT_INTENTION',
    JUDICIAL_REFERRAL: 'JUDICIAL_REFERRAL',
    IN_MEDIATION: 'IN_MEDIATION',
    CASE_STAYED: 'CASE_STAYED',
    CASE_PROGRESSION: 'CASE_PROGRESSION',
    HEARING_READINESS: 'HEARING_READINESS',
  },
};
