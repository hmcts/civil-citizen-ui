import express from 'express';
import {AdditionalTimeOptions} from '../../../../main/common/form/models/additionalTime';
import {ResponseDeadline, ResponseOptions} from '../../../../main/common/form/models/responseDeadline';
import {Claim} from '../../../../main/common/models/claim';
import * as draftStoreService from '../../../../main/modules/draft-store/draftStoreService';
import {deadLineGuard} from '../../../../main/routes/guards/deadLineGuard';

jest.mock('../../../../main/modules/oidc');
jest.mock('../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;

const MOCK_REQUEST = { params: { id: '123' } } as unknown as express.Request;
const MOCK_RESPONSE = { redirect: jest.fn() } as unknown as express.Response;
const MOCK_NEXT = jest.fn() as express.NextFunction;

describe('Deadline Guard', () => {
  it('should responde unauthorized when isTaskComplete && isDeadlineExtended', async () => {
    const mockClaim = new Claim();
    mockClaim.responseDeadline = new ResponseDeadline();
    mockClaim.responseDeadline.option = ResponseOptions.ALREADY_AGREED;
    mockClaim.responseDeadline.agreedResponseDeadline = new Date();
    mockGetCaseData.mockImplementation(async () => mockClaim);
    await deadLineGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    expect(MOCK_NEXT).not.toHaveBeenCalled();
  });
  it('should responde unauthorized when isDeadlinePassed && isTaskComplete && isMoreThan28Days', async () => {
    const mockClaim = new Claim();
    mockClaim.respondent1ResponseDeadline = new Date('2022-01-01');
    mockClaim.responseDeadline = new ResponseDeadline();
    mockClaim.responseDeadline.option = ResponseOptions.YES;
    mockClaim.responseDeadline.additionalTime = AdditionalTimeOptions.MORE_THAN_28_DAYS;
    mockGetCaseData.mockImplementation(async () => mockClaim);
    await deadLineGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    expect(MOCK_NEXT).not.toHaveBeenCalled();
  });
  it('should responde unauthorized when isDeadlinePassed && isTaskComplete && isRequestRefused', async () => {
    const mockClaim = new Claim();
    mockClaim.respondent1ResponseDeadline = new Date('2022-01-01');
    mockClaim.responseDeadline = new ResponseDeadline();
    mockClaim.responseDeadline.option = ResponseOptions.REQUEST_REFUSED;
    mockGetCaseData.mockImplementation(async () => mockClaim);
    await deadLineGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    expect(MOCK_NEXT).not.toHaveBeenCalled();
  });
  it('should responde unauthorized when isDeadlinePassed && isTaskComplete && isResponseNo', async () => {
    const mockClaim = new Claim();
    mockClaim.respondent1ResponseDeadline = new Date('2022-01-01');
    mockClaim.responseDeadline = new ResponseDeadline();
    mockClaim.responseDeadline.option = ResponseOptions.NO;
    mockGetCaseData.mockImplementation(async () => mockClaim);
    await deadLineGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    expect(MOCK_NEXT).not.toHaveBeenCalled();
  });
  it('should responde unauthorized when isDeadlinePassed && !isTaskComplete', async () => {
    const mockClaim = new Claim();
    mockClaim.respondent1ResponseDeadline = new Date('2022-01-01');
    mockGetCaseData.mockImplementation(async () => mockClaim);
    await deadLineGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    expect(MOCK_NEXT).not.toHaveBeenCalled();
  });
  it('should responde authorized', async () => {
    const mockClaim = new Claim();
    mockGetCaseData.mockImplementation(async () => mockClaim);
    await deadLineGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    expect(MOCK_NEXT).toHaveBeenCalled();
  });
});
