import {Request, Response, NextFunction} from 'express';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {ccjConfirmationGuard} from 'routes/guards/ccjConfirmationGuard';
import {YesNo} from 'common/form/models/yesNo';
import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {ClaimantResponse} from 'common/models/claimantResponse';
import {CCJRequest} from 'common/models/claimantResponse/ccj/ccjRequest';
import {DefendantDOB} from 'common/models/claimantResponse/ccj/defendantDOB';
import {QualifiedStatementOfTruth} from 'common/form/models/statementOfTruth/qualifiedStatementOfTruth';
import {PaidAmount} from 'common/models/claimantResponse/ccj/paidAmount';
import {CcjPaymentOption} from 'common/form/models/claimantResponse/ccj/ccjPaymentOption';

jest.mock('../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../main/modules/draft-store');

const mockGetCaseData = getCaseDataFromStore as jest.Mock;

const MOCK_REQUEST = {params: {id: '123'}} as unknown as Request;
const MOCK_RESPONSE = {redirect: jest.fn()} as unknown as Response;
const MOCK_NEXT = jest.fn() as NextFunction;

describe('CCJ Guard', () => {
  it('should access ccj confirmation page', async () => {
    //Given
    const claim = new Claim();
    claim.claimantResponse = new ClaimantResponse();
    claim.claimantResponse.ccjRequest = new CCJRequest();
    claim.claimantResponse.ccjRequest.defendantDOB = new DefendantDOB(YesNo.NO);
    claim.claimantResponse.ccjRequest.paidAmount = new PaidAmount(YesNo.NO);
    claim.claimantResponse.ccjRequest.ccjPaymentOption = new CcjPaymentOption(PaymentOptionType.IMMEDIATELY);
    claim.claimantResponse.ccjRequest.statementOfTruth = new QualifiedStatementOfTruth(true);
    mockGetCaseData.mockImplementation(async () => claim);
    //When
    await ccjConfirmationGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_NEXT).toHaveBeenCalled();
  });
  it('should redirect if ccj is not completed', async () => {
    //Given
    const mockClaim = new Claim();
    mockGetCaseData.mockImplementation(async () => mockClaim);
    //When
    await ccjConfirmationGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_RESPONSE.redirect).toHaveBeenCalled();
  });
  it('should throw an error', async () => {
    //Given
    mockGetCaseData.mockImplementation(async () => {
      throw new Error();
    });
    //When
    await ccjConfirmationGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_NEXT).toHaveBeenCalled();
  });
});
