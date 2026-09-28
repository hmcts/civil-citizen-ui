import {Response} from 'express';
import claimAmountBreakdownController from '../../../../../../main/routes/features/claim/amount/claimAmountBreakdownController';
import * as claimAmountbreakdownService
  from '../../../../../../main/services/features/claim/amount/claimAmountBreakdownService';
import {AmountBreakdown} from 'form/models/claim/amount/amountBreakdown';
import {ClaimAmountRow} from 'form/models/claim/amount/claimAmountRow';
import {CLAIM_INTEREST_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('../../../../../../main/services/features/claim/amount/claimAmountBreakdownService');

const mockServiceGet = claimAmountbreakdownService.getClaimAmountBreakdownForm as jest.Mock;

describe('claimAmountBreakdownController test', () => {
  const getHandler = getRouteHandler(claimAmountBreakdownController, 'get');
  const postHandler = getRouteHandler(claimAmountBreakdownController, 'post');
  const viewPath = 'features/claim/amount/claim-amount-breakdown';
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
    mockServiceGet.mockResolvedValue(new AmountBreakdown([new ClaimAmountRow(), new ClaimAmountRow()]));
    (claimAmountbreakdownService.saveClaimAmountBreakdownForm as jest.Mock).mockResolvedValue(undefined);
  });

  describe('On Get', () => {
    it('should render the claim amount page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.CLAIM_AMOUNT_BREAKDOWN.TITLE',
        form: expect.any(GenericForm),
      }));
    });

    it('should call next when the service throws', async () => {
      const error = new Error('error');
      mockServiceGet.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('On Post', () => {
    const correctData = {
      claimAmountRows: [
        {
          reason: 'lalala',
          amount: '1',
        },
      ],
      totalAmount: '1',
    };

    it('should re-render when there are validation errors', async () => {
      req.body = {
        claimAmountRows: [
          {
            reason: '',
            amount: '1',
          },
        ],
        totalAmount: '1',
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should redirect to the interest page when data is valid', async () => {
      req.body = correctData;

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(claimAmountbreakdownService.saveClaimAmountBreakdownForm).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(CLAIM_INTEREST_URL);
    });

    it('should call next when save fails', async () => {
      const error = new Error('error');
      (claimAmountbreakdownService.saveClaimAmountBreakdownForm as jest.Mock).mockRejectedValue(error);
      req.body = correctData;

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
