import {NextFunction, Request, Response} from 'express';
import {Claim} from 'models/claim';
import {getClaimById} from 'modules/utilityService';
import {respondSettlementAgreementConfirmationGuard} from 'routes/guards/respondSettlementAgreementConfirmationGuard';
import {YesNo} from 'form/models/yesNo';

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));

const MOCK_REQUEST = {params: {id: '123'}} as unknown as Request;
const MOCK_RESPONSE = {redirect: jest.fn()} as unknown as Response;
const MOCK_NEXT = jest.fn() as NextFunction;

describe('Respond settlement agreement confirmation Guard', () => {
  it('should access respond to settlement agreement confirmation page', async () => {
    //Given
    const claim = new Claim();
    claim.defendantSignedSettlementAgreement = YesNo.YES;
    (getClaimById as jest.Mock).mockResolvedValueOnce(claim);
    //When
    await respondSettlementAgreementConfirmationGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_NEXT).toHaveBeenCalled();
  });
  it('should redirect if respond to settlement agreement is not completed', async () => {
    //Given
    (getClaimById as jest.Mock).mockResolvedValueOnce(new Claim());
    //When
    await respondSettlementAgreementConfirmationGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_RESPONSE.redirect).toHaveBeenCalled();
  });
  it('should throw an error', async () => {
    //Given
    (getClaimById as jest.Mock).mockImplementation(() => {throw new Error('Test error');});
    //When
    await respondSettlementAgreementConfirmationGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_NEXT).toHaveBeenCalled();
  });
});
