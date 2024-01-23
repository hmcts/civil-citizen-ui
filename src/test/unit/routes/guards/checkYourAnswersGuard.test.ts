import express from 'express';
import {CLAIM_INCOMPLETE_SUBMISSION_URL, DASHBOARD_URL} from 'routes/urls';
import {TaskStatus} from 'models/taskList/TaskStatus';
import {TaskList} from 'models/taskList/taskList';
import {Task} from 'models/taskList/task';
import {getTaskLists} from 'services/features/claim/taskListService';
import {outstandingTasksFromTaskLists} from 'services/features/common/taskListService';
import {checkYourAnswersClaimGuard} from 'routes/guards/checkYourAnswersGuard';
import {AppRequest} from 'common/models/AppRequest';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';

jest.mock('../../../../main/modules/oidc');
jest.mock('../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../main/routes/features/claim/checkAnswersController');
jest.mock('../../../../main/services/features/claim/taskListService');
jest.mock('../../../../main/services/features/common/taskListService');
jest.mock('../../../../main/modules/i18n');

jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const mockGetTaskList = getTaskLists as jest.Mock;
const mockOutstandingTasksFromTaskLists =
  outstandingTasksFromTaskLists as jest.Mock;
const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
const CLAIM_ID = '123';

const MOCK_REQUEST = () => {
  return {
    session: {
      claimId: CLAIM_ID,
    },
  } as unknown as AppRequest;
};

const MOCK_RESPONSE = {
  redirect: jest.fn(),
} as unknown as express.Response;

const mockTaskList = [
  {
    title: 'Task List',
    tasks: [
      {
        description: 'Task 1',
        status: TaskStatus.COMPLETE,
        url: 'some URL',
      },
    ],
  },
  {
    title: 'Task List 2',
    tasks: [
      {
        description: 'Task 1',
        status: TaskStatus.COMPLETE,
        url: 'some URL',
      },
    ],
  },
  {
    title: 'Task List 3',
    tasks: [
      {
        description: 'Task 1',
        status: TaskStatus.COMPLETE,
        url: 'some URL',
      },
    ],
  },
];

const MOCK_NEXT = jest.fn() as express.NextFunction;

describe('checkYourAnswersClaimGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call next if all task are complete', async () => {
    //Given
    const mockRequest = MOCK_REQUEST();

    mockGetCaseData.mockImplementation(async () => {
      const claim = new Claim();
      claim.id = CLAIM_ID;
      return claim;
    });

    mockGetTaskList.mockImplementation(() => {
      return mockTaskList;
    });

    mockOutstandingTasksFromTaskLists.mockImplementation(() => {
      const outstandingTaskList: Task[] = [];
      return outstandingTaskList;
    });
    //When
    await checkYourAnswersClaimGuard(mockRequest, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_RESPONSE.redirect).not.toHaveBeenCalled();
    expect(MOCK_NEXT).toHaveBeenCalledWith();
  });

  it('should throw error', async () => {
    //Given
    const mockRequest = MOCK_REQUEST();
    mockGetTaskList.mockImplementation(async () => {
      const taskList: TaskList[] = [];
      return taskList;
    });
    //When
    await checkYourAnswersClaimGuard(mockRequest, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_RESPONSE.redirect).not.toHaveBeenCalled();
    expect(MOCK_NEXT).toHaveBeenLastCalledWith(
      expect.objectContaining({
        message: "Cannot read properties of undefined (reading 'tasks')",
      }),
    );
  });

  it('should redirect to incomplete submission', async () => {
    //Given
    const mockRequest = MOCK_REQUEST();
    mockGetTaskList.mockImplementation(() => {
      return mockTaskList;
    });
    mockOutstandingTasksFromTaskLists.mockImplementation(() => {
      mockTaskList[0].tasks[0].status = TaskStatus.INCOMPLETE;
      return mockTaskList;
    });
    //When
    await checkYourAnswersClaimGuard(mockRequest, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_RESPONSE.redirect).toHaveBeenCalledWith(
      CLAIM_INCOMPLETE_SUBMISSION_URL,
    );
    expect(MOCK_NEXT).not.toHaveBeenCalled();
  });

  it('should redirect to dashboard', async () => {
    //Given
    const mockRequest = MOCK_REQUEST();
    mockGetCaseData.mockImplementation(async () => {
      return new Claim();
    });

    mockGetTaskList.mockImplementation(() => {
      return mockTaskList;
    });
    //When
    await checkYourAnswersClaimGuard(mockRequest, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_RESPONSE.redirect).toHaveBeenCalledWith(
      DASHBOARD_URL,
    );
    expect(MOCK_RESPONSE.redirect).not.toHaveBeenCalledWith(
      CLAIM_INCOMPLETE_SUBMISSION_URL  );
    expect(MOCK_NEXT).not.toHaveBeenCalled();
  });
});
