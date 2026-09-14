import {Response} from 'express';
import newResponseDeadlineController from '../../../../../../main/routes/features/response/responseDeadline/newResponseDeadlineController';
import {RESPONSE_TASK_LIST_URL, AGREED_TO_MORE_TIME_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  getClaimWithExtendedResponseDeadline,
  submitExtendedResponseDeadline,
} from 'services/features/response/responseDeadline/extendResponseDeadlineService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('services/features/response/responseDeadline/extendResponseDeadlineService');

const mockGetClaimWithExtendedResponseDeadline = getClaimWithExtendedResponseDeadline as jest.Mock;
const mockSubmitExtendedResponseDeadline = submitExtendedResponseDeadline as jest.Mock;

describe('Response - New response deadline', () => {
  const getHandler = getRouteHandler(newResponseDeadlineController, 'get');
  const postHandler = getRouteHandler(newResponseDeadlineController, 'post');
  const viewPath = 'features/response/responseDeadline/new-response-deadline';
  const claimId = '1234';
  const extendedDate = new Date(2022, 9, 31);
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;

  const buildClaim = (): Claim => {
    const claim = new Claim();
    claim.applicant1 = {
      partyDetails: {
        title: 'Mr',
        firstName: 'James',
        lastName: 'Bond',
      },
      type: PartyType.INDIVIDUAL,
    };
    claim.responseDeadline = {
      agreedResponseDeadline: extendedDate,
      calculatedResponseDeadline: extendedDate,
    };
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
    mockGetClaimWithExtendedResponseDeadline.mockResolvedValue(buildClaim());
    mockSubmitExtendedResponseDeadline.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render new deadline date', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        claimantName: 'Mr James Bond',
        responseDeadline: '31 October 2022',
        backUrl: constructResponseUrlWithIdParams(claimId, AGREED_TO_MORE_TIME_URL),
        isReleaseTwoEnabled: true,
      }));
    });

    it('should call next when proposed extended deadline does not exist', async () => {
      const error = new Error('No extended response deadline found');
      mockGetClaimWithExtendedResponseDeadline.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('error');
      mockGetClaimWithExtendedResponseDeadline.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should redirect to task list', async () => {
      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSubmitExtendedResponseDeadline).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should call next when submitting the extended deadline fails', async () => {
      const error = new Error('error');
      mockSubmitExtendedResponseDeadline.mockRejectedValue(error);

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
