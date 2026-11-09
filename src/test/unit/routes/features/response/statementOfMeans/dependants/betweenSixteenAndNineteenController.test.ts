import {Request, Response} from 'express';
import betweenSixteenAndNineteenController from '../../../../../../../main/routes/features/response/statementOfMeans/dependants/betweenSixteenAndNineteenController';
import {CHILDREN_DISABILITY_URL, CITIZEN_OTHER_DEPENDANTS_URL} from 'routes/urls';
import {Dependants} from 'form/models/statementOfMeans/dependants/dependants';
import {NumberOfChildren} from 'form/models/statementOfMeans/dependants/numberOfChildren';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';
import {Claim} from 'models/claim';
import {StatementOfMeans} from 'models/statementOfMeans';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');

describe('Dependant Teenagers', () => {
  const getHandler = getRouteHandler(betweenSixteenAndNineteenController, 'get');
  const postHandler = getRouteHandler(betweenSixteenAndNineteenController, 'post');
  const viewPath = 'features/response/statementOfMeans/dependants/between_16_and_19';
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const mockGenerateRedisKey = draftStoreService.generateRedisKey as jest.Mock;
  const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

  const claimWhereChildrenMayBeDisabled = (): Claim => {
    const claim = new Claim();
    claim.statementOfMeans = new StatementOfMeans();
    claim.statementOfMeans.disability = new GenericYesNo(YesNo.NO);
    claim.statementOfMeans.dependants = new Dependants(true, new NumberOfChildren(1));
    return claim;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    req = {params: {id: claimId}, body: {}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    mockGenerateRedisKey.mockReturnValue(claimId);
    mockGetCaseData.mockResolvedValue(new Claim());
    mockSaveDraftClaim.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render the dependant teenagers page', async () => {
      await getHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.anything()}));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('redis failure');
      mockGetCaseData.mockRejectedValue(error);

      await getHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when no number is entered', async () => {
      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.anything()}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveDraftClaim).not.toHaveBeenCalled();
    });

    it('should re-render when the number is negative', async () => {
      req.body = {value: -1, maxValue: 3};

      await postHandler(req as Request, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should re-render when the number is a decimal', async () => {
      req.body = {value: 1.3, maxValue: 3};

      await postHandler(req as Request, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should re-render when the number is greater than the maximum', async () => {
      req.body = {value: 4, maxValue: 3};

      await postHandler(req as Request, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should redirect to other dependants when children are not treated as disabled', async () => {
      req.body = {value: 1, maxValue: 3};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_OTHER_DEPENDANTS_URL));
    });

    it('should redirect to children disability when children are treated as disabled', async () => {
      mockGetCaseData.mockResolvedValue(claimWhereChildrenMayBeDisabled());
      req.body = {value: 1, maxValue: 3};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CHILDREN_DISABILITY_URL));
    });

    it('should call next when saving fails', async () => {
      const error = new Error('redis failure');
      mockGetCaseData.mockRejectedValue(error);
      req.body = {value: 1, maxValue: 3};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
