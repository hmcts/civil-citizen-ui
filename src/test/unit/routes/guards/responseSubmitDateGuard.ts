import {NextFunction, Request, Response} from 'express';
import {getCaseDataFromStore} from '../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../main/common/models/claim';
import {responseSubmitDateGuard} from '../../../../main/routes/guards/responseSubmitDateGuard';

jest.mock('../../../../main/modules/oidc');
jest.mock('../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseData = getCaseDataFromStore as jest.Mock;
const MOCK_REQUEST = { params: { id: '123' } } as unknown as Request;
const MOCK_RESPONSE = { redirect: jest.fn() } as unknown as Response;
const MOCK_NEXT = jest.fn() as NextFunction;

describe('Response Submit Date Guard', () => {
  it('should redirect to the dashboard if response submit date is not set', async () => {
    mockGetCaseData.mockImplementation(async () => new Claim());
    await responseSubmitDateGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    expect(MOCK_NEXT).not.toHaveBeenCalled();
  });

  it('should redirect to the dashboard if response submit date is in the future', async () => {
    const claim = new Claim();
    const now = new Date();
    claim.respondent1ResponseDate = new Date(now.setDate(now.getDate() + 1));
    mockGetCaseData.mockImplementation(async () => claim);

    await responseSubmitDateGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    expect(MOCK_NEXT).not.toHaveBeenCalled();
  });

  it('should allow redirect to the confirmation page if response submit date is in the past', async () => {
    const claim = new Claim();
    const now = new Date();
    claim.respondent1ResponseDate = new Date(now.setDate(now.getDate() - 1));
    mockGetCaseData.mockImplementation(async () => claim);

    await responseSubmitDateGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    expect(MOCK_NEXT).toHaveBeenCalled();
  });
});
