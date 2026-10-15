import {Response} from 'express';
import expertGuidanceController from '../../../../../../main/routes/features/directionsQuestionnaire/experts/expertGuidanceController';
import {PERMISSION_FOR_EXPERT_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');

describe('Using an expert in small claims', () => {
  const getHandler = getRouteHandler(expertGuidanceController, 'get');
  const postHandler = getRouteHandler(expertGuidanceController, 'post');
  const viewPath = 'features/directionsQuestionnaire/experts/expert-guidance';
  const claimId = '12345';
  let req: {params: {id: string}; body: Record<string, unknown>};
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;

  beforeEach(() => {
    req = {params: {id: claimId}, body: {}};
    res = createMockResponse();
    next = jest.fn();
    (draftStoreService.generateRedisKey as jest.Mock).mockReturnValue(claimId);
    mockGetCaseData.mockResolvedValue(new Claim());
    (draftStoreService.saveDraftClaim as jest.Mock).mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render the expert guidance page', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.EXPERT_GUIDANCE.PAGE_TITLE',
      }));
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.not.objectContaining({form: expect.anything()}));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('redis failure');
      mockGetCaseData.mockRejectedValue(error);

      await getHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should redirect to the permission for expert page', async () => {
      await postHandler(req as never, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, PERMISSION_FOR_EXPERT_URL));
    });
  });
});
