import express from 'express';
import {BASE_ELIGIBILITY_URL, CLAIM_INCOMPLETE_SUBMISSION_URL} from 'routes/urls';
import {TaskStatus} from 'models/taskList/TaskStatus';
import {TaskList} from 'models/taskList/taskList';
import {Task} from 'models/taskList/task';
import {getTaskLists} from 'services/features/claim/taskListService';
import {outstandingTasksFromTaskLists} from 'services/features/common/taskListService';
import {checkYourAnswersClaimGuard} from 'routes/guards/checkYourAnswersGuard';
import {AppRequest} from 'common/models/AppRequest';
import {getDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {Claim} from 'models/claim';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';

jest.mock('../../../../main/modules/oidc');
jest.mock('../../../../main/modules/draft-store/draftStoreManagerService');
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
const mockGetDraftClaim = getDraftClaim as jest.Mock;
const CLAIM_ID = '123';

const createMockManagerResult = (claim: Claim, createdAt?: string): DraftClaimManagerResult => ({
  claimResponse: {
    id: CLAIM_ID,
    case_data: claim as unknown as Claim,
  } as unknown as CivilClaimResponse,
  rawResponse: {
    draftId: CLAIM_ID,
    payload: claim,
  } as unknown as DraftClaimManagerResult['rawResponse'],
  createdAt: createdAt ?? '',
  updatedAt: '2026-08-01T11:00:00.000Z',
  expiresAt: '2026-09-01T10:00:00.000Z',
});

const MOCK_REQUEST = () => {
  return {
    session: {
      claimId: CLAIM_ID,
      user: {
        id: '123',
      },
    },
    cookies: {},
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
    const mockRequest = MOCK_REQUEST();
    const claim = new Claim();
    claim.id = CLAIM_ID;
    claim.draftClaimCreatedAt = new Date(Date.now());
    mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));

    mockGetTaskList.mockImplementation(() => {
      return mockTaskList;
    });

    mockOutstandingTasksFromTaskLists.mockImplementation(() => {
      const outstandingTaskList: Task[] = [];
      return outstandingTaskList;
    });

    await checkYourAnswersClaimGuard(mockRequest, MOCK_RESPONSE, MOCK_NEXT);

    expect(MOCK_RESPONSE.redirect).not.toHaveBeenCalled();
    expect(MOCK_NEXT).toHaveBeenCalledWith();
  });

  it('should throw error', async () => {
    const mockRequest = MOCK_REQUEST();
    const claim = new Claim();
    claim.draftClaimCreatedAt = new Date(Date.now());
    mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));
    mockGetTaskList.mockImplementation(async () => {
      const taskList: TaskList[] = [];
      return taskList;
    });

    await checkYourAnswersClaimGuard(mockRequest, MOCK_RESPONSE, MOCK_NEXT);

    expect(MOCK_RESPONSE.redirect).not.toHaveBeenCalled();
    expect(MOCK_NEXT).toHaveBeenLastCalledWith(
      expect.objectContaining({
        message: "Cannot read properties of undefined (reading 'tasks')",
      }),
    );
  });

  it('should redirect to incomplete submission', async () => {
    const mockRequest = MOCK_REQUEST();
    const claim = new Claim();
    claim.draftClaimCreatedAt = new Date(Date.now());
    mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));
    mockGetTaskList.mockImplementation(() => {
      return mockTaskList;
    });
    mockOutstandingTasksFromTaskLists.mockImplementation(() => {
      mockTaskList[0].tasks[0].status = TaskStatus.INCOMPLETE;
      return mockTaskList;
    });

    await checkYourAnswersClaimGuard(mockRequest, MOCK_RESPONSE, MOCK_NEXT);

    expect(MOCK_RESPONSE.redirect).toHaveBeenCalledWith(
      CLAIM_INCOMPLETE_SUBMISSION_URL,
    );
    expect(MOCK_NEXT).not.toHaveBeenCalled();
  });

  it('should stash claim on req.locals when next is called', async () => {
    const mockRequest = MOCK_REQUEST();
    const mockClaim = new Claim();
    mockClaim.id = CLAIM_ID;
    mockClaim.draftClaimCreatedAt = new Date(Date.now());
    mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
    mockGetTaskList.mockImplementation(() => [
      {
        title: 'Task List',
        tasks: [{description: 'Task 1', status: TaskStatus.COMPLETE, url: 'some URL'}],
      },
      {
        title: 'Task List 2',
        tasks: [{description: 'Task 1', status: TaskStatus.COMPLETE, url: 'some URL'}],
      },
      {
        title: 'Task List 3',
        tasks: [{description: 'Task 1', status: TaskStatus.COMPLETE, url: 'some URL'}],
      },
    ]);
    mockOutstandingTasksFromTaskLists.mockImplementation(() => {
      const outstandingTaskList: Task[] = [];
      return outstandingTaskList;
    });

    await checkYourAnswersClaimGuard(mockRequest, MOCK_RESPONSE, MOCK_NEXT);

    expect(MOCK_NEXT).toHaveBeenCalledWith();
    expect(mockRequest.locals.claim).toEqual(expect.objectContaining({id: CLAIM_ID}));
  });

  it('should throw when no draft exists', async () => {
    const mockRequest = MOCK_REQUEST();
    mockGetDraftClaim.mockResolvedValue(null);

    await checkYourAnswersClaimGuard(mockRequest, MOCK_RESPONSE, MOCK_NEXT);

    expect(MOCK_NEXT).toHaveBeenCalledWith(expect.objectContaining({
      message: '[checkYourAnswersGuard] no draft claim found',
    }));
  });

  it('should copy createdAt onto the claim when missing', async () => {
    const mockRequest = MOCK_REQUEST();
    const claim = new Claim();
    claim.id = CLAIM_ID;
    mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim, '2026-08-01T10:00:00.000Z'));
    mockGetTaskList.mockImplementation(() => mockTaskList);
    mockOutstandingTasksFromTaskLists.mockImplementation(() => []);

    await checkYourAnswersClaimGuard(mockRequest, MOCK_RESPONSE, MOCK_NEXT);

    expect(mockRequest.locals.claim.draftClaimCreatedAt).toEqual(new Date('2026-08-01T10:00:00.000Z'));
    expect(MOCK_NEXT).toHaveBeenCalledWith();
  });

  it('should redirect to dashboard', async () => {
    const mockRequest = MOCK_REQUEST();
    mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));

    mockGetTaskList.mockImplementation(() => {
      return mockTaskList;
    });

    await checkYourAnswersClaimGuard(mockRequest, MOCK_RESPONSE, MOCK_NEXT);

    expect(MOCK_RESPONSE.redirect).toHaveBeenCalledWith(
      BASE_ELIGIBILITY_URL,
    );
    expect(MOCK_RESPONSE.redirect).not.toHaveBeenCalledWith(
      CLAIM_INCOMPLETE_SUBMISSION_URL  );
    expect(MOCK_NEXT).not.toHaveBeenCalled();
  });
});
