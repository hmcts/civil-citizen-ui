import {RESPONSE_INCOMPLETE_SUBMISSION_URL} from '../../../../main/routes/urls';
import {AllResponseTasksCompletedGuard} from '../../../../main/routes/guards/allResponseTasksCompletedGuard';
import express from 'express';
import {TaskStatus} from '../../../../main/common/models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from '../../../../main/common/utils/urlFormatter';
import {getTaskLists, outstandingTasksFromTaskLists} from '../../../../main/services/features/response/taskListService';
import {TaskList} from '../../../../main/common/models/taskList/taskList';
import {Task} from '../../../../main/common/models/taskList/task';

jest.mock('../../../../main/modules/oidc');
jest.mock('../../../../main/modules/draft-store');
jest.mock('../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../main/routes/features/response/checkAnswersController');
jest.mock('../../../../main/services/features/response/taskListService');
jest.mock('../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const mockGetTaskList = getTaskLists as jest.Mock;
const mockOutstandingTasksFromTaskLists = outstandingTasksFromTaskLists as jest.Mock;

const CLAIM_ID = 'aaa';
const respondentIncompleteSubmissionUrl = constructResponseUrlWithIdParams(CLAIM_ID, RESPONSE_INCOMPLETE_SUBMISSION_URL);

const MOCK_REQUEST = () => {
  return {
    session: {
      claimId: CLAIM_ID,
    },
  } as express.Request;
};

const MOCK_RESPONSE = {
  redirect: jest.fn(),
} as unknown as express.Response;

const MOCK_NEXT = jest.fn() as express.NextFunction;


describe('Response - Incomplete Submission', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('on GET', () => {

    it('should call next middleware function which will render check answers screen', async () => {
      //Given
      const mockRequest = MOCK_REQUEST();
      mockGetTaskList.mockImplementation(() => {
        const taskList = [{
          title: 'Task List',
          tasks: [
            {
              description: 'Task 1',
              status: TaskStatus.COMPLETE,
              url: 'some URL',
            },
          ],
        }];
        return taskList;
      });
      mockOutstandingTasksFromTaskLists.mockImplementation(() => {
        const outstandingTaskList: Task[] = [];
        return outstandingTaskList;
      });
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
        const taskList = [{
          title: 'Task List',
          tasks: [
            {
              description: 'Task 1',
              status: TaskStatus.COMPLETE,
              url: 'some URL',
            },
          ],
        }];
        return taskList;
      });
      mockOutstandingTasksFromTaskLists.mockImplementation(() => {
        const outstandingTaskList = [
          {
            description: 'Task 1',
            status: TaskStatus.COMPLETE,
            url: 'some URL',
          },
        ];
        return outstandingTaskList;
      });
      //When
      await AllResponseTasksCompletedGuard.apply(RESPONSE_INCOMPLETE_SUBMISSION_URL)(mockRequest, MOCK_RESPONSE, MOCK_NEXT);
      //Then
      expect(MOCK_RESPONSE.redirect).toHaveBeenCalledWith(respondentIncompleteSubmissionUrl);
      expect(MOCK_NEXT).not.toHaveBeenCalled();
    });
  });
});
