import {CCDRepaymentPlanFrequency} from '../../../../../main/common/models/ccdResponse/ccdRepaymentPlan';
import {RepaymentPlan} from '../../../../../main/common/models/repaymentPlan';
import {toCCDRepaymentPlan} from '../../../../../main/services/translation/response/convertToCCDRepaymentPlan';

describe('translate repayment plan to ccd', ()=> {
  it.concurrent('should translate weekly repayment plan', ()=> {
    //Given
    const repaymentPlan = getRepaymentPlan('WEEK');
    //When
    const ccdRepaymentPlan = toCCDRepaymentPlan(repaymentPlan);
    //Then
    expect(ccdRepaymentPlan.repaymentFrequency).toBe(CCDRepaymentPlanFrequency.ONCE_ONE_WEEK);
  });
  it.concurrent('should translate two weekly payment plan', ()=> {
    //Given
    const repaymentPlan = getRepaymentPlan('TWO_WEEKS');
    //When
    const ccdRepaymentPlan = toCCDRepaymentPlan(repaymentPlan);
    //Then
    expect(ccdRepaymentPlan.repaymentFrequency).toBe(CCDRepaymentPlanFrequency.ONCE_TWO_WEEKS);
  });
  it.concurrent('should translate four weekly payment plan', ()=>{
    //Given
    const repaymentPlan = getRepaymentPlan('FOUR_WEEKS');
    //When
    const ccdRepaymentPlan = toCCDRepaymentPlan(repaymentPlan);
    //Then
    expect(ccdRepaymentPlan.repaymentFrequency).toBe(CCDRepaymentPlanFrequency.ONCE_FOUR_WEEKS);
  });
  it.concurrent('should translate monthly payment plan', ()=> {
    //Given
    const repaymentPlan = getRepaymentPlan('MONTH');
    //When
    const ccdRepaymentPlan = toCCDRepaymentPlan(repaymentPlan);
    //Then
    expect(ccdRepaymentPlan.repaymentFrequency).toBe(CCDRepaymentPlanFrequency.ONCE_ONE_MONTH);
  });
  it.concurrent('should translate payment amount and first payment date successfully', ()=>{
    //Given
    const repaymentPlan = getRepaymentPlan('MONTH');
    //When
    const ccdRepaymentPlan = toCCDRepaymentPlan(repaymentPlan);
    //Then
    expect(ccdRepaymentPlan.firstRepaymentDate).toBe(repaymentPlan.firstRepaymentDate);
    expect(ccdRepaymentPlan.paymentAmount).toBe(repaymentPlan.paymentAmount);
  });
});

const getRepaymentPlan = (frequency: string) : RepaymentPlan => {
  return {
    paymentAmount: 100,
    firstRepaymentDate: new Date(),
    repaymentFrequency: frequency,
  };
};
