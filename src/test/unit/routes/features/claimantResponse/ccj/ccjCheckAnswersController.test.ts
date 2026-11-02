import {Response} from 'express';
import ccjCheckAnswersController from 'routes/features/claimantResponse/ccj/ccjCheckAnswersController';
import {CCJ_CHECK_AND_SEND_URL} from 'routes/urls';
import {getSummarySections} from 'services/features/claimantResponse/ccj/ccjCheckAnswersService';
import {deleteDraftClaimFromStore, generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {isJudgmentBufferEnabled} from '../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('services/features/claimantResponse/ccj/ccjCheckAnswersService', () => ({
  getSummarySections: jest.fn().mockResolvedValue({}),
  getStatementOfTruth: jest.fn(() => ({type: 'basic', signed: false})),
  saveStatementOfTruth: jest.fn(),
}));
jest.mock('services/features/claimantResponse/submission/submitClaimantResponse', () => ({
  submitClaimantResponse: jest.fn(),
}));
jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient', () => ({
  isJudgmentBufferEnabled: jest.fn(),
}));

const viewPath = 'features/claimantResponse/ccj/check-answers';
const claimId = '12345';

const invoke = async (method: 'get' | 'post', req: Record<string, unknown> = {}) => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(ccjCheckAnswersController, method, CCJ_CHECK_AND_SEND_URL)(
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

describe('Response - Check answers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (getCaseDataFromStore as jest.Mock).mockResolvedValue(new Claim());
    (getClaimById as jest.Mock).mockResolvedValue(new Claim());
    (isJudgmentBufferEnabled as jest.Mock).mockResolvedValue(false);
    (getSummarySections as jest.Mock).mockResolvedValue({});
    (deleteDraftClaimFromStore as jest.Mock).mockResolvedValue(undefined);
  });

  it('should return check answers page', async () => {
    const {res} = await invoke('get');

    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      summarySections: {},
      pageTitle: 'PAGES.CHECK_YOUR_ANSWER.TITLE',
    }));
  });

  it('should return http 500 when has error in the get method', async () => {
    const error = new Error('redis failure');
    (getCaseDataFromStore as jest.Mock).mockRejectedValue(error);

    const {next} = await invoke('get');

    expect(next).toHaveBeenCalledWith(error);
  });

  it('should pass english translation via query', async () => {
    await invoke('get', {query: {lang: 'en'}});

    expect(getSummarySections).toHaveBeenCalledWith(claimId, expect.any(Claim), 'en', false);
  });

  it('should pass cy translation via query', async () => {
    await invoke('get', {query: {lang: 'cy'}});

    expect(getSummarySections).toHaveBeenCalledWith(claimId, expect.any(Claim), 'cy', false);
  });

  it('should pass judgment buffer flag to summary sections', async () => {
    (isJudgmentBufferEnabled as jest.Mock).mockResolvedValue(true);

    await invoke('get');

    expect(getSummarySections).toHaveBeenCalledWith(claimId, expect.any(Claim), undefined, true);
  });
});

describe('on Post', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (getClaimById as jest.Mock).mockResolvedValue(new Claim());
    (isJudgmentBufferEnabled as jest.Mock).mockResolvedValue(false);
    (getSummarySections as jest.Mock).mockResolvedValue({});
  });

  it('should return errors when form is incomplete', async () => {
    const res = createMockResponse();
    const next = jest.fn();

    await getRouteHandler(ccjCheckAnswersController, 'post', CCJ_CHECK_AND_SEND_URL)(
      {
        params: {id: claimId},
        body: {signed: ''},
        query: {},
        cookies: {},
        session: createMockSession({user: {id: 'user-1'}}),
      } as unknown as AppRequest,
      res as unknown as Response,
      next,
    );

    expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
    expect(res.redirect).not.toHaveBeenCalled();
  });

  it('should return 500 when error in service', async () => {
    const error = new Error('redis failure');
    (getClaimById as jest.Mock).mockRejectedValue(error);
    const {next} = await invoke('post', {body: {signed: ''}});

    expect(next).toHaveBeenCalledWith(error);
  });
});
