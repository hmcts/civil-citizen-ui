import {Response} from 'express';
import incompleteClaimIssueSubmissionController from '../../../../../main/routes/features/claim/incompleteClaimIssueSubmissionController';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {outstandingTasksFromCase} from 'services/features/claim/taskListService';
import {CLAIMANT_TASK_LIST_URL} from 'routes/urls';
import {TaskStatus} from 'models/taskList/TaskStatus';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('services/features/claim/taskListService');

const mockGetCaseDataFromStore = getCaseDataFromStore as jest.Mock;
const mockOutstandingTasksFromCase = outstandingTasksFromCase as jest.Mock;

const CLAIM_ID = 'aaa';
const TASK_DESCRIPTION = 'Task description';
const TASK_URL = 'Task URL';

describe('Claim issue - Incomplete submission', () => {
  const getHandler = getRouteHandler(incompleteClaimIssueSubmissionController, 'get');
  const viewPath = 'features/response/incomplete-submission';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      params: {id: CLAIM_ID},
      session: createMockSession({user: {id: 'user-id'}}),
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    mockGetCaseDataFromStore.mockResolvedValue(new Claim());
  });

  it('should render incomplete submission with outstanding tasks', async () => {
    mockOutstandingTasksFromCase.mockReturnValue([
      {
        description: TASK_DESCRIPTION,
        status: TaskStatus.INCOMPLETE,
        url: TASK_URL,
      },
    ]);

    await getHandler(req as AppRequest, res as unknown as Response, next);

    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      tasks: expect.arrayContaining([expect.objectContaining({description: TASK_DESCRIPTION})]),
      taskListUri: constructResponseUrlWithIdParams(CLAIM_ID, CLAIMANT_TASK_LIST_URL),
      pageTitle: 'PAGES.INCOMPLETE_SUBMISSION.TITLE',
    }));
  });

  it('should call next when loading the claim fails', async () => {
    const error = new Error('error');
    mockGetCaseDataFromStore.mockRejectedValue(error);

    await getHandler(req as AppRequest, res as unknown as Response, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
