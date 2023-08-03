import {Request, Response, NextFunction} from 'express';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {app} from '../../../../main/app';
import {claimIssueTaskListGuard} from 'routes/guards/claimIssueTaskListGuard';

jest.mock('../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../main/modules/draft-store');

const mockGetCaseData = getCaseDataFromStore as jest.Mock;

const MOCK_REQUEST = { session: {user : { id: '123' } }} as unknown as Request;
const MOCK_RESPONSE = { redirect: jest.fn() } as unknown as Response;
const MOCK_NEXT = jest.fn() as NextFunction;

describe('Claim Issue TaskList Guard', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it('should redirect if claim not exists and eligibility not completed', async () => {
    //Given
    const mockClaim = new Claim();
    mockClaim.id = null;

    mockGetCaseData.mockImplementation(async () => mockClaim);
    app.request.cookies = {};
    //When
    await claimIssueTaskListGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_RESPONSE.redirect).toHaveBeenCalled();
  });

  it('should access to claim/task-list page when claim exist', async () => {
    //Given
    const mockClaim = new Claim();
    mockClaim.id = '1';

    mockGetCaseData.mockImplementation(async () => mockClaim);
    //When
    await claimIssueTaskListGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_NEXT).toHaveBeenCalled();
  });
  it('should access to claim/task-list  page when eligibility questions completed', async () => {
    //Given
    const mockClaim = new Claim();
    app.request.cookies = {eligibilityCompleted: true};

    mockGetCaseData.mockImplementation(async () => mockClaim);
    //When
    await claimIssueTaskListGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_NEXT).toHaveBeenCalled();
  });
  it('should access to claim/task-list page when eligibility question completed and claim exist', async () => {
    //Given
    const mockClaim = new Claim();
    mockClaim.id = '1';
    app.request.cookies = {eligibilityCompleted: true};

    mockGetCaseData.mockImplementation(async () => mockClaim);
    //When
    await claimIssueTaskListGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_NEXT).toHaveBeenCalled();
  });

});
