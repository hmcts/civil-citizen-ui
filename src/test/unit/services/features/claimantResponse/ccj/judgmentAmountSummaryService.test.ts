import {Claim} from 'models/claim';
import {deepCopy} from '../../../../../utils/deepCopy';
import {mockClaim} from '../../../../../utils/mockClaim';
import {getJudgmentAmountSummary} from 'services/features/claimantResponse/ccj/judgmentAmountSummaryService';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';

describe('Get Judgment amount summary', () => {
  const claim: Claim = Object.assign(new Claim(), deepCopy(mockClaim));
  const claimFee = 50;

  it('get summary details when claimInterest=Yes.', async () => {

    //When
    const result = await getJudgmentAmountSummary(claim, claimFee, 'en');

    //Then
    expect(result.hasDefendantAlreadyPaid).toEqual(true);
    expect(result.claimHasInterest).toEqual(true);
    expect(result.alreadyPaidAmount).toEqual((claim.claimantResponse.ccjRequest.paidAmount.amount).toFixed(2));
    const total = claim.totalClaimAmount + Number(result.interestToDate) + claimFee - claim.getDefendantPaidAmount();
    expect(result.total).toEqual(Number(total).toFixed(2));
  });

  it('get summary details when claimInterest=No.', async () => {

    //When
    claim.claimInterest = YesNo.NO;
    const result = await getJudgmentAmountSummary(claim, claimFee, 'en');

    //Then
    expect(result.hasDefendantAlreadyPaid).toEqual(true);
    expect(result.claimHasInterest).toEqual(false);
    expect(result.subTotal).toEqual((claim.totalClaimAmount + claimFee).toFixed(2));
    expect(result.alreadyPaidAmount).toEqual((claim.claimantResponse.ccjRequest.paidAmount.amount).toFixed(2));
    const total = claim.totalClaimAmount + claimFee - claim.getDefendantPaidAmount();
    expect(result.total).toEqual(Number(total).toFixed(2));
  });

  it('get summary details when defendant has not paid any amount.', async () => {

    //When
    claim.claimInterest = YesNo.YES;
    claim.claimantResponse.ccjRequest.paidAmount.option = YesNo.NO;
    const result = await getJudgmentAmountSummary(claim, claimFee, 'en');

    //Then
    expect(result.hasDefendantAlreadyPaid).toEqual(false);
    expect(result.claimHasInterest).toEqual(true);
    const total = claim.totalClaimAmount + Number(result.interestToDate) + claimFee;
    expect(result.total).toEqual(Number(total).toFixed(2));
  });

  it('get summary details when defendant has not paid any amount and claimInterest=No.', async () => {

    //When
    claim.claimantResponse.ccjRequest.paidAmount.option = YesNo.NO;
    claim.claimInterest = YesNo.NO;
    const result = await getJudgmentAmountSummary(claim, claimFee, 'en');

    //Then
    expect(result.hasDefendantAlreadyPaid).toEqual(false);
    expect(result.claimHasInterest).toEqual(false);
    const total = claim.totalClaimAmount + claimFee;
    expect(result.total).toEqual(Number(total).toFixed(2));
  });

  it('get summary details when there is Hwf', async () => {

    //When
    claim.helpWithFees = {
      helpWithFee: YesNoUpperCamelCase.YES,
      helpWithFeesReferenceNumber : 'Test',
    };
    claim.claimIssuedHwfDetails = {
      outstandingFeeInPounds: '100',
    };
    const result = await getJudgmentAmountSummary(claim, claimFee, 'en');

    //Then
    expect(result.claimFeeAmount).toEqual(Number(claim.claimIssuedHwfDetails.outstandingFeeInPounds));
  });

  it('get summary details when there is no Hwf', async () => {

    //When
    claim.helpWithFees = {
      helpWithFee: YesNoUpperCamelCase.NO,
      helpWithFeesReferenceNumber : undefined,
    };
    const result = await getJudgmentAmountSummary(claim, claimFee, 'en');

    //Then
    expect(result.claimFeeAmount).toEqual(Number(claimFee));
  });
});
