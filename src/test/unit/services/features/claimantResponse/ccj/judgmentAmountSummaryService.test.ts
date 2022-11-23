import {Claim} from 'models/claim';
import {deepCopy} from '../../../../../utils/deepCopy';
import {mockClaim} from '../../../../../utils/mockClaim';
import {getJudgmentAmountSummary} from 'services/features/claimantResponse/ccj/judgmentAmountSummaryService';
import {YesNo} from 'form/models/yesNo';

describe('Get Judgment amount summary', () => {
  const claim: Claim = Object.assign(new Claim(), deepCopy(mockClaim));
  const claimFee = 50;

  it('get summary details when claimInterest=Yes.', () => {

    //When
    const result = getJudgmentAmountSummary(claim, claimFee, 'en');

    //Then
    expect(result.hasDefendantAlreadyPaid).toEqual(true);
    expect(result.claimHasInterest).toEqual(true);
    const subTotal = claim.totalClaimAmount + result.interestDetails.interestToDate + claimFee;
    expect(result.subTotal.toString()).toEqual(subTotal.toFixed(2).toString());
    expect(result.alreadyPaidAmount).toEqual(claim.claimantResponse.ccjRequest.paidAmount.amount);
    const total = claim.totalClaimAmount + result.interestDetails.interestToDate + claimFee - claim.getDefendantPaidAmount();
    expect(result.total).toEqual(Number(total).toFixed(2));
  });

  it('get summary details when claimInterest=No.', () => {

    //When
    claim.claimInterest = YesNo.NO;
    const result = getJudgmentAmountSummary(claim, claimFee, 'en');

    //Then
    expect(result.hasDefendantAlreadyPaid).toEqual(true);
    expect(result.claimHasInterest).toEqual(false);
    expect(result.subTotal).toEqual(claim.totalClaimAmount + claimFee);
    expect(result.alreadyPaidAmount).toEqual(claim.claimantResponse.ccjRequest.paidAmount.amount);
    const total = claim.totalClaimAmount + claimFee - claim.getDefendantPaidAmount();
    expect(result.total).toEqual(Number(total).toFixed(2));
  });

  it('get summary details when defendant has not paid any amount.', () => {

    //When
    claim.claimInterest = YesNo.YES;
    claim.claimantResponse.ccjRequest.paidAmount.option = YesNo.NO;
    const result = getJudgmentAmountSummary(claim, claimFee, 'en');

    //Then
    expect(result.hasDefendantAlreadyPaid).toEqual(false);
    expect(result.claimHasInterest).toEqual(true);
    const total = claim.totalClaimAmount + result.interestDetails.interestToDate + claimFee;
    expect(result.total).toEqual(Number(total).toFixed(2));
  });

  it('get summary details when defendant has not paid any amount and claimInterest=No.', () => {

    //When
    claim.claimantResponse.ccjRequest.paidAmount.option = YesNo.NO;
    claim.claimInterest = YesNo.NO;
    const result = getJudgmentAmountSummary(claim, claimFee, 'en');

    //Then
    expect(result.hasDefendantAlreadyPaid).toEqual(false);
    expect(result.claimHasInterest).toEqual(false);
    const total = claim.totalClaimAmount + claimFee;
    expect(result.total).toEqual(Number(total).toFixed(2));
  });
});
