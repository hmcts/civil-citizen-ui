import {Request, Response} from 'express';
import dependantsController from '../../../../../../../main/routes/features/response/statementOfMeans/dependants/dependantsController';
import {
  CHILDREN_DISABILITY_URL,
  CITIZEN_DEPENDANTS_EDUCATION_URL,
  CITIZEN_OTHER_DEPENDANTS_URL,
} from 'routes/urls';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';
import {Claim} from 'models/claim';
import {StatementOfMeans} from 'models/statementOfMeans';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');

describe('Citizen dependants', () => {
  const getHandler = getRouteHandler(dependantsController, 'get');
  const postHandler = getRouteHandler(dependantsController, 'post');
  const viewPath = 'features/response/statementOfMeans/dependants/dependants';
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const mockGenerateRedisKey = draftStoreService.generateRedisKey as jest.Mock;
  const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

  const claimWithDisability = (disability: YesNo, severeDisability?: YesNo): Claim => {
    const claim = new Claim();
    claim.statementOfMeans = new StatementOfMeans();
    claim.statementOfMeans.disability = new GenericYesNo(disability);
    if (severeDisability) {
      claim.statementOfMeans.severeDisability = new GenericYesNo(severeDisability);
    }
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
    it('should render the dependants page', async () => {
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
    it('should redirect to other dependants when children under 11 are given and none are treated as disabled', async () => {
      mockGetCaseData.mockResolvedValue(claimWithDisability(YesNo.YES, YesNo.YES));
      req.body = {declared: 'yes', under11: '1'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_OTHER_DEPENDANTS_URL));
    });

    it('should redirect to children disability when children under 11 are given and the defendant is not disabled', async () => {
      mockGetCaseData.mockResolvedValue(claimWithDisability(YesNo.NO));
      req.body = {declared: 'yes', under11: '1'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CHILDREN_DISABILITY_URL));
    });

    it('should redirect to dependants education when children aged 16 to 19 are given', async () => {
      req.body = {declared: 'yes', between16and19: '1'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_DEPENDANTS_EDUCATION_URL));
    });

    it('should re-render when yes is selected and no number is entered', async () => {
      req.body = {declared: 'yes', under11: ''};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.anything()}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveDraftClaim).not.toHaveBeenCalled();
    });

    it('should re-render when the under 11 number is negative', async () => {
      req.body = {declared: 'yes', under11: '-1'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should re-render when the 11 to 15 number is negative', async () => {
      req.body = {declared: 'yes', between11and15: '-1'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should re-render when the 16 to 19 number is not a whole number', async () => {
      req.body = {declared: 'yes', between16and19: '1.5'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should call next when saving fails', async () => {
      const error = new Error('redis failure');
      mockGetCaseData.mockRejectedValue(error);
      req.body = {declared: 'yes', under11: '1'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
