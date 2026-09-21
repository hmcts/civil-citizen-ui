import {Response} from 'express';
import helpWithFeesController from '../../../../../../main/routes/features/claim/details/helpWithFeesController';
import {CLAIM_TOTAL_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {YesNo} from 'form/models/yesNo';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {getClaimDetails, saveClaimDetails} from 'services/features/claim/details/claimDetailsService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('services/features/claim/details/claimDetailsService', () => ({
  getClaimDetails: jest.fn(),
  saveClaimDetails: jest.fn(),
}));

describe('Claim Details - Help With Fees', () => {
  const getHandler = getRouteHandler(helpWithFeesController, 'get');
  const postHandler = getRouteHandler(helpWithFeesController, 'post');
  const viewPath = 'features/claim/details/help-with-fees';
  const pageTitle = 'PAGES.HELP_WITH_FEES.PAGE_TITLE';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetClaimDetails = getClaimDetails as jest.Mock;
  const mockSaveClaimDetails = saveClaimDetails as jest.Mock;

  beforeEach(() => {
    req = {
      session: createMockSession({user: {id: 'user-id'}}),
      body: {},
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    mockGetClaimDetails.mockResolvedValue(new ClaimDetails());
    mockSaveClaimDetails.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render Help With Fees page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        form: expect.any(GenericForm),
      }));
    });

    it('should call next when loading claim details fails', async () => {
      const error = new Error('error');
      mockGetClaimDetails.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should redirect to total page when NO is selected', async () => {
      req.body = {option: YesNo.NO};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveClaimDetails).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(CLAIM_TOTAL_URL);
    });

    it('should redirect to total page when YES is selected', async () => {
      req.body = {option: YesNo.YES, referenceNumber: 'test'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(CLAIM_TOTAL_URL);
    });

    it('should re-render if no radio button is selected', async () => {
      req.body = {option: ''};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should re-render if Yes is selected and reference number is empty', async () => {
      req.body = {option: YesNo.YES};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should call next when save fails', async () => {
      const error = new Error('error');
      mockSaveClaimDetails.mockRejectedValue(error);
      req.body = {option: YesNo.NO};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
