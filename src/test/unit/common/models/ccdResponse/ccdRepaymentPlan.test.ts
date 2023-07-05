import {CCDRepaymentPlanFrequency} from '../../../../../main/common/models/ccdResponse/ccdRepaymentPlan';
import {RepaymentPlan} from '../../../../../main/common/models/repaymentPlan';
import {toCCDRepaymentPlan} from '../../../../../main/services/translation/response/convertToCCDRepaymentPlan';

describe('translate repayment plan to ccd', ()=> {
  it('should translate weekly repayment plan', ()=> {
    //Given
    const repaymentPlan = getRepaymentPlan('WEEK');
    //When
    const ccdRepaymentPlan = toCCDRepaymentPlan(repaymentPlan);
    //Then
    expect(ccdRepaymentPlan.repaymentFrequency).toBe(CCDRepaymentPlanFrequency.ONCE_ONE_WEEK);
  });
  it('should translate two weekly payment plan', ()=> {
    //Given
    const repaymentPlan = getRepaymentPlan('TWO_WEEKS');
    //When
    const ccdRepaymentPlan = toCCDRepaymentPlan(repaymentPlan);
    //Then
    expect(ccdRepaymentPlan.repaymentFrequency).toBe(CCDRepaymentPlanFrequency.ONCE_TWO_WEEKS);
  });
  it('should translate four weekly payment plan', ()=>{
    //Given
    const repaymentPlan = getRepaymentPlan('FOUR_WEEKS');
    //When
    const ccdRepaymentPlan = toCCDRepaymentPlan(repaymentPlan);
    //Then
    expect(ccdRepaymentPlan.repaymentFrequency).toBe(CCDRepaymentPlanFrequency.ONCE_FOUR_WEEKS);
  });
  it('should translate monthly payment plan', ()=> {
    //Given
    const repaymentPlan = getRepaymentPlan('MONTH');
    //When
    const ccdRepaymentPlan = toCCDRepaymentPlan(repaymentPlan);
    //Then
    expect(ccdRepaymentPlan.repaymentFrequency).toBe(CCDRepaymentPlanFrequency.ONCE_ONE_MONTH);
  });
  it('should translate payment amount and first payment date successfully', ()=>{
    //Given
    const repaymentPlan = getRepaymentPlan('MONTH');
    //When
    const ccdRepaymentPlan = toCCDRepaymentPlan(repaymentPlan);
    //Then
    expect(ccdRepaymentPlan.firstRepaymentDate).toBe(repaymentPlan.firstRepaymentDate);
    expect(ccdRepaymentPlan.paymentAmount).toBe(repaymentPlan.paymentAmount*100);
  });
  it('should translate undefined when input is undefined', ()=>{
    //When
    const ccdRepaymentPlan = toCCDRepaymentPlan(undefined);
    //Then
    expect(ccdRepaymentPlan).toBe(undefined);
  });
  it('should translate undefined when input values is undefined', ()=>{
    //Given
    const repaymentPlan = getRepaymentPlanUndefined();
    //When
    const ccdRepaymentPlan = toCCDRepaymentPlan(repaymentPlan);
    //Then
    expect(ccdRepaymentPlan.paymentAmount).toBe(undefined);
    expect(ccdRepaymentPlan.repaymentFrequency).toBe(undefined);
    expect(ccdRepaymentPlan.firstRepaymentDate).toBe(undefined);
  });

});

const getRepaymentPlan = (frequency: string) : RepaymentPlan => {
  return {
    paymentAmount: 100,
    firstRepaymentDate: new Date(),
    repaymentFrequency: frequency,
  };
};

const getRepaymentPlanUndefined = () : RepaymentPlan => {
  return {
    paymentAmount: undefined,
    firstRepaymentDate: undefined,
    repaymentFrequency: undefined,
  };
};

