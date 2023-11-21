import { YesNo } from 'common/form/models/yesNo';
import { Claim } from 'common/models/claim';
import { ClaimantResponse } from 'common/models/claimantResponse';
import { getClaimSettled, getPaidAmount } from 'services/features/claimantResponse/settleClaimService';

describe('Test for settle Claim ', () => {
  let claim: Claim;
  beforeEach(() => {
    claim = new Claim();
  });

  it('should get the paid for full defense', () => {
    jest.spyOn(claim, 'isFullDefence').mockReturnValueOnce(true);
    jest.spyOn(claim, 'isRejectAllOfClaimAlreadyPaid').mockReturnValueOnce(100);

    expect(getPaidAmount(claim)).toEqual(100);
  });

  it('should get the paid for partial admit', () => {
    jest.spyOn(claim, 'isPartialAdmissionPaid').mockReturnValueOnce(true);
    jest.spyOn(claim, 'partialAdmissionPaidAmount').mockReturnValueOnce(100);

    expect(getPaidAmount(claim)).toEqual(100);
  });

  it('should give undefined if no condition is satisfied', () => {
    jest.spyOn(claim, 'isPartialAdmissionPaid').mockReturnValueOnce(false);
    expect(getPaidAmount(claim)).toEqual(undefined);
  });

  it('should give the claim settle value for full defense', () => {
    jest.spyOn(claim, 'isFullDefence').mockReturnValueOnce(true);
    jest.spyOn(claim, 'hasPaidInFull').mockReturnValueOnce(true);
    const hasFullDefenceStatesPaidClaimSettled = {
      option: YesNo.YES,
    };
    claim.claimantResponse = {
      hasFullDefenceStatesPaidClaimSettled,
    } as ClaimantResponse;

    expect(getClaimSettled(claim)).toEqual(hasFullDefenceStatesPaidClaimSettled);
  });

  it('should give the claim settle value for part admit', () => {
    jest.spyOn(claim, 'isPartialAdmissionPaid').mockReturnValueOnce(true);
    const hasPartPaymentBeenAccepted = {
      option: YesNo.YES,
    };
    claim.claimantResponse = {
      hasPartPaymentBeenAccepted,
    } as ClaimantResponse;

    expect(getClaimSettled(claim)).toEqual(hasPartPaymentBeenAccepted);
  });

});