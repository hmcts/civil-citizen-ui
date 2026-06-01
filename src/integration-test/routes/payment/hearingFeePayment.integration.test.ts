import request from 'supertest';
process.env.NODE_ENV = 'test';
import '../../setup/testSetup';
import {app} from '../../../main/app';
import {
  DASHBOARD_CLAIMANT_URL,
  DEFENDANT_SUMMARY_URL,
  HEARING_FEE_APPLY_HELP_FEE_SELECTION,
  HEARING_FEE_CANCEL_JOURNEY,
  HEARING_FEE_CONFIRMATION_URL,
  HEARING_FEE_MAKE_PAYMENT_AGAIN_URL,
  HEARING_FEE_PAYMENT_CONFIRMATION_URL,
  PAY_HEARING_FEE_SUCCESSFUL_URL,
  PAY_HEARING_FEE_UNSUCCESSFUL_URL,
  PAY_HEARING_FEE_URL,
} from '../../../main/routes/urls';
import {civilServiceClientMock, paymentServiceMock} from '../../setup/sharedMocks';
import {CaseRole} from '../../../main/common/form/models/caseRoles';
import {FeeType} from '../../../main/common/form/models/helpWithFees/feeType';
import {Claim} from '../../../main/common/models/claim';
import {CaseProgressionHearing} from '../../../main/common/models/caseProgression/caseProgressionHearing';
import {HearingFee, HearingFeeInformation} from '../../../main/common/models/caseProgression/hearingFee/hearingFee';
import {constructResponseUrlWithIdParams} from '../../../main/common/utils/urlFormatter';

const CLAIM_ID = '1640995200000000';
const SESSION_USER_ID = 'integration-user';
const PAYMENT_REFERENCE = 'RC-1640-9952-0000-0001';
const GATEWAY_NEXT_URL = 'https://card.payments.service.gov.uk/secure/next';
const NEW_GATEWAY_NEXT_URL = 'https://card.payments.service.gov.uk/secure/retry';

const route = (url: string, claimId = CLAIM_ID): string => url.replace(':id', claimId);

/**
 * Injects a session user immediately after express-session so the real payment
 * services (which read req.session.user.id) can run end-to-end in the harness.
 */
const injectSessionUser = (): void => {
  const expressApp = app as unknown as {
    router?: {stack: Array<{name?: string; handle?: {name?: string}}>};
    _router?: {stack: Array<{name?: string; handle?: {name?: string}}>};
  };
  const router = expressApp.router ?? expressApp._router;
  const stack = router.stack;
  if (stack.some((layer) => layer.handle?.name === 'sessionUserInjector')) {
    return;
  }
  const sessionLayerIndex = stack.findIndex((layer) => (layer.handle?.name ?? layer.name) === 'session');
  const sessionUserInjector = (req: {session?: {user?: unknown}}, _res: unknown, next: () => void): void => {
    if (req.session) {
      req.session.user = {
        accessToken: 'token',
        idToken: 'token',
        email: '',
        familyName: '',
        givenName: '',
        roles: [],
        id: SESSION_USER_ID,
      };
    }
    next();
  };
  app.use(sessionUserInjector as never);
  const injectorLayer = stack.pop();
  stack.splice(sessionLayerIndex + 1, 0, injectorLayer);
};

const createDraftStoreClient = (claim: Claim | undefined) => ({
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(claim ? JSON.stringify({id: claim.id, case_data: claim}) : null)),
  del: jest.fn(() => Promise.resolve({})),
  ttl: jest.fn(() => Promise.resolve({})),
  expireat: jest.fn(() => Promise.resolve({})),
});

const setDraftClaim = (claim: Claim | undefined) => {
  app.locals.draftStoreClient = createDraftStoreClient(claim);
};

const buildStartScreenClaim = (caseRole: CaseRole): Claim => {
  const claim = new Claim();
  claim.id = CLAIM_ID;
  claim.legacyCaseReference = CLAIM_ID;
  claim.caseRole = caseRole;
  claim.totalClaimAmount = 1500;
  claim.caseProgressionHearing = new CaseProgressionHearing(
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    new HearingFeeInformation(
      Object.assign(new HearingFee(), {calculatedAmountInPence: '12300', code: 'FEE0441', version: '1'}),
      new Date('2025-04-12T00:00:00.000Z'),
    ),
  );
  return claim;
};

