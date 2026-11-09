import {Response} from 'express';
import dashboardController from 'routes/features/dashboard/dashboardController';
import {CLAIMANT_TASK_LIST_URL, DASHBOARD_URL} from 'routes/urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import {getDraftClaimData} from 'services/dashboard/draftClaimService';
import {CASE_REFERENCE_COOKIE_NAME, setCaseReferenceCookie} from 'modules/cookie/caseReferenceCookie';
import {AppRequest, AppSession} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('client/civilServiceClient', () => {
  const methods = {
    getClaimsForClaimant: jest.fn(),
    getClaimsForDefendant: jest.fn(),
  };
  return {CivilServiceClient: jest.fn(() => methods)};
});
jest.mock('services/dashboard/draftClaimService');

const civilServiceMethods = new CivilServiceClient('http://localhost') as unknown as {
  getClaimsForClaimant: jest.Mock;
  getClaimsForDefendant: jest.Mock;
};

const claimantClaims = {
  claims: [{status: 'SETTLED', claimNumber: '256MC007'}],
  totalPages: 1,
};
const defendantClaims = {
  claims: [{status: 'JUDGMENT_BUFFER_ELIGIBLE', claimNumber: '256MC007', claimantName: 'Mr Baddy Bad'}],
  totalPages: 1,
};

const invoke = async (overrides: Record<string, unknown> = {}) => {
  const res = createMockResponse();
  const next = jest.fn();
  const session = createMockSession(
    (overrides.session as Partial<AppSession> | undefined) ?? {
      user: {id: 'user-1'},
      caseReference: '256MC007',
      firstContact: {claimId: 'claim-1', claimReference: 'ref-1'},
    },
  );
  await getRouteHandler(dashboardController, 'get', DASHBOARD_URL)(
    {
      params: {},
      body: {},
      query: {lang: 'en'},
      cookies: {[CASE_REFERENCE_COOKIE_NAME]: '256MC007', lang: 'en'},
      ...overrides,
      session,
    } as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next, session};
};

describe('Dashboard page', () => {
  beforeAll(() => {
    setCaseReferenceCookie({secure: false, maxAge: 1000});
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (getDraftClaimData as jest.Mock).mockResolvedValue({
      claimCreationUrl: '/eligibility',
      draftClaim: null,
    });
    civilServiceMethods.getClaimsForClaimant.mockResolvedValue(claimantClaims);
    civilServiceMethods.getClaimsForDefendant.mockResolvedValue(defendantClaims);
  });

  describe('on GET', () => {
    it('renders claimant and defendant claims and clears the case reference', async () => {
      const {res, session} = await invoke();

      expect(res.render).toHaveBeenCalledWith('features/dashboard/dashboard', expect.objectContaining({
        claimsAsClaimant: claimantClaims.claims,
        claimsAsDefendant: defendantClaims.claims,
        claimDraftSaved: null,
        newOcmcClaimUrl: '/eligibility',
        pageTitle: 'PAGES.DASHBOARD.PAGE_TITLE',
        lang: 'en',
        showUpdateStatus: false,
        responseDraftSaved: false,
        paginationArgumentClaimant: undefined,
        paginationArgumentDefendant: undefined,
      }));
      expect(session.caseReference).toBeUndefined();
      expect(session.firstContact.claimId).toBeUndefined();
      expect(session.firstContact.claimReference).toBeUndefined();
      expect(res.clearCookie).toHaveBeenCalledWith(CASE_REFERENCE_COOKIE_NAME, expect.objectContaining({
        path: '/',
        sameSite: 'lax',
        secure: false,
      }));
    });

    it('uses the cookie language when the query does not set one', async () => {
      const {res} = await invoke({
        query: {},
        cookies: {[CASE_REFERENCE_COOKIE_NAME]: '256MC007', lang: 'cy'},
      });

      expect(res.render).toHaveBeenCalledWith('features/dashboard/dashboard', expect.objectContaining({
        lang: 'cy',
        claimsAsDefendant: defendantClaims.claims,
      }));
    });

    it('sets showUpdateStatus when a claimant claim has no status', async () => {
      civilServiceMethods.getClaimsForClaimant.mockResolvedValue({
        claims: [{status: 'NO_STATUS', claimNumber: '256MC008'}],
        totalPages: 1,
      });

      const {res} = await invoke();

      expect(res.render).toHaveBeenCalledWith('features/dashboard/dashboard', expect.objectContaining({
        showUpdateStatus: true,
      }));
    });

    it('links a saved draft to the claimant task list', async () => {
      const draftClaim = {claimNumber: 'DRAFT1'};
      (getDraftClaimData as jest.Mock).mockResolvedValue({
        claimCreationUrl: '/eligibility',
        draftClaim,
      });

      const {res} = await invoke();

      expect(res.render).toHaveBeenCalledWith('features/dashboard/dashboard', expect.objectContaining({
        claimDraftSaved: draftClaim,
        newOcmcClaimUrl: CLAIMANT_TASK_LIST_URL,
      }));
    });

    it('builds pagination from the claimant and defendant page query', async () => {
      civilServiceMethods.getClaimsForClaimant.mockResolvedValue({claims: [], totalPages: 3});
      civilServiceMethods.getClaimsForDefendant.mockResolvedValue({claims: defendantClaims.claims, totalPages: 2});

      const {res} = await invoke({query: {lang: 'en', claimantPage: '2', defendantPage: '1'}});
      const view = res.render.mock.calls[0][1] as {
        paginationArgumentClaimant: {items: Array<{current: boolean}>};
        paginationArgumentDefendant: {items: Array<{current: boolean}>};
      };

      expect(view.paginationArgumentClaimant.items).toHaveLength(3);
      expect(view.paginationArgumentClaimant.items[1].current).toBe(true);
      expect(view.paginationArgumentDefendant.items).toHaveLength(2);
      expect(view.paginationArgumentDefendant.items[0].current).toBe(true);
    });

    it('calls next when civil service claims cannot be loaded', async () => {
      const error = new Error('civil service failure');
      civilServiceMethods.getClaimsForDefendant.mockRejectedValue(error);

      const {res, next} = await invoke();

      expect(next).toHaveBeenCalledWith(error);
      expect(res.render).not.toHaveBeenCalled();
    });
  });
});
