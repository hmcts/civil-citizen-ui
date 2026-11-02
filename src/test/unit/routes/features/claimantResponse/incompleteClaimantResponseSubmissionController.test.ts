import {Response} from 'express';
import incompleteClaimantResponseSubmissionController from 'routes/features/claimantResponse/incompleteClaimantResponseSubmissionController';
import {CLAIMANT_RESPONSE_INCOMPLETE_SUBMISSION_URL, CLAIMANT_RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {outstandingClaimantResponseTasks} from 'services/features/claimantResponse/claimantResponseTasklistService/claimantResponseTasklistService';
import {getClaimById} from 'modules/utilityService';
import {Claim} from 'models/claim';
import {CaseState} from 'form/models/claimDetails';
import {TaskStatus} from 'models/taskList/TaskStatus';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));
jest.mock('services/features/claimantResponse/claimantResponseTasklistService/claimantResponseTasklistService', () => ({
  outstandingClaimantResponseTasks: jest.fn(),
}));
jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient', () => ({
  isCarmEnabledForCase: jest.fn().mockResolvedValue(false),
  isMintiEnabledForCase: jest.fn().mockResolvedValue(false),
}));

const viewPath = 'features/response/incomplete-submission';
const claimId = 'aaa';
const taskDescription = 'Task description';

describe('on GET should display incomplete submission page', () => {
  it('should return incomplete submission page', async () => {
    const claim = new Claim();
    claim.id = claimId;
    claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
    claim.submittedDate = new Date('2024-01-02');
    (getClaimById as jest.Mock).mockResolvedValue(claim);
    const tasks = [{description: taskDescription, status: TaskStatus.INCOMPLETE, url: 'Task URL'}];
    (outstandingClaimantResponseTasks as jest.Mock).mockReturnValue(tasks);
    const res = createMockResponse();

    await getRouteHandler(incompleteClaimantResponseSubmissionController, 'get', CLAIMANT_RESPONSE_INCOMPLETE_SUBMISSION_URL)(
      {
        params: {id: claimId},
        query: {lang: 'en'},
        cookies: {},
        session: createMockSession({user: {id: 'user-1'}}),
      } as unknown as AppRequest,
      res as unknown as Response,
      jest.fn(),
    );

    expect(outstandingClaimantResponseTasks).toHaveBeenCalledWith(claim, 'user-1', 'en', false, false);
    expect(res.render).toHaveBeenCalledWith(viewPath, {
      tasks,
      taskListUri: constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL),
      pageTitle: 'PAGES.INCOMPLETE_SUBMISSION.TITLE',
    });
  });
});
