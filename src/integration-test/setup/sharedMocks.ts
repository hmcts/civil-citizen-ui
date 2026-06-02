const launchDarklyClientMock = {
  isServiceShuttered: jest.fn().mockResolvedValue(false),
  updateE2EKey: jest.fn().mockResolvedValue(undefined),
  isDashboardEnabledForCase: jest.fn().mockResolvedValue(false),
  isCarmEnabledForCase: jest.fn().mockResolvedValue(false),
  isMintiEnabledForCase: jest.fn().mockResolvedValue(false),
  isGaForLipsEnabled: jest.fn().mockResolvedValue(false),
  isQueryManagementEnabled: jest.fn().mockResolvedValue(false),
  isWelshEnabledForMainCase: jest.fn().mockResolvedValue(false),
  isJudgmentBufferEnabled: jest.fn().mockResolvedValue(false),
};

jest.mock('express-async-errors', () => ({}), {virtual: true});
jest.mock('@hmcts/nodejs-logging', () => ({
  Logger: {
    getLogger: jest.fn(() => ({
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    })),
  },
}));

export const civilServiceClientMock = {
  retrieveClaimDetails: jest.fn(),
  retrieveDashboard: jest.fn(),
  retrieveNotification: jest.fn(),
  retrieveGaNotification: jest.fn(),
  submitDefendantResponseEvent: jest.fn(),
  submitClaimantResponseEvent: jest.fn(),
  calculateExtendedResponseDeadline: jest.fn(),
  submitEvent: jest.fn(),
};

export const gaServiceClientMock = {
  getApplication: jest.fn(),
  submitApplication: jest.fn(),
};

export const paymentServiceMock = {
  getFeePaymentRedirectInformation: jest.fn(),
  getFeePaymentStatus: jest.fn(),
};

export const dmStoreClientMock = {
  retrieveDocumentByDocumentId: jest.fn(),
};

export const draftStoreServiceMock = {
  generateRedisKey: jest.fn(() => 'redis-claim'),
  generateRedisKeyForGA: jest.fn(() => 'redis-ga'),
  getCaseDataFromStore: jest.fn(),
  saveDraftClaim: jest.fn().mockResolvedValue(undefined),
};

export const gaHwFeesDraftStoreMock = {
  getDraftGAHWFDetails: jest.fn().mockResolvedValue({applyHelpWithFees: {option: undefined}}),
  saveDraftGAHWFDetails: jest.fn().mockResolvedValue(undefined),
};

export const generalApplicationServiceMock = {
  deleteGAFromClaimsByUserId: jest.fn().mockResolvedValue(undefined),
  getByIndex: jest.fn(),
  getApplicationFromGAService: jest.fn(),
  getCancelUrl: jest.fn().mockResolvedValue('/dashboard'),
  isConfirmYouPaidCCJAppType: jest.fn(),
  saveApplicationType: jest.fn().mockResolvedValue(undefined),
  validateAdditionalApplicationtType: jest.fn(),
  getDynamicHeaderForMultipleApplications: jest.fn(() => 'Application 1'),
  saveRespondentAgreement: jest.fn().mockResolvedValue(undefined),
};

export const feeDetailsServiceMock = {
  gaApplicationFeeDetails: jest.fn(),
};

export const gaHelpWithFeeServiceMock = {
  getRedirectUrl: jest.fn(),
};

export const gaConfirmationContentServiceMock = {
  getGeneralApplicationConfirmationContent: jest.fn().mockResolvedValue([{title: 'Confirmation content'}]),
};

export const gaResponseStoreServiceMock = {
  getDraftGARespondentResponse: jest.fn(),
};

export const checkAnswersResponseServiceMock = {
  getSummarySections: jest.fn((): unknown[] => []),
};

export const submitApplicationResponseServiceMock = {
  submitApplicationResponse: jest.fn().mockResolvedValue(undefined),
};

export const gaFeePaymentServiceMock = {
  getGaFeePaymentRedirectInformation: jest.fn(),
  getGaFeePaymentStatus: jest.fn(),
};

export const paymentSessionStoreServiceMock = {
  saveUserId: jest.fn().mockResolvedValue(undefined),
};

jest.mock('modules/oidc', () => ({
  OidcMiddleware: class {
    public enableFor(): void {
      // Intentionally no-op for integration harness.
    }
  },
}));

jest.mock('modules/helmet', () => ({
  Helmet: class {
    public enableFor(): void {
      // Intentionally no-op for integration harness.
    }
  },
}));

jest.mock('modules/draft-store', () => ({
  DraftStoreClient: class {
    public enableFor(): void {
      // Intentionally no-op for integration harness.
    }
  },
}));

jest.mock('modules/properties-volume', () => ({
  PropertiesVolume: class {
    public enableFor(): void {
      // Intentionally no-op for integration harness.
    }
  },
}));

jest.mock('modules/utilityService', () => {
  const actual = jest.requireActual('modules/utilityService');
  const session = require('express-session');
  return {
    ...actual,
    getClaimById: jest.fn(),
    getRedisStoreForSession: jest.fn(() => new session.MemoryStore()),
  };
});

jest.mock('modules/draft-store/draftStoreService', () => draftStoreServiceMock);
jest.mock('modules/draft-store/gaHwFeesDraftStore', () => gaHwFeesDraftStoreMock);
jest.mock('modules/draft-store/paymentSessionStoreService', () => paymentSessionStoreServiceMock);

jest.mock('services/features/generalApplication/generalApplicationService', () => generalApplicationServiceMock);
jest.mock('services/features/generalApplication/feeDetailsService', () => feeDetailsServiceMock);
jest.mock('services/features/generalApplication/applicationFee/generalApplicationFeePaymentService', () => gaFeePaymentServiceMock);
jest.mock('services/features/generalApplication/fee/helpWithFeeService', () => gaHelpWithFeeServiceMock);
jest.mock('services/features/generalApplication/submitGeneralApplicationConfirmationContent', () => gaConfirmationContentServiceMock);
jest.mock('services/features/generalApplication/response/generalApplicationResponseStoreService', () => gaResponseStoreServiceMock);
jest.mock('services/features/generalApplication/response/checkAnswersResponseService', () => checkAnswersResponseServiceMock);
jest.mock('services/features/generalApplication/response/submitApplicationResponse', () => submitApplicationResponseServiceMock);
jest.mock('services/features/generalApplication/response/generalApplicationResponseService', () => {
  const actual = jest.requireActual('services/features/generalApplication/response/generalApplicationResponseService');
  return {
    ...actual,
    getRespondToApplicationCaption: jest.fn(() => 'Respond to this application'),
    saveRespondentStatementOfTruth: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock('app/auth/launchdarkly/launchDarklyClient', () => launchDarklyClientMock);

jest.mock('client/civilServiceClient', () => ({
  CivilServiceClient: jest.fn().mockImplementation(() => civilServiceClientMock),
}));

jest.mock('client/gaServiceClient', () => ({
  GaServiceClient: jest.fn().mockImplementation(() => gaServiceClientMock),
}));

jest.mock('services/features/feePayment/feePaymentService', () => paymentServiceMock);

jest.mock('client/dmStoreClient', () => ({
  DmStoreClient: jest.fn().mockImplementation(() => dmStoreClientMock),
}));

