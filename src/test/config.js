
const PropertiesVolume = require('./secretsConfig');

const defaultPassword = process.env.CITIZEN_PASSWORD;
const defaultPasswordSystemUser = process.env.SYSTEM_USER_PASSWORD;
const judgeDefaultPassword = process.env.JUDGE_PASSWORD;
const testUrl = process.env.TEST_URL || 'https://moneyclaims.demo.platform.hmcts.net';
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
  idamStub: {
    enabled: process.env.IDAM_STUB_ENABLED === 'true',
    url: 'http://localhost:5555',
  },
  url: {
    manageCase: process.env.URL || 'https://xui-civil-citizen-ui-pr-3591.preview.platform.hmcts.net',
    authProviderApi: process.env.SERVICE_AUTH_PROVIDER_API_BASE_URL || 'http://rpe-service-auth-provider-aat.service.core-compute-aat.internal',
    ccdDataStore: process.env.CCD_DATA_STORE_URL || 'https://ccd-data-store-api-civil-citizen-ui-pr-3591.preview.platform.hmcts.net',
    dmStore:process.env.DM_STORE_URL || 'http://dm-store-aat.service.core-compute-aat.internal',
    idamApi:  'https://idam-api.aat.platform.hmcts.net',
    idamWeb: 'https://idam-web-public.aat.platform.hmcts.net',
    civilService: process.env.CIVIL_SERVICE_URL || 'https://civil-citizen-ui-pr-3591-civil-service.preview.platform.hmcts.net',

    /*manageCase: 'https://xui-civil-citizen-ui-pr-5873.preview.platform.hmcts.net',
    authProviderApi: 'http://rpe-service-auth-provider-aat.service.core-compute-aat.internal',
    ccdDataStore: 'https://ccd-data-store-api-civil-citizen-ui-pr-5873.preview.platform.hmcts.net',
    dmStore: 'http://dm-store-aat.service.core-compute-aat.internal',
    idamApi: 'https://idam-api.aat.platform.hmcts.net',
    civilService: 'https://civil-citizen-ui-pr-5873-civil-service.preview.platform.hmcts.net',*/

    /*manageCase: process.env.URL || 'https://manage-case.demo.platform.hmcts.net/',
    authProviderApi: process.env.SERVICE_AUTH_PROVIDER_API_BASE_URL || 'http://rpe-service-auth-provider-demo.service.core-compute-demo.internal',
    ccdDataStore: process.env.CCD_DATA_STORE_URL || 'http://ccd-data-store-api-demo.service.core-compute-demo.internal',
    dmStore: process.env.DM_STORE_URL || 'http://dm-store-demo.service.core-compute-demo.internal',
    idamApi: process.env.IDAM_API_URL || 'https://idam-api.demo.platform.hmcts.net',
    idamWeb: process.env.IDAM_WEB_URL || 'https://idam-web-public.demo.platform.hmcts.net',
    civilService: process.env.CIVIL_SERVICE_URL || 'http://civil-service-demo.service.core-compute-demo.internal',
    waTaskMgmtApi: process.env.WA_TASK_MGMT_URL || 'http://wa-task-management-api-demo.service.core-compute-demo.internal',
    generalApplication: process.env.CIVIL_GENERAL_APPLICATIONS_URL || 'http://civil-general-applications-demo.service.core-compute-demo.internal',
    caseAssignmentService: process.env.AAC_API_URL || 'http://aac-manage-case-assignment-demo.service.core-compute-demo.internal',
    wiremockServiceE2e: 'http://localhost:1111',*/
  },
  getDomain: (url) => new URL(url).host,
  s2s: {
    microservice: 'civil_service',
    secret: process.env.S2S_SECRET || 'AABBCCDDEEFFGGHH',
  },
  s2sForXUI: {
    microservice: 'xui_webapp',
    secret: process.env.XUI_S2S_SECRET || 'AABBCCDDEEFFGGHH',
  },
  applicantSolicitorUser: {
    password: defaultPassword,
    email: 'hmcts.civil+organisation.1.solicitor.1@gmail.com',
    type: 'applicant_solicitor',
    orgId: process.env.ENVIRONMENT === 'demo' ? 'B04IXE4' : 'Q1KOKP2',
  },
  defendantSolicitorUser: {
    password: defaultPassword,
    email: 'hmcts.civil+organisation.2.solicitor.1@gmail.com',
    type: 'defendant_solicitor',
    orgId: process.env.ENVIRONMENT === 'demo' ? 'DAWY9LJ' : '79ZRSOU',
  },
  claimantEmailsVerificationCitizenUser: {
    password: defaultPassword,
    email: 'civilmoneyclaimsdemo@gmail.com',
    type: 'claimant',
  },
  claimantCitizenUser: {
    password: defaultPassword,
    //email:'civilmoneyclaimsdemo@gmail.com',
    email: `claimantcitizen-${Math.random().toString(36).slice(2, 9).toLowerCase()}@gmail.com`,
    type: 'claimant',
  },
  defendantCitizenUser: {
    password: defaultPassword,
    email: `defendantcitizen-${Math.random().toString(36).slice(2, 9).toLowerCase()}@gmail.com`,
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
  //For users info refer - https://tools.hmcts.net/confluence/display/CHMC/Civil+Hearings+Management+JO+Test+Data+Requirements+-+for+Key+Journeys
  judgeUserWithRegionId1: {
    password: judgeDefaultPassword,
    email: 'DJ.Amy.Powell@ejudiciary.net',
    type: 'judge',
    roleCategory: 'JUDICIAL',
    regionId: '1',
  },
  legalAdvisor: {
    password: defaultPassword,
    email: 'tribunal_legal_caseworker_reg2@justice.gov.uk',
    type: 'legal operations',
  },
  judgeUserWithRegionId2: {
    password: judgeDefaultPassword,
    email: 'DJ.Angel.Morgan@ejudiciary.net',
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
  hearingCenterAdminWithRegionId2: {
    email: 'hearing_center_admin_reg2@justice.gov.uk',
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
  ctscAdmin: {
    email: 'ctsc_admin@justice.gov.uk',
    password: defaultPassword,
    type: 'CTSC_ADMIN',
  },
  hearingCenterAdminLocal: {
    email: 'hearing-centre-admin-01@example.com',
    password: defaultPassword,
    type: 'caseworker',
  },
  systemUpdate: {
    password: defaultPasswordSystemUser,
    email: 'civil-system-update@mailnesia.com',
    type: 'systemupdate',
  },
  systemUpdate2: {
    password: defaultPassword,
    email: 'hmcts.civil+organisation.1.superuser@gmail.com',
    type: 'systemupdate',
  },
  waTaskTypes: {
    defendantWelshRequest: 'defendantWelshRequest',
  },
  TestOutputDir: process.env.E2E_OUTPUT_DIR || 'test-results/functional',
  runningEnv: process.env.ENVIRONMENT,
  runWAApiTest: process.env.RUN_WA_API_TEST == 'true' || false,
  claimantSolicitorOrgId: process.env.ENVIRONMENT == 'demo' ? 'B04IXE4' : 'Q1KOKP2',
  defendant1SolicitorOrgId: process.env.ENVIRONMENT == 'demo' ? 'DAWY9LJ' : '79ZRSOU',
  defendant2SolicitorOrgId: process.env.ENVIRONMENT =='demo' ? 'LCVTI1I' : 'H2156A0',
  defendantSelectedCourt:'Leeds Combined Court Centre - The Court House, 1 Oxford Row - LS1 3BG',
  claimantLRSelectedCourt:'Leeds Combined Court Centre - The Court House, 1 Oxford Row - LS1 3BG',
  eaCourt:'Clerkenwell and Shoreditch County Court and Family Court - 29-41 Gee Street - EC1V 3RE',
  nonEaCourt:'Central London County Court - Thomas More Building, Royal Courts of Justice, Strand, London - WC2A 2LL',
  gaCourtToBeSelected:'Birmingham Civil and Family Justice Centre - Priory Courts, 33 Bull Street - B4 6DS',
  localMediationTests: false,
  localNoCTests: false,
  hwfEvents: {
    updateHWFNumber: 'UPDATE_HELP_WITH_FEE_NUMBER',
    partRemission: 'PARTIAL_REMISSION_HWF_GRANTED',
    fullRemission: 'FULL_REMISSION_HWF',
    noRemission: 'NO_REMISSION',
    invalidHWFRef: 'INVALID_HWF_REFERENCE',
    moreInfoHWF: 'MORE_INFORMATION_HWF',
    feePayOutcome: 'FEE_PAYMENT_OUTCOME',
  },
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
    rejectAllDisputeAllWithIndividual: 'REJECT_ALL_DISPUTE_ALL_INDIVIDUAL',
    rejectAllAlreadyPaidNotFullWithIndividual: 'REJECT_ALL_ALREADY_PAID_NOT_FULL_INDIVIDUAL',
    rejectAllAlreadyPaidInFullWithIndividual: 'REJECT_ALL_ALREADY_PAID_IN_FULL_INDIVIDUAL',
    admitAllPayImmediateWithIndividual: 'FULLADMIT_PAY_IMMEDIATELY_INDIVIDUAL',
    admitAllPayBySetDateWithIndividual: 'FULLADMIT_PAY_BY_SET_DATE_INDIVIDUAL',
    admitAllPayByInstallmentWithIndividual: 'FULLADMIT_PAY_BY_INSTALMENTS_INDIVIDUAL',
    partAdmitAmountPaidWithIndividual: 'PART_ADMIT_ALREADY_PAID_INDIVIDUAL',
    partAdmitHaventPaidPartiallyWantsToPayImmediatelyWithIndividual: 'PART_ADMIT_PAY_IMMEDIATELY_INDIVIDUAL',
    partAdmitWithPartPaymentOnSpecificDateWithIndividual: 'PART_ADMIT_PAY_BY_SET_DATE_INDIVIDUAL',
    partAdmitWithPartPaymentAsPerInstallmentPlanWithIndividual: 'PART_ADMIT_PAY_BY_INSTALLMENTS_INDIVIDUAL',
    rejectAllSmallClaimsCarm: 'REJECT_ALL_CARM',
    rejectAllIntermediateTrackMinti: 'REJECT_ALL_INT',
    rejectAllMultiTrackMinti: 'REJECT_ALL_MULTI',
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
