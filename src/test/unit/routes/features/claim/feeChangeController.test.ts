import {Response} from 'express';
import feeChangeController from '../../../../../main/routes/features/claim/feeChangeController';
import {CLAIMANT_TASK_LIST_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {getClaimById} from 'modules/utilityService';
import {getDraftClaimData} from 'services/dashboard/draftClaimService';
import {calculateInterestToDate} from 'common/utils/interestUtils';
import {CivilServiceClient} from 'client/civilServiceClient';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));
jest.mock('services/dashboard/draftClaimService', () => ({
  getDraftClaimData: jest.fn(),
}));
jest.mock('common/utils/interestUtils', () => ({
  calculateInterestToDate: jest.fn(),
}));

describe('Claim Fee Change Controller', () => {
  const getHandler = getRouteHandler(feeChangeController, 'get');
  const viewPath = 'features/claim/fee-change';
  const claimId = 'claim-id';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetClaimById = getClaimById as jest.Mock;
  const mockGetDraftClaimData = getDraftClaimData as jest.Mock;
  const mockCalculateInterestToDate = calculateInterestToDate as jest.Mock;

  beforeEach(() => {
    req = {
      params: {id: claimId},
      session: createMockSession({user: {id: 'user-id'}}),
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    const claim = new Claim();
    claim.totalClaimAmount = 1000;
    mockGetClaimById.mockResolvedValue(claim);
    mockCalculateInterestToDate.mockResolvedValue(0);
    jest.spyOn(CivilServiceClient.prototype, 'getClaimFeeData').mockResolvedValue({
      calculatedAmountInPence: 8000,
      code: '110',
      version: 1,
    } as never);
  });

  describe('on GET', () => {
    it('should render the fee change page with the OCMC URL when there is no draft claim', async () => {
      mockGetDraftClaimData.mockResolvedValue({
        claimCreationUrl: 'testOcmcUrl',
        draftClaim: undefined,
      });

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, {
        claimFee: 80,
        redirectUrl: 'testOcmcUrl',
        pageTitle: 'PAGES.FEE_CHANGE.PAGE_TITLE',
      });
    });

    it('should render the fee change page with the task list URL when a draft claim exists', async () => {
      mockGetDraftClaimData.mockResolvedValue({
        claimCreationUrl: 'testOcmcUrl',
        draftClaim: {claimId: 'draftClaim'},
      });

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, {
        claimFee: 80,
        redirectUrl: CLAIMANT_TASK_LIST_URL,
        pageTitle: 'PAGES.FEE_CHANGE.PAGE_TITLE',
      });
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('error');
      mockGetClaimById.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
