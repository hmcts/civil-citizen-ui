import {Response} from 'express';
import youHavePaidLessController from '../../../../../../../main/routes/features/response/admission/fullRejection/youHavePaidLessController';
import {RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');

describe('You Have Paid Less Controller', () => {
  const getHandler = getRouteHandler(youHavePaidLessController, 'get');
  const postHandler = getRouteHandler(youHavePaidLessController, 'post');
  const viewPath = 'features/response/admission/fullRejection/you-have-paid-less';
  const claimId = '12345';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetCaseData = getCaseDataFromStore as jest.Mock;
  const mockGenerateRedisKey = generateRedisKey as jest.Mock;

  const stubClaim = (): Claim => {
    const claim = new Claim();
    jest.spyOn(claim, 'getClaimantFullName').mockReturnValue('Mr. Jan Clark');
    return claim;
  };

  beforeEach(() => {
    req = {
      params: {id: claimId},
      session: createMockSession({user: {id: 'user-id'}}),
      body: {},
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    mockGenerateRedisKey.mockReturnValue(claimId);
    mockGetCaseData.mockResolvedValue(stubClaim());
  });

  describe('on GET', () => {
    it('should render you have paid less page successfully', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        claimantName: 'Mr. Jan Clark',
      }));
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('error');
      mockGetCaseData.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should redirect to claim task list', () => {
      postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });
  });
});
