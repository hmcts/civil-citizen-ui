import {Response} from 'express';
import incompleteSubmissionController from 'routes/features/response/incompleteSubmissionController';
import {RESPONSE_INCOMPLETE_SUBMISSION_URL, RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {outstandingTasksFromCase} from 'services/features/common/taskListService';
import {isCarmEnabledForCase} from 'app/auth/launchdarkly/launchDarklyClient';
import {Claim} from 'models/claim';
import {TaskStatus} from 'models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('services/features/common/taskListService', () => ({
  outstandingTasksFromCase: jest.fn((): unknown[] => []),
}));
jest.mock('app/auth/launchdarkly/launchDarklyClient', () => ({
  isCarmEnabledForCase: jest.fn(),
}));

const viewPath = 'features/response/incomplete-submission';
const claimId = 'aaa';
const task = {
  description: 'Task description',
  status: TaskStatus.INCOMPLETE,
  url: 'Task URL',
};

const invoke = async () => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(incompleteSubmissionController, 'get', RESPONSE_INCOMPLETE_SUBMISSION_URL)(
    {
      params: {id: claimId},
      body: {},
      query: {},
      cookies: {},
      session: createMockSession({user: {id: 'user-1'}}),
    } as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

describe('Response - incomplete submission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (isCarmEnabledForCase as jest.Mock).mockResolvedValue(false);
    (getCaseDataFromStore as jest.Mock).mockImplementation(async () => {
      const claim = new Claim();
      claim.submittedDate = new Date();
      return claim;
    });
    (outstandingTasksFromCase as jest.Mock).mockReturnValue([task]);
  });

  it('should render outstanding tasks', async () => {
    const {res} = await invoke();

    expect(res.render).toHaveBeenCalledWith(viewPath, {
      tasks: [task],
      taskListUri: constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL),
      pageTitle: 'PAGES.INCOMPLETE_SUBMISSION.TITLE',
    });
  });

  it('should return the error when the claim cannot be loaded', async () => {
    const error = new Error('redis failure');
    (getCaseDataFromStore as jest.Mock).mockRejectedValue(error);

    const {next} = await invoke();

    expect(next).toHaveBeenCalledWith(error);
  });
});
