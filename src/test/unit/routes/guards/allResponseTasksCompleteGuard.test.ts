import {RESPONSE_INCOMPLETE_SUBMISSION_URL} from '../../../../main/routes/urls';
import {
  AllResponseTasksCompletedGuard,
} from '../../../../main/routes/guards/allResponseTasksCompletedGuard';
import express from 'express';
import {TaskStatus} from '../../../../main/common/models/taskList/TaskStatus';
import {TaskList} from '../../../../main/common/models/taskList/taskList';
import {constructResponseUrlWithIdParams} from '../../../../main/common/utils/urlFormatter';

jest.mock('../../../../main/modules/oidc');
jest.mock('../../../../main/services/features/response/checkAnswers/checkAnswersService');

const CLAIM_ID = 'aaa';
const respondentIncompleteSubmissionUrl = constructResponseUrlWithIdParams(CLAIM_ID, RESPONSE_INCOMPLETE_SUBMISSION_URL);
const TASK_LISTS = (taskStatus: TaskStatus) => [
  {
    title: 'Task List',
    tasks: [
      {
        description: 'Task 1',
        status: taskStatus,
        url: 'some URL',
      },
    ],
  },
];

const MOCK_REQUEST = (taskLists: TaskList[]) => {
  return {
    session: {
      claimId: CLAIM_ID,
      taskLists: taskLists,
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
      const mockRequest = MOCK_REQUEST(TASK_LISTS(TaskStatus.COMPLETE));
      //When
      await AllResponseTasksCompletedGuard.apply(RESPONSE_INCOMPLETE_SUBMISSION_URL)(mockRequest, MOCK_RESPONSE, MOCK_NEXT);
      //Then
      expect(MOCK_RESPONSE.redirect).not.toHaveBeenCalled();
      expect(MOCK_NEXT).toHaveBeenCalledWith();
    });

    it('should throw error if task list from session is empty', async () => {
      //Given
      const mockRequest = MOCK_REQUEST([]);
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
      const mockRequest = MOCK_REQUEST(TASK_LISTS(TaskStatus.INCOMPLETE));
      //When
      await AllResponseTasksCompletedGuard.apply(RESPONSE_INCOMPLETE_SUBMISSION_URL)(mockRequest, MOCK_RESPONSE, MOCK_NEXT);
      //Then
      expect(MOCK_RESPONSE.redirect).toHaveBeenCalledWith(respondentIncompleteSubmissionUrl);
      expect(MOCK_NEXT).not.toHaveBeenCalled();
    });
  });
});
