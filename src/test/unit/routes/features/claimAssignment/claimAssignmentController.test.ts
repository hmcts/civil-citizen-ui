import {Response} from 'express';
import assignClaimController from 'routes/features/claimAssignment/assignClaimController';
import {ASSIGN_CLAIM_URL, DASHBOARD_URL} from 'routes/urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import {getClaimById} from 'modules/utilityService';
import {deleteDraftClaimFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'common/models/claim';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('client/civilServiceClient', () => {
  const methods = {
    assignDefendantToClaim: jest.fn(),
  };
  return {CivilServiceClient: jest.fn(() => methods)};
});
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));
jest.mock('modules/draft-store/draftStoreService', () => ({
  deleteDraftClaimFromStore: jest.fn(),
}));

const civilServiceMethods = new CivilServiceClient('http://localhost') as unknown as {
  assignDefendantToClaim: jest.Mock;
};

const claimId = '123';

const assignedClaim = (): Claim => {
  const claim = new Claim();
  claim.respondent1PinToPostLRspec = {accessCode: 'pin-code'} as Claim['respondent1PinToPostLRspec'];
  return claim;
};

const invoke = async (session: Record<string, unknown>) => {
  const res = createMockResponse();
  const req = {
    params: {},
    body: {},
    query: {},
    cookies: {},
    session: createMockSession(session),
  };
  await getRouteHandler(assignClaimController, 'get', ASSIGN_CLAIM_URL)(
    req as unknown as AppRequest,
    res as unknown as Response,
    jest.fn(),
  );
  return {res, req};
};

describe('claim assignment controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getClaimById as jest.Mock).mockResolvedValue(assignedClaim());
    (deleteDraftClaimFromStore as jest.Mock).mockResolvedValue(undefined);
    civilServiceMethods.assignDefendantToClaim.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should assign the claim to the defendant and redirect to the dashboard', async () => {
      const {res, req} = await invoke({
        user: {id: 'user-1'},
        firstContact: {claimId},
      });

      expect(getClaimById).toHaveBeenCalledWith(claimId, expect.anything(), false);
      expect(civilServiceMethods.assignDefendantToClaim).toHaveBeenCalledWith(claimId, expect.anything(), 'pin-code');
      expect(deleteDraftClaimFromStore).toHaveBeenCalledWith(claimId);
      expect(res.redirect).toHaveBeenCalledWith(DASHBOARD_URL);
      expect(req.session.firstContact).toEqual({});
    });

    it('should redirect to the dashboard without calling civil service when there is no claim id', async () => {
      const {res} = await invoke({user: {id: 'user-1'}});

      expect(getClaimById).not.toHaveBeenCalled();
      expect(civilServiceMethods.assignDefendantToClaim).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(DASHBOARD_URL);
    });

    it('should still redirect to the dashboard when assigning the claim fails', async () => {
      (getClaimById as jest.Mock).mockRejectedValue(new Error('Test error'));

      const {res} = await invoke({
        user: {id: 'user-1'},
        firstContact: {claimId},
      });

      expect(civilServiceMethods.assignDefendantToClaim).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(DASHBOARD_URL);
    });
  });
});