const buildClaimWithPaymentInfo = (overrides: Partial<{paymentReference: string; nextUrl: string}> = {}): Claim => {
  const claim = new Claim();
  claim.id = CLAIM_ID;
  claim.legacyCaseReference = CLAIM_ID;
  claim.caseRole = CaseRole.CLAIMANT;
  claim.totalClaimAmount = 1500;
  claim.caseProgression = {
    hearing: {
      paymentInformation: {
        paymentReference: overrides.paymentReference ?? PAYMENT_REFERENCE,
        nextUrl: overrides.nextUrl ?? GATEWAY_NEXT_URL,
      },
    },
  } as never;
  return claim;
};

const buildClaimWithoutPaymentInfo = (): Claim => {
  const claim = new Claim();
  claim.id = CLAIM_ID;
  claim.legacyCaseReference = CLAIM_ID;
  claim.caseRole = CaseRole.CLAIMANT;
  claim.totalClaimAmount = 1500;
  claim.caseProgression = {hearing: {}} as never;
  return claim;
};

beforeAll(() => {
  injectSessionUser();
});

describe('Integration: hearing fee payment journey', () => {
  beforeEach(() => {
    setDraftClaim(undefined);
  });

  describe('pay hearing fee start screen', () => {
    it('renders the start screen with the claimant dashboard as cancel target', async () => {
      const claim = buildStartScreenClaim(CaseRole.CLAIMANT);
      civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(claim);

      const res = await request(app).get(route(PAY_HEARING_FEE_URL)).expect(200);

      expect(res.text).toContain('Pay hearing fee');
      expect(res.text).toContain(route(DASHBOARD_CLAIMANT_URL));
      expect(res.text).toContain(route(HEARING_FEE_APPLY_HELP_FEE_SELECTION));
    });

    it('uses the defendant summary as dashboard target for a defendant', async () => {
      const claim = buildStartScreenClaim(CaseRole.DEFENDANT);
      civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(claim);

      const res = await request(app).get(route(PAY_HEARING_FEE_URL)).expect(200);

      expect(res.text).toContain(route(DEFENDANT_SUMMARY_URL));
    });

    it('returns the error page when the claim cannot be retrieved', async () => {
      civilServiceClientMock.retrieveClaimDetails.mockRejectedValue({response: {status: 404}});

      await request(app).get(route(PAY_HEARING_FEE_URL)).expect(500);
    });
  });

  describe('payment confirmation redirect (gateway callback)', () => {
    beforeEach(() => {
      setDraftClaim(buildClaimWithPaymentInfo());
      civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(buildClaimWithPaymentInfo());
    });

    it('clears the payment session and redirects to the success page when the payment succeeded', async () => {
      paymentServiceMock.getFeePaymentStatus.mockResolvedValue({status: 'Success'});

      const res = await request(app).get(route(HEARING_FEE_PAYMENT_CONFIRMATION_URL)).expect(302);

      expect(res.header.location).toEqual(route(PAY_HEARING_FEE_SUCCESSFUL_URL));
      expect(paymentServiceMock.getFeePaymentStatus).toHaveBeenCalledWith(
        CLAIM_ID,
        PAYMENT_REFERENCE,
        FeeType.HEARING,
        expect.anything(),
      );
      expect(app.locals.draftStoreClient.del).toHaveBeenCalledWith(CLAIM_ID + FeeType.HEARING + 'userIdForPayment');
    });

    it('redirects to the unsuccessful page when the payment failed', async () => {
      paymentServiceMock.getFeePaymentStatus.mockResolvedValue({
        status: 'Failed',
        errorDescription: 'Payment method rejected',
      });

      const res = await request(app).get(route(HEARING_FEE_PAYMENT_CONFIRMATION_URL)).expect(302);

      expect(res.header.location).toEqual(route(PAY_HEARING_FEE_UNSUCCESSFUL_URL));
    });

    it('redirects to the help-with-fees selection when the user cancelled the payment', async () => {
      paymentServiceMock.getFeePaymentStatus.mockResolvedValue({
        status: 'Failed',
        errorDescription: 'Payment was cancelled by the user',
      });

      const res = await request(app).get(route(HEARING_FEE_PAYMENT_CONFIRMATION_URL)).expect(302);

      expect(res.header.location).toEqual(route(HEARING_FEE_APPLY_HELP_FEE_SELECTION));
    });

    it('redirects to the help-with-fees selection for any other (pending/created) status', async () => {
      paymentServiceMock.getFeePaymentStatus.mockResolvedValue({status: 'Initiated'});

      const res = await request(app).get(route(HEARING_FEE_PAYMENT_CONFIRMATION_URL)).expect(302);

      expect(res.header.location).toEqual(route(HEARING_FEE_APPLY_HELP_FEE_SELECTION));
    });
  });

  describe('make payment again', () => {
    it('reuses the existing in-flight session and goes to confirmation when it already succeeded', async () => {
      setDraftClaim(buildClaimWithPaymentInfo());
      paymentServiceMock.getFeePaymentStatus.mockResolvedValue({status: 'Success'});

      const res = await request(app).get(route(HEARING_FEE_MAKE_PAYMENT_AGAIN_URL)).expect(302);

      expect(res.header.location).toEqual(constructResponseUrlWithIdParams(CLAIM_ID, HEARING_FEE_PAYMENT_CONFIRMATION_URL));
      expect(paymentServiceMock.getFeePaymentRedirectInformation).not.toHaveBeenCalled();
    });

    it('redirects back to the existing gateway url when the session is still pending', async () => {
      setDraftClaim(buildClaimWithPaymentInfo());
      paymentServiceMock.getFeePaymentStatus.mockResolvedValue({status: 'Created'});

      const res = await request(app).get(route(HEARING_FEE_MAKE_PAYMENT_AGAIN_URL)).expect(302);

      expect(res.header.location).toEqual(GATEWAY_NEXT_URL);
    });

    it('creates a fresh payment when the existing session has failed', async () => {
      setDraftClaim(buildClaimWithPaymentInfo());
      paymentServiceMock.getFeePaymentStatus.mockResolvedValue({status: 'Failed'});
      paymentServiceMock.getFeePaymentRedirectInformation.mockResolvedValue({
        paymentReference: 'RC-new',
        nextUrl: NEW_GATEWAY_NEXT_URL,
      });

      const res = await request(app).get(route(HEARING_FEE_MAKE_PAYMENT_AGAIN_URL)).expect(302);

      expect(res.header.location).toEqual(NEW_GATEWAY_NEXT_URL);
      expect(paymentServiceMock.getFeePaymentRedirectInformation).toHaveBeenCalledWith(CLAIM_ID, FeeType.HEARING, expect.anything());
    });

    it('creates a new payment session when there is no in-flight payment', async () => {
      setDraftClaim(buildClaimWithoutPaymentInfo());
      paymentServiceMock.getFeePaymentRedirectInformation.mockResolvedValue({
        paymentReference: 'RC-fresh',
        nextUrl: NEW_GATEWAY_NEXT_URL,
      });
      paymentServiceMock.getFeePaymentStatus.mockResolvedValue({status: 'Created'});

      const res = await request(app).get(route(HEARING_FEE_MAKE_PAYMENT_AGAIN_URL)).expect(302);

      expect(res.header.location).toEqual(NEW_GATEWAY_NEXT_URL);
    });

    it('falls back to help-with-fees selection when the payment service is unavailable (sync error)', async () => {
      setDraftClaim(buildClaimWithoutPaymentInfo());
      civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(buildClaimWithoutPaymentInfo());
      paymentServiceMock.getFeePaymentRedirectInformation.mockRejectedValue(new Error('payment service down'));

      const res = await request(app).get(route(HEARING_FEE_MAKE_PAYMENT_AGAIN_URL)).expect(302);

      expect(res.header.location).toEqual(constructResponseUrlWithIdParams(CLAIM_ID, HEARING_FEE_APPLY_HELP_FEE_SELECTION));
    });
  });

  describe('payment unsuccessful page', () => {
    it('renders the unsuccessful page with a retry link', async () => {
      setDraftClaim(buildClaimWithPaymentInfo());

      const res = await request(app).get(route(PAY_HEARING_FEE_UNSUCCESSFUL_URL)).expect(200);

      expect(res.text).toContain('Your payment was unsuccessful');
      expect(res.text).toContain(route(HEARING_FEE_MAKE_PAYMENT_AGAIN_URL));
    });
  });

  describe('cancel hearing fee journey', () => {
    it('clears the draft and redirects to the claimant dashboard', async () => {
      setDraftClaim(buildClaimWithPaymentInfo());

      const res = await request(app).get(route(HEARING_FEE_CANCEL_JOURNEY)).expect(302);

      expect(res.header.location).toEqual(route(DASHBOARD_CLAIMANT_URL));
      expect(app.locals.draftStoreClient.del).toHaveBeenCalled();
    });
  });

  describe('hearing fee confirmation page (help with fees)', () => {
    it('renders the confirmation with the help-with-fees reference number', async () => {
      const claim = buildClaimWithPaymentInfo();
      (claim.caseProgression as never as {helpFeeReferenceNumberForm: {referenceNumber: string}}).helpFeeReferenceNumberForm = {
        referenceNumber: 'HWF-A1B-2C3',
      };
      setDraftClaim(claim);

      const res = await request(app).get(route(HEARING_FEE_CONFIRMATION_URL)).expect(200);

      expect(res.text).toContain('HWF-A1B-2C3');
    });
  });
});
