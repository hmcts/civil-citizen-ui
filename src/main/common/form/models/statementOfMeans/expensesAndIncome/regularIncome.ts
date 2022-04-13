import Transaction from './transaction';
import {ValidateNested} from 'class-validator';
import {IncomeType} from './incomeType';

export interface IncomeParams {
  job?: Transaction;
  universalCredit?: Transaction;
  jobseekerAllowanceIncome?: Transaction;
  jobseekerAllowanceContribution?: Transaction;
  incomeSupport?: Transaction;
  workingTaxCredit?: Transaction;
  childTaxCredit?: Transaction;
  childBenefit?: Transaction;
  councilTaxSupport?: Transaction;
  pension?: Transaction;
}

export default class RegularIncome {
  @ValidateNested()
    job: Transaction;

  @ValidateNested()
    universalCredit: Transaction;

  @ValidateNested()
    jobseekerAllowanceIncome: Transaction;

  @ValidateNested()
    jobseekerAllowanceContribution: Transaction;

  @ValidateNested()
    incomeSupport: Transaction;

  @ValidateNested()
    workingTaxCredit: Transaction;

  @ValidateNested()
    childTaxCredit: Transaction;

  @ValidateNested()
    childBenefit: Transaction;

  @ValidateNested()
    councilTaxSupport: Transaction;

  @ValidateNested()
    pension: Transaction;

  [key: string]: Transaction;

  constructor(params: IncomeParams) {
    this.job = params.job;
    this.universalCredit = params.universalCredit;
    this.incomeSupport = params.incomeSupport;
    this.pension = params.pension;
    this.councilTaxSupport = params.councilTaxSupport;
    this.childTaxCredit = params.childTaxCredit;
    this.childBenefit = params.childBenefit;
    this.jobseekerAllowanceIncome = params.jobseekerAllowanceIncome;
    this.jobseekerAllowanceContribution = params.jobseekerAllowanceContribution;
    this.incomeSupport = params.incomeSupport;
    this.workingTaxCredit = params.workingTaxCredit;
  }

  public static buildEmptyForm() {
    const params = {
      job: RegularIncome.buildIncome(IncomeType.JOB),
      universalCredit: RegularIncome.buildIncome(IncomeType.UNIVERSAL_CREDIT),
      jobseekerAllowanceIncome: RegularIncome.buildIncome(IncomeType.JOB_SEEKERS_ALLOWANCE_INCOME_BASED),
      jobseekerAllowanceContribution: RegularIncome.buildIncome(IncomeType.JOB_SEEKERS_ALLOWANCE_CONTRIBUTION_BASED),
      incomeSupport: RegularIncome.buildIncome(IncomeType.INCOME_SUPPORT),
      workingTaxCredit: RegularIncome.buildIncome(IncomeType.WORKING_TAX_CREDIT),
      childTaxCredit: RegularIncome.buildIncome(IncomeType.CHILD_TAX_CREDIT),
      childBenefit: RegularIncome.buildIncome(IncomeType.CHILD_BENEFIT),
      councilTaxSupport: RegularIncome.buildIncome(IncomeType.COUNCIL_TAX_SUPPORT),
      pension: RegularIncome.buildIncome(IncomeType.PENSION),
    };
    return new RegularIncome(params);
  }

  private static buildIncome(type: IncomeType): Transaction {
    return Transaction.buildEmptyForm(type, true);
  }
}
