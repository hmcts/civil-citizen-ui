import {Request, Response, NextFunction} from 'express';
import {AdditionalTimeOptions} from 'form/models/additionalTime';
import {ResponseDeadline, ResponseOptions} from 'form/models/responseDeadline';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {deadLineGuard} from 'routes/guards/deadLineGuard';

jest.mock('modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/draft-store');

const mockGetCaseData = getCaseDataFromStore as jest.Mock;

const MOCK_REQUEST = { params: { id: '123' } } as unknown as Request;
const MOCK_RESPONSE = { redirect: jest.fn() } as unknown as Response;
const MOCK_NEXT = jest.fn() as NextFunction;

describe('Deadline Guard', () => {
  it('should respond unauthorized when isTaskComplete && isDeadlineExtended', async () => {
    //Given
    const mockClaim = new Claim();
    mockClaim.responseDeadline = new ResponseDeadline();
    mockClaim.responseDeadline.option = ResponseOptions.ALREADY_AGREED;
    mockClaim.respondentSolicitor1AgreedDeadlineExtension = new Date();
    mockGetCaseData.mockImplementation(async () => mockClaim);
    //When
    await deadLineGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_NEXT).not.toHaveBeenCalled();
  });
  it('should respond unauthorized when isDeadlinePassed && isTaskComplete && isMoreThan28Days', async () => {
    //Given
    const mockClaim = new Claim();
    mockClaim.respondent1ResponseDeadline = new Date('2022-01-01');
    mockClaim.responseDeadline = new ResponseDeadline();
    mockClaim.responseDeadline.option = ResponseOptions.YES;
    mockClaim.responseDeadline.additionalTime = AdditionalTimeOptions.MORE_THAN_28_DAYS;
    mockGetCaseData.mockImplementation(async () => mockClaim);
    //When
    await deadLineGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_NEXT).not.toHaveBeenCalled();
  });
  it('should respond unauthorized when isDeadlinePassed && isTaskComplete && isRequestRefused', async () => {
    //Given
    const mockClaim = new Claim();
    mockClaim.respondent1ResponseDeadline = new Date('2022-01-01');
    mockClaim.responseDeadline = new ResponseDeadline();
    mockClaim.responseDeadline.option = ResponseOptions.REQUEST_REFUSED;
    mockGetCaseData.mockImplementation(async () => mockClaim);
    //When
    await deadLineGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_NEXT).not.toHaveBeenCalled();
  });
  it('should respond unauthorized when isDeadlinePassed && isTaskComplete && isResponseNo', async () => {
    //Given
    const mockClaim = new Claim();
    mockClaim.respondent1ResponseDeadline = new Date('2022-01-01');
    mockClaim.responseDeadline = new ResponseDeadline();
    mockClaim.responseDeadline.option = ResponseOptions.NO;
    mockGetCaseData.mockImplementation(async () => mockClaim);
    //When
    await deadLineGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_NEXT).not.toHaveBeenCalled();
  });
  it('should responde unauthorized when isDeadlinePassed && !isTaskComplete', async () => {
    //Given
    const mockClaim = new Claim();
    mockClaim.respondent1ResponseDeadline = new Date('2022-01-01');
    mockGetCaseData.mockImplementation(async () => mockClaim);
    //When
    await deadLineGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_NEXT).not.toHaveBeenCalled();
  });
  it('should respond authorized', async () => {
    //Given
    const mockClaim = new Claim();
    mockGetCaseData.mockImplementation(async () => mockClaim);
    //When
    await deadLineGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_NEXT).toHaveBeenCalled();
  });
});
