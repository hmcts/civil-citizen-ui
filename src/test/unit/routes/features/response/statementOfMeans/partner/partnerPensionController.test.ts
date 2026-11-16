import {Request, Response} from 'express';
import partnerPensionController from '../../../../../../../main/routes/features/response/statementOfMeans/partner/partnerPensionController';
import {CITIZEN_DEPENDANTS_URL, CITIZEN_PARTNER_DISABILITY_URL} from 'routes/urls';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';
import {Claim} from 'models/claim';
import {StatementOfMeans} from 'models/statementOfMeans';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');

describe('Partner Pension', () => {
  const getHandler = getRouteHandler(partnerPensionController, 'get');
  const postHandler = getRouteHandler(partnerPensionController, 'post');
  const viewPath = 'features/response/statementOfMeans/partner/partner-pension';
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const mockGenerateRedisKey = draftStoreService.generateRedisKey as jest.Mock;
  const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

  const claimWithDisability = (option: YesNo): Claim => {
    const claim = new Claim();
    claim.statementOfMeans = new StatementOfMeans();
    claim.statementOfMeans.disability = new GenericYesNo(option);
    return claim;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    req = {params: {id: claimId}, body: {}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    mockGenerateRedisKey.mockReturnValue(claimId);
    mockGetCaseData.mockResolvedValue(claimWithDisability(YesNo.YES));
    mockSaveDraftClaim.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render the partner pension page', async () => {
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
    it('should re-render when no option is selected', async () => {
      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.anything()}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveDraftClaim).not.toHaveBeenCalled();
    });

    it('should redirect to partner disability when no is selected and the defendant is disabled', async () => {
      req.body = {option: 'no'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_PARTNER_DISABILITY_URL));
    });

    it('should redirect to dependants when no is selected and the defendant is not disabled', async () => {
      mockGetCaseData.mockResolvedValue(claimWithDisability(YesNo.NO));
      req.body = {option: 'no'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_DEPENDANTS_URL));
    });

    it('should redirect to dependants when yes is selected and the defendant is not disabled', async () => {
      mockGetCaseData.mockResolvedValue(claimWithDisability(YesNo.NO));
      req.body = {option: 'yes'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_DEPENDANTS_URL));
    });

    it('should redirect to partner disability when yes is selected and the defendant is disabled', async () => {
      req.body = {option: 'yes'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_PARTNER_DISABILITY_URL));
    });

    it('should call next when saving fails', async () => {
      const error = new Error('redis failure');
      mockGetCaseData.mockRejectedValue(error);
      req.body = {option: 'no'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
