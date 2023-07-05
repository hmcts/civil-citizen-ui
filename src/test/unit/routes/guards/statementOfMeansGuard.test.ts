import {Request, Response, NextFunction} from 'express';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {statementOfMeansGuard} from 'routes/guards/statementOfMeansGuard';
import fullAdmitPayBySetDateMock from '../../../utils/mocks/fullAdmitPayBySetDateMock.json';

jest.mock('../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../main/modules/draft-store');

const mockGetCaseData = getCaseDataFromStore as jest.Mock;

const MOCK_REQUEST = {params: {id: '123'}} as unknown as Request;
const MOCK_RESPONSE = {redirect: jest.fn()} as unknown as Response;
const MOCK_NEXT = jest.fn() as NextFunction;

describe('Statement of Means Guard', () => {
  it('should access to finacial details pages', async () => {
    //Given
    mockGetCaseData.mockImplementation(async () => fullAdmitPayBySetDateMock.case_data);
    //When
    await statementOfMeansGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_NEXT).toHaveBeenCalled();
  });
  it('should redirect if response type is not selected yet', async () => {
    //Given
    const mockClaim = new Claim();
    mockGetCaseData.mockImplementation(async () => mockClaim);
    //When
    await statementOfMeansGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_RESPONSE.redirect).toHaveBeenCalled();
  });
});
