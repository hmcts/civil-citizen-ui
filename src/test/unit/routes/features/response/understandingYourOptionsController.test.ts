import {Response} from 'express';
import understandingYourOptionsController from 'routes/features/response/understandingYourOptionsController';
import {UNDERSTANDING_RESPONSE_OPTIONS_URL} from 'routes/urls';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');

const viewPath = 'features/response/understanding-your-options';
const claimId = '12345';

const storedClaim = (deadline?: Date): Claim => {
  const claim = new Claim();
  claim.respondent1ResponseDeadline = deadline;
  return claim;
};

const invoke = async (req: Record<string, unknown> = {}) => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(understandingYourOptionsController, 'get', UNDERSTANDING_RESPONSE_OPTIONS_URL)(
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

describe('Understanding Your Options Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (getCaseDataFromStore as jest.Mock).mockResolvedValue(storedClaim(new Date('2099-06-01T16:00:00.000Z')));
  });

  it('should render the response deadline in the requested language', async () => {
    const claim = storedClaim(new Date('2099-06-01T16:00:00.000Z'));
    (getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);

    const {res} = await invoke({query: {lang: 'cy'}});

    expect(res.render).toHaveBeenCalledWith(viewPath, {
      responseDate: claim.formattedResponseDeadline('cy'),
    });
  });

  it('should render an empty deadline when none is stored', async () => {
    (getCaseDataFromStore as jest.Mock).mockResolvedValue(storedClaim());

    const {res} = await invoke();

    expect(res.render).toHaveBeenCalledWith(viewPath, {responseDate: ''});
  });

  it('should return the error when the claim cannot be loaded', async () => {
    const error = new Error('redis failure');
    (getCaseDataFromStore as jest.Mock).mockRejectedValue(error);

    const {next} = await invoke();

    expect(next).toHaveBeenCalledWith(error);
  });
});
