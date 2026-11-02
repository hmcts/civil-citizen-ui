import {Response} from 'express';
import responseDeadlineOptionsController from 'routes/features/response/responseDeadline/responseDeadlineOptionsController';
import {
  AGREED_TO_MORE_TIME_URL,
  REQUEST_MORE_TIME_URL,
  RESPONSE_DEADLINE_OPTIONS_URL,
  RESPONSE_TASK_LIST_URL,
} from 'routes/urls';
import {generateRedisKey, getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {isCuiGaNroEnabled} from 'app/auth/launchdarkly/launchDarklyClient';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {ResponseDeadline, ResponseOptions} from 'form/models/responseDeadline';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('app/auth/launchdarkly/launchDarklyClient', () => ({
  isCuiGaNroEnabled: jest.fn(),
}));

const viewPath = 'features/response/response-deadline-options';
const claimId = '12345';

const storedClaim = (option?: ResponseOptions): Claim => {
  const claim = new Claim();
  claim.applicant1 = {
    type: PartyType.INDIVIDUAL,
    partyDetails: {
      partyName: 'Joe Bloggs',
      firstName: 'Joe',
      lastName: 'Bloggs',
    },
  };
  claim.respondent1ResponseDeadline = new Date('2099-06-01T16:00:00.000Z');
  if (option) {
    claim.responseDeadline = new ResponseDeadline(option);
  }
  return claim;
};

const invoke = async (method: 'get' | 'post', req: Record<string, unknown> = {}) => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(responseDeadlineOptionsController, method, RESPONSE_DEADLINE_OPTIONS_URL)(
    {
      params: {id: claimId},
      body: {},
      query: {},
      cookies: {},
      session: createMockSession({user: {id: 'user-1'}}),
      ...req,
    } as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

describe('Response Deadline Options Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (getCaseDataFromStore as jest.Mock).mockImplementation(async () => storedClaim());
    (saveDraftClaim as jest.Mock).mockResolvedValue(undefined);
    (isCuiGaNroEnabled as jest.Mock).mockResolvedValue(false);
  });

  describe('on GET', () => {
    it('should render the page when no option is stored', async () => {
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        claimantName: storedClaim().getClaimantFullName(),
        isGaNroEnabled: false,
      }));
      expect(res.render.mock.calls[0][1].form.model.option).toBeUndefined();
    });

    it('should render the stored response deadline option', async () => {
      (getCaseDataFromStore as jest.Mock).mockImplementation(async () => storedClaim(ResponseOptions.REQUEST_REFUSED));

      const {res} = await invoke('get');

      expect(res.render.mock.calls[0][1].form.model.option).toBe(ResponseOptions.REQUEST_REFUSED);
    });

    it('should return the error when the claim cannot be loaded', async () => {
      const error = new Error('redis failure');
      (getCaseDataFromStore as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when no option is selected', async () => {
      const {res} = await invoke('post');

      expect(res.render.mock.calls[0][0]).toBe(viewPath);
      expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(saveDraftClaim).not.toHaveBeenCalled();
    });

    it('should save no and redirect to the task list', async () => {
      const {res} = await invoke('post', {body: {option: 'no'}});

      const saved = (saveDraftClaim as jest.Mock).mock.calls[0][1] as Claim;
      expect(saved.responseDeadline.option).toBe(ResponseOptions.NO);
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should save a refused request and redirect to the task list', async () => {
      const {res} = await invoke('post', {body: {option: 'request-refused'}});

      const saved = (saveDraftClaim as jest.Mock).mock.calls[0][1] as Claim;
      expect(saved.responseDeadline.option).toBe(ResponseOptions.REQUEST_REFUSED);
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should save yes and redirect to request more time', async () => {
      const {res} = await invoke('post', {body: {option: 'yes'}});

      const saved = (saveDraftClaim as jest.Mock).mock.calls[0][1] as Claim;
      expect(saved.responseDeadline.option).toBe(ResponseOptions.YES);
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, REQUEST_MORE_TIME_URL));
    });

    it('should save already agreed and redirect to the agreed date page', async () => {
      const {res} = await invoke('post', {body: {option: 'already-agreed'}});

      const saved = (saveDraftClaim as jest.Mock).mock.calls[0][1] as Claim;
      expect(saved.responseDeadline.option).toBe(ResponseOptions.ALREADY_AGREED);
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, AGREED_TO_MORE_TIME_URL));
    });

    it('should return the error when saving the option fails', async () => {
      const error = new Error('redis failure');
      (saveDraftClaim as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('post', {body: {option: 'yes'}});

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
