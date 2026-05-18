const launchDarklyClientMock = {
  isServiceShuttered: jest.fn().mockResolvedValue(false),
  updateE2EKey: jest.fn().mockResolvedValue(undefined),
  isCarmEnabledForCase: jest.fn().mockResolvedValue(false),
  isGaForLipsEnabled: jest.fn().mockResolvedValue(false),
  isQueryManagementEnabled: jest.fn().mockResolvedValue(false),
  isWelshEnabledForMainCase: jest.fn().mockResolvedValue(false),
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

