import {RESPONSE_INCOMPLETE_SUBMISSION_URL} from 'routes/urls';
import {AllResponseTasksCompletedGuard} from 'routes/guards/allResponseTasksCompletedGuard';
import express from 'express';
import {TaskStatus} from 'models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getTaskLists, outstandingTasksFromTaskLists} from 'services/features/common/taskListService';
import {TaskList} from 'models/taskList/taskList';
import {Task} from 'models/taskList/task';
import {setResponseDeadline} from 'services/features/common/responseDeadlineAgreedService';
import {getClaimById} from 'modules/utilityService';
import {Claim} from 'models/claim';
import {configureSpy} from '../../../utils/spyConfiguration';
import * as carmToggleUtils from 'common/utils/carmToggleUtils';

jest.mock('../../../../main/modules/oidc');
jest.mock('../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../main/modules/draft-store');
jest.mock('../../../../main/modules/draft-store');
jest.mock('../../../../main/routes/features/response/checkAnswersController');
jest.mock('../../../../main/services/features/common/taskListService');
jest.mock('../../../../main/modules/i18n');
jest.mock('../../../../main/modules/utilityService');
jest.mock('../../../../main/services/features/common/responseDeadlineAgreedService');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const mockGetTaskList = getTaskLists as jest.Mock;
const mockOutstandingTasksFromTaskLists = outstandingTasksFromTaskLists as jest.Mock;
const mockSetResponseDeadline = setResponseDeadline as jest.Mock;
const getClaimByIdMock = getClaimById as jest.Mock;

const isCarmEnabledSpy = (calmEnabled: boolean) => configureSpy(carmToggleUtils, 'isCarmEnabledForCase')
  .mockReturnValue(Promise.resolve(calmEnabled));

const CLAIM_ID = 'aaa';
const respondentIncompleteSubmissionUrl = constructResponseUrlWithIdParams(CLAIM_ID, RESPONSE_INCOMPLETE_SUBMISSION_URL);

const MOCK_REQUEST = () => {
  return {
    session: {
      claimId: CLAIM_ID,
    },
  } as unknown as express.Request;
};

const MOCK_RESPONSE = {
  redirect: jest.fn(),
} as unknown as express.Response;

const MOCK_NEXT = jest.fn() as express.NextFunction;

describe('Response - Incomplete Submission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSetResponseDeadline.mockImplementation(async () => {
      return new Date();
    });
    getClaimByIdMock.mockImplementation(async () => {
      const claim = new Claim();
      claim.submittedDate = new Date();
      return claim;
    });
  });

  describe('on GET', () => {

    it('should call next middleware function which will render check answers screen', async () => {
      //Given
      const mockRequest = MOCK_REQUEST();

      mockGetTaskList.mockImplementation(() => {
        return [{
          title: 'Task List',
          tasks: [
            {
              description: 'Task 1',
              status: TaskStatus.COMPLETE,
              url: 'some URL',
            },
          ],
        }];
      });
      mockOutstandingTasksFromTaskLists.mockImplementation(() => {
        const outstandingTaskList: Task[] = [];
        return outstandingTaskList;
      });
      isCarmEnabledSpy(true);
      //When
      await AllResponseTasksCompletedGuard.apply(RESPONSE_INCOMPLETE_SUBMISSION_URL)(mockRequest, MOCK_RESPONSE, MOCK_NEXT);
      //Then
      expect(MOCK_RESPONSE.redirect).not.toHaveBeenCalled();
      expect(MOCK_NEXT).toHaveBeenCalledWith();
    });

    it('should throw error if task list is empty', async () => {
      //Given
      const mockRequest = MOCK_REQUEST();
      mockGetTaskList.mockImplementation(async () => {
        const taskList: TaskList[] = [];
        return taskList;
      });
      //When
      await AllResponseTasksCompletedGuard.apply(RESPONSE_INCOMPLETE_SUBMISSION_URL)(mockRequest, MOCK_RESPONSE, MOCK_NEXT);
      //Then
      expect(MOCK_RESPONSE.redirect).not.toHaveBeenCalled();
      expect(MOCK_NEXT).toHaveBeenLastCalledWith(expect.objectContaining({
        message: 'Task list cannot be empty',
      }));
    });

    it('should redirect to incomplete submission when tasks incomplete status 500 when error thrown', async () => {
      //Given
      const mockRequest = MOCK_REQUEST();
      mockGetTaskList.mockImplementation(() => {
        return [{
          title: 'Task List',
          tasks: [
            {
              description: 'Task 1',
              status: TaskStatus.COMPLETE,
              url: 'some URL',
            },
          ],
        }];
      });
      mockOutstandingTasksFromTaskLists.mockImplementation(() => {
        return [
          {
            description: 'Task 1',
            status: TaskStatus.COMPLETE,
            url: 'some URL',
          },
        ];
      });
      //When
      await AllResponseTasksCompletedGuard.apply(RESPONSE_INCOMPLETE_SUBMISSION_URL)(mockRequest, MOCK_RESPONSE, MOCK_NEXT);
      //Then
      expect(MOCK_RESPONSE.redirect).toHaveBeenCalledWith(respondentIncompleteSubmissionUrl);
      expect(MOCK_NEXT).not.toHaveBeenCalled();
    });
  });
});
