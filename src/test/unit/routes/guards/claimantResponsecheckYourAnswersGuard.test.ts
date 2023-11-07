import express from 'express';
import {CLAIMANT_RESPONSE_INCOMPLETE_SUBMISSION_URL} from 'routes/urls';
import {Task} from 'models/taskList/task';
import {AppRequest} from 'common/models/AppRequest';
import {Claim} from 'models/claim';
import {outstandingClaimantResponseTasks} from 'services/features/claimantResponse/claimantResponseTasklistService/claimantResponseTasklistService';
import {claimantResponsecheckYourAnswersGuard} from 'routes/guards/claimantResponseCheckYourAnswersGuard';
import {getClaimById} from '../../../../main/modules/utilityService';
import {TaskStatus} from 'common/models/taskList/TaskStatus';

jest.mock('../../../../main/routes/features/claimantResponse/claimantResponseCheckAnswersController');
jest.mock('../../../../main/services/features/claimantResponse/claimantResponseTasklistService/claimantResponseTasklistService');
jest.mock('../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));

const mockOutstandingClaimantResponseTasks =
  outstandingClaimantResponseTasks as jest.Mock;
const mockClaim = getClaimById as jest.Mock;
const MOCK_NEXT = jest.fn() as express.NextFunction;

const CLAIM_ID = '123';

const MOCK_REQUEST = () => {
  return {
    params: {
      id: CLAIM_ID,
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
        status: TaskStatus.INCOMPLETE,
        url: 'some URL',
      },
    ],
  },
];

describe('claimant response check Your Answers Guard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call next if all task are complete', async () => {
    //Given
    const mockRequest = MOCK_REQUEST();

    mockClaim.mockImplementation(async () => {
      const claim = new Claim();
      claim.id = CLAIM_ID;
      return claim;
    });

    mockOutstandingClaimantResponseTasks.mockImplementation(() => {
      const outstandingTaskList: Task[] = [];
      return outstandingTaskList;
    });

    //When
    await claimantResponsecheckYourAnswersGuard(
      mockRequest,
      MOCK_RESPONSE,
      MOCK_NEXT,
    );
    //Then
    expect(MOCK_RESPONSE.redirect).not.toHaveBeenCalled();
    expect(MOCK_NEXT).toHaveBeenCalled();
  });

  it('should redirect to incomplete submission', async () => {
    //Given
    const mockRequest = MOCK_REQUEST();

    mockClaim.mockImplementation(async () => {
      const claim = new Claim();
      claim.id = CLAIM_ID;
      return claim;
    });

    mockOutstandingClaimantResponseTasks.mockImplementation(() => {
      return mockTaskList;
    });

    //When
    await claimantResponsecheckYourAnswersGuard(
      mockRequest,
      MOCK_RESPONSE,
      MOCK_NEXT,
    );

    //Then
    expect(MOCK_RESPONSE.redirect).toHaveBeenCalledWith(
      CLAIMANT_RESPONSE_INCOMPLETE_SUBMISSION_URL.replace(
        /(:id)/i,
        mockRequest.params.id,
      ),
    );

    expect(MOCK_NEXT).not.toHaveBeenCalled();
  });

  it('should throw error', async () => {
    //Given
    const mockRequest = MOCK_REQUEST();
    const error = new Error(
      'Error in getting outstanding claimant response tasks',
    );

    mockClaim.mockImplementation(async () => {
      const claim = new Claim();
      claim.id = CLAIM_ID;
      return claim;
    });

    mockOutstandingClaimantResponseTasks.mockImplementation(() => {
      throw error;
    });

    //When
    await claimantResponsecheckYourAnswersGuard(
      mockRequest,
      MOCK_RESPONSE,
      MOCK_NEXT,
    );

    //Then
    expect(MOCK_RESPONSE.redirect).not.toHaveBeenCalled();
    expect(MOCK_NEXT).toHaveBeenLastCalledWith(error);
  });
});
