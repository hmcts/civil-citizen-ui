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
  isBreathingSpaceEnabled: jest.fn().mockResolvedValue(false),
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
  recordClick: jest.fn().mockResolvedValue(undefined),
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
  generateRedisKey: jest.fn(() => 'test-redis-key'),
  generateRedisKeyForGA: jest.fn(() => 'redis-ga'),
  getCaseDataFromStore: jest.fn(),
  saveDraftClaim: jest.fn().mockResolvedValue(undefined),
  updateFieldDraftClaimFromStore: jest.fn().mockResolvedValue(undefined),
  deleteFieldDraftClaimFromStore: jest.fn().mockResolvedValue(undefined),
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

export const dashboardServiceMock = {
  getNotifications: jest.fn(),
  getDashboardForm: jest.fn(),
  extractOrderDocumentIdFromNotification: jest.fn(),
  getContactCourtLink: jest.fn(),
  getHelpSupportTitle: jest.fn(),
  getHelpSupportLinks: jest.fn(),
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
    getRedisStoreForSession: jest.fn(() => new session.MemoryStore()),
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

