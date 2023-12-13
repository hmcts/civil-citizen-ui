import {Claim} from 'models/claim';
import {deepCopy} from '../../../../../utils/deepCopy';
import {mockClaim} from '../../../../../utils/mockClaim';
import {getRepaymentInfo, getRepaymentPlan,} from 'services/features/claimantResponse/ccj/repaymentPlanSummaryService';
import {RepaymentPlan} from 'models/repaymentPlan';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';

describe('Get getRepaymentPlan ', () => {
  const claim: Claim = Object.assign(new Claim(), deepCopy(mockClaim));

  it('getRepaymentPlan.', () => {
    claim.partialAdmission.paymentIntention.repaymentPlan = {} as RepaymentPlan;
    claim.partialAdmission.paymentIntention.repaymentPlan.paymentAmount = 50;
    //When
    const result = getRepaymentPlan(claim, 'en');

    //Then
    expect(result.paymentAmount).toEqual(50);
  });
  it('get page parameters', () => {
    claim.fullAdmission.paymentIntention.repaymentPlan = {} as RepaymentPlan;
    claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
    claim.fullAdmission.paymentIntention.paymentDate = new Date('2024-06-21T14:15:19');
    claim.fullAdmission.paymentIntention.repaymentPlan.paymentAmount = 50;
    //When
    const result = getRepaymentInfo(claim, 'en');

    //Then
    expect(result.repaymentPlan.paymentAmount).toEqual(50);
    expect(result.repaymentPlan.lengthOfRepaymentPlan).toEqual('');
    expect(result.repaymentPlan.lengthOfRepaymentPlan).toEqual('');
    expect(result.paymentOption).toEqual(PaymentOptionType.BY_SET_DATE);
  });
});
