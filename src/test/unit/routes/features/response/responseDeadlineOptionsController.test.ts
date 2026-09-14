import {Response} from 'express';
import responseDeadlineOptionsController from '../../../../../main/routes/features/response/responseDeadline/responseDeadlineOptionsController';
import {
  AGREED_TO_MORE_TIME_URL,
  RESPONSE_TASK_LIST_URL,
  REQUEST_MORE_TIME_URL,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {GenericForm} from 'form/models/genericForm';
import {ResponseOptions} from 'form/models/responseDeadline';
import {PartyType} from 'models/partyType';
import {getStashedClaimOrFromStore} from 'common/utils/claimRequestLocals';
import {ResponseDeadlineService} from 'services/features/response/responseDeadlineService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import * as launchDarklyClient from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('common/utils/claimRequestLocals', () => ({
  getStashedClaimOrFromStore: jest.fn(),
}));
jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');

describe('Response Deadline Options Controller', () => {
  const getHandler = getRouteHandler(responseDeadlineOptionsController, 'get');
  const postHandler = getRouteHandler(responseDeadlineOptionsController, 'post');
  const viewPath = 'features/response/response-deadline-options';
  const claimId = 'claim-id';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetStashedClaim = getStashedClaimOrFromStore as jest.Mock;

  const buildClaim = (): Claim => {
    const claim = new Claim();
    claim.applicant1 = {
      type: PartyType.INDIVIDUAL,
      partyDetails: {
        partyName: 'Joe Bloggs',
      },
    };
    jest.spyOn(claim, 'formattedResponseDeadline').mockReturnValue('15 May 2050');
    jest.spyOn(claim, 'getClaimantFullName').mockReturnValue('Joe Bloggs');
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
    mockGetStashedClaim.mockReset();
    mockGetStashedClaim.mockResolvedValue(buildClaim());
    (launchDarklyClient.isCuiGaNroEnabled as jest.Mock).mockResolvedValue(false);
    jest.spyOn(ResponseDeadlineService.prototype, 'saveDeadlineResponse').mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should call getStashedClaimOrFromStore only once per GET request', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockGetStashedClaim).toHaveBeenCalledTimes(1);
    });

    it('should render the page if response deadline option is not set', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
        claimantName: 'Joe Bloggs',
        responseDate: '15 May 2050',
      }));
    });

    it('should pass welsh translation via query', async () => {
      const claim = buildClaim();
      mockGetStashedClaim.mockResolvedValue(claim);
      req.query = {lang: 'cy'};

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(claim.formattedResponseDeadline).toHaveBeenCalledWith('cy');
    });

    it('should pass english translation via query', async () => {
      const claim = buildClaim();
      mockGetStashedClaim.mockResolvedValue(claim);
      req.query = {lang: 'en'};

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(claim.formattedResponseDeadline).toHaveBeenCalledWith('en');
    });

    it('should pass welsh translation via cookie', async () => {
      const claim = buildClaim();
      mockGetStashedClaim.mockResolvedValue(claim);
      req.cookies = {lang: 'cy'};

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(claim.formattedResponseDeadline).toHaveBeenCalledWith('cy');
    });

    it('should pass english translation via cookie', async () => {
      const claim = buildClaim();
      mockGetStashedClaim.mockResolvedValue(claim);
      req.cookies = {lang: 'en'};
      req.query = {lang: 'en'};

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(claim.formattedResponseDeadline).toHaveBeenCalledWith('en');
    });

    it('should render the page if response deadline option is set', async () => {
      const claim = buildClaim();
      claim.responseDeadline = {
        option: ResponseOptions.REQUEST_REFUSED,
      };
      mockGetStashedClaim.mockResolvedValue(claim);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
      }));
      expect((res.render as jest.Mock).mock.calls[0][1].form.model.option).toBe(ResponseOptions.REQUEST_REFUSED);
    });

    it('should call next when the claim is missing', async () => {
      mockGetStashedClaim.mockResolvedValue(undefined);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('error');
      mockGetStashedClaim.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should call getStashedClaimOrFromStore only once per POST request', async () => {
      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockGetStashedClaim).toHaveBeenCalledTimes(1);
    });

    it('should re-render when response deadline option is not selected', async () => {
      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
        claimantName: 'Joe Bloggs',
      }));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should pass welsh translation via query', async () => {
      const claim = buildClaim();
      mockGetStashedClaim.mockResolvedValue(claim);
      req.query = {lang: 'cy'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(claim.formattedResponseDeadline).toHaveBeenCalledWith('cy');
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should pass english translation via query', async () => {
      const claim = buildClaim();
      mockGetStashedClaim.mockResolvedValue(claim);
      req.query = {lang: 'en'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(claim.formattedResponseDeadline).toHaveBeenCalledWith('en');
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should pass welsh translation via cookie', async () => {
      const claim = buildClaim();
      mockGetStashedClaim.mockResolvedValue(claim);
      req.cookies = {lang: 'cy'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(claim.formattedResponseDeadline).toHaveBeenCalledWith('cy');
    });

    it('should pass english translation via cookie', async () => {
      const claim = buildClaim();
      mockGetStashedClaim.mockResolvedValue(claim);
      req.cookies = {lang: 'en'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(claim.formattedResponseDeadline).toHaveBeenCalledWith('en');
    });

    it('should redirect to task list when radio \'No, I do not want to request more time\' is selected', async () => {
      req.body = {option: 'no'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should redirect to task list when radio \'My request for more time has been refused\' is selected', async () => {
      req.body = {option: 'request-refused'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should redirect to request more time page when radio \'Yes, I want to request more time\' is selected', async () => {
      req.body = {option: 'yes'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, REQUEST_MORE_TIME_URL));
    });

    it('should redirect to agreed to more time page when radio \'I have already agreed more time\' is selected', async () => {
      req.body = {option: 'already-agreed'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, AGREED_TO_MORE_TIME_URL));
    });

    it('should call next when saving the deadline option fails', async () => {
      const error = new Error('error');
      (ResponseDeadlineService.prototype.saveDeadlineResponse as jest.Mock).mockRejectedValue(error);
      req.body = {option: 'yes'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
