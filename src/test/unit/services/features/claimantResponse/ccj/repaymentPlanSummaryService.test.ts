import {Claim} from 'models/claim';
import {deepCopy} from '../../../../../utils/deepCopy';
import {mockClaim} from '../../../../../utils/mockClaim';
import {
  getRepaymentInfo,
  getRepaymentPlan,
} from 'services/features/claimantResponse/ccj/repaymentPlanSummaryService';
import {RepaymentPlan} from 'models/repaymentPlan';


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
  it('load page.', () => {
    claim.partialAdmission.paymentIntention.repaymentPlan = {} as RepaymentPlan;
    claim.partialAdmission.paymentIntention.repaymentPlan.paymentAmount = 50;
    //When
    const result = getRepaymentInfo(claim, 'en');

    //Then
    expect(result.repaymentPlan.paymentAmount).toEqual(50);
  });
});
