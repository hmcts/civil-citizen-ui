import {Response} from 'express';
import totalAmountController from '../../../../../main/routes/features/claim/totalAmountController';
import * as claimFeeService from 'services/features/claim/amount/claimFeesService';
import {CLAIMANT_TASK_LIST_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('services/features/claim/amount/claimFeesService');

describe('Total amount', () => {
  const getHandler = getRouteHandler(totalAmountController, 'get');
  const postHandler = getRouteHandler(totalAmountController, 'post');
  const viewPath = 'features/claim/total-amount';
  const pageTitle = 'PAGES.TOTAL_AMOUNT.PAGE_TITLE';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      session: createMockSession({user: {id: 'user-id'}}),
      body: {},
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    const claim = new Claim();
    claim.draftClaimCreatedAt = new Date();
    claim.totalClaimAmount = 1000;
    (getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);
    (claimFeeService.saveClaimFee as jest.Mock).mockResolvedValue(undefined);
    jest
      .spyOn(CivilServiceClient.prototype, 'getClaimFeeData')
      .mockResolvedValue({calculatedAmountInPence: '50'} as never);
    jest
      .spyOn(CivilServiceClient.prototype, 'getHearingAmount')
      .mockResolvedValue({calculatedAmountInPence: '50'} as never);
  });

  describe('on GET', () => {
    it('should render total amount page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        form: expect.objectContaining({
          claimAmount: '1000.00',
        }),
      }));
      expect(claimFeeService.saveClaimFee).toHaveBeenCalled();
    });

    it('should call next when claim amount fee get fails', async () => {
      const error = new Error('test error');
      jest.spyOn(CivilServiceClient.prototype, 'getClaimFeeData').mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should redirect to the claimant task list', async () => {
      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(CLAIMANT_TASK_LIST_URL);
    });
  });
});
