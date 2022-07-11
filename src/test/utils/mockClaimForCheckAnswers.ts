import {Claim} from '../../main/common/models/claim';
import {ResponseType} from '../../main/common/form/models/responseType';
import PaymentOptionType from '../../main/common/form/models/admission/paymentOption/paymentOptionType';
import {
  TransactionSchedule,
} from '../../main/common/form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {CounterpartyType} from '../../main/common/models/counterpartyType';
import {DebtItems} from '../../main/common/form/models/statementOfMeans/debts/debtItems';
import {Debts} from '../../main/common/form/models/statementOfMeans/debts/debts';
import {PriorityDebts} from '../../main/common/form/models/statementOfMeans/priorityDebts';
import {PriorityDebtDetails} from '../../main/common/form/models/statementOfMeans/priorityDebtDetails';
import Transaction from '../../main/common/form/models/statementOfMeans/expensesAndIncome/transaction';
import TransactionSource from '../../main/common/form/models/statementOfMeans/expensesAndIncome/transactionSource';
import {RegularExpenses} from '../../main/common/form/models/statementOfMeans/expensesAndIncome/regularExpenses';
import OtherTransaction from '../../main/common/form/models/statementOfMeans/expensesAndIncome/otherTransaction';
import RegularIncome from '../../main/common/form/models/statementOfMeans/expensesAndIncome/regularIncome';
import {BankAccount} from '../../main/common/form/models/bankAndSavings/bankAccount';
import {CourtOrders} from '../../main/common/form/models/statementOfMeans/courtOrders/courtOrders';
import {CourtOrder} from '../../main/common/form/models/statementOfMeans/courtOrders/courtOrder';
import {Employment} from '../../main/common/models/employment';
import {Employer} from '../../main/common/form/models/statementOfMeans/employment/employer';
import {Employers} from '../../main/common/form/models/statementOfMeans/employment/employers';
import {EmploymentCategory} from '../../main/common/form/models/statementOfMeans/employment/employmentCategory';
import {Unemployment} from '../../main/common/form/models/statementOfMeans/unemployment/unemployment';
import {OtherDetails} from '../../main/common/form/models/statementOfMeans/unemployment/otherDetails';
import {UnemploymentCategory} from '../../main/common/form/models/statementOfMeans/unemployment/unemploymentCategory';
import {UnemploymentDetails} from '../../main/common/form/models/statementOfMeans/unemployment/unemploymentDetails';
import {SelfEmployedAs} from '../../main/common/models/selfEmployedAs';
import {TaxPayments} from '../../main/common/models/taxPayments';

import {Disability} from '../../main/common/form/models/statementOfMeans/disability';
import {YesNo} from '../../main/common/form/models/yesNo';
import {SevereDisability} from '../../main/common/form/models/statementOfMeans/severeDisability';
import {Residence} from '../../main/common/form/models/statementOfMeans/residence';
import {ResidenceType} from '../../main/common/form/models/statementOfMeans/residenceType';
import {Cohabiting} from '../../main/common/form/models/statementOfMeans/partner/cohabiting';
import {PartnerAge} from '../../main/common/form/models/statementOfMeans/partner/partnerAge';
import {PartnerDisability} from '../../main/common/form/models/statementOfMeans/partner/partnerDisability';
import {PartnerSevereDisability} from '../../main/common/form/models/statementOfMeans/partner/partnerSevereDisability';
import {PartnerPension} from '../../main/common/form/models/statementOfMeans/partner/partnerPension';
import {Dependants} from '../../main/common/form/models/statementOfMeans/dependants/dependants';
import {NumberOfChildren} from '../../main/common/form/models/statementOfMeans/dependants/numberOfChildren';
import {OtherDependants} from '../../main/common/form/models/statementOfMeans/otherDependants';
import {Carer} from '../../main/common/form/models/statementOfMeans/carer';
import {HowMuchDoYouOwe} from '../../main/common/form/models/admission/partialAdmission/howMuchDoYouOwe';
import {HowMuchHaveYouPaid, HowMuchHaveYouPaidParams} from '../../main/common/form/models/admission/howMuchHaveYouPaid';
import {WhyDoYouDisagree} from '../../main/common/form/models/admission/partialAdmission/whyDoYouDisagree';
import {PartialAdmission} from '../../main/common/models/partialAdmission';
import {AlreadyPaid} from '../../main/common/form/models/admission/partialAdmission/alreadyPaid';
import {DefendantTimeline} from '../../main/common/form/models/timeLineOfEvents/defendantTimeline';
import {PaymentIntention} from '../../main/common/form/models/admission/partialAdmission/paymentIntention';
import {FreeMediation} from '../../main/common/form/models/mediation/freeMediation';
import {NoMediationReason} from '../../main/common/form/models/mediation/noMediationReason';
import {CompanyTelephoneNumber} from '../../main/common/form/models/mediation/companyTelephoneNumber';
import {Mediation} from '../../main/common/models/mediation/mediation';

import TimelineRow from '../../main/common/form/models/timeLineOfEvents/timelineRow';
import {EvidenceType} from '../../main/common/models/evidence/evidenceType';
import {EvidenceItem} from '../../main/common/form/models/evidence/evidenceItem';
import {DefendantEvidence} from '../../main/common/models/evidence/evidence';
import { Evidence } from '../../main/common/form/models/evidence/evidence';

const CONTACT_PERSON = 'The Post Man';
const PARTY_NAME = 'Nice organisation';
const TITLE = 'Mr';
const FIRST_NAME = 'John';
const LAST_NAME = 'Richards';
const CONTACT_NUMBER = '077777777779';

export const createClaimWithBasicRespondentDetails = (contactPerson?: string): Claim => {
  const claim = new Claim();
  claim.respondent1 = {
    partyName: PARTY_NAME,
    telephoneNumber: CONTACT_NUMBER,
    contactPerson: contactPerson,
    dateOfBirth: new Date('2000-12-12'),
    responseType: ResponseType.FULL_ADMISSION,
    type: CounterpartyType.INDIVIDUAL,
    primaryAddress: {
      AddressLine1: '23 Brook lane',
      PostTown: 'Bristol',
      PostCode: 'BS13SS',
    },
  };
  claim.paymentOption = PaymentOptionType.IMMEDIATELY;
  return claim;
};

export const createClaimWithRespondentDetailsWithPaymentOption = (paymentOption: PaymentOptionType): Claim => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.paymentOption = paymentOption;
  claim.repaymentPlan = {
    paymentAmount: 33,
    repaymentFrequency: TransactionSchedule.WEEK,
    firstRepaymentDate: new Date('2022-06-25'),
  };
  claim.paymentDate = new Date('2022-06-25');
  return claim;
};

export const createClaimWithIndividualDetails = (): Claim => {
  const claim = new Claim();
  claim.respondent1 = {
    type: CounterpartyType.INDIVIDUAL,
    individualTitle: TITLE,
    individualLastName: LAST_NAME,
    individualFirstName: FIRST_NAME,
    partyName: PARTY_NAME,
    telephoneNumber: CONTACT_NUMBER,
    responseType: ResponseType.FULL_ADMISSION,
    primaryAddress: {
      AddressLine1: '23 Brook lane',
      PostTown: 'Bristol',
      PostCode: 'BS13SS',
    },
    correspondenceAddress: {
      AddressLine1: '24 Brook lane',
      PostTown: 'Bristol',
      PostCode: 'BS13SS',
    },
  };
  return claim;
};

export const createClaimWithContactPersonDetails = (): Claim => {
  return createClaimWithBasicRespondentDetails(CONTACT_PERSON);
};

export const createClaimWithOneBankAccount = (): Claim => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.paymentOption = PaymentOptionType.BY_SET_DATE;
  const bankAccounts: BankAccount[] = [
    new BankAccount('CURRENT_ACCOUNT', 'true', '1000'),
  ];
  claim.statementOfMeans = {
    bankAccounts: bankAccounts,
  };
  return claim as Claim;
};

export const createClaimWithBankAccounts = () => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.paymentOption = PaymentOptionType.BY_SET_DATE;
  const bankAccounts: BankAccount[] = [
    new BankAccount('CURRENT_ACCOUNT', 'true', '1000'),
    new BankAccount('SAVINGS_ACCOUNT', 'false', '2000'),
    new BankAccount('ISA', 'false', '2000'),
    new BankAccount('OTHER', 'false', '2000'),
  ];

  claim.statementOfMeans = {
    bankAccounts: bankAccounts,
  };

  return claim as Claim;
};

export const createClaimWithNoBankAccounts = (): Claim => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.paymentOption = PaymentOptionType.BY_SET_DATE;
  return claim as Claim;
};

export const createClaimWithCourtOrders = () => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.paymentOption = PaymentOptionType.BY_SET_DATE;
  const courtOrders: CourtOrders = new CourtOrders(true, [
    new CourtOrder(100, 1500, '1'),
    new CourtOrder(250, 2500, '2'),
  ]);

  claim.statementOfMeans = {
    courtOrders: courtOrders,
  };

  return claim as Claim;
};

export const createClaimWithNoCourtOrders = () => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.paymentOption = PaymentOptionType.BY_SET_DATE;
  const courtOrders: CourtOrders = new CourtOrders(true, []);

  claim.statementOfMeans = {
    courtOrders: courtOrders,
  };

  return claim as Claim;
};

export const createClaimWithDebts = () => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.paymentOption = PaymentOptionType.BY_SET_DATE;

  const debts: Debts = new Debts();
  debts.option = 'yes';
  debts.debtsItems = [
    new DebtItems('Loan 1', '1000', '10'),
  ];

  claim.statementOfMeans = {
    debts: debts,
  };

  return claim as Claim;
};

export const createClaimWithPriorityDebts = (): Claim => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.paymentOption = PaymentOptionType.BY_SET_DATE;

  const mortgage: PriorityDebtDetails = new PriorityDebtDetails(true, 'Mortgage', 1000, 'WEEK');
  const rent: PriorityDebtDetails = new PriorityDebtDetails(true, 'Rent', 2000, 'FOUR_WEEKS');
  const councilTax: PriorityDebtDetails = new PriorityDebtDetails(true, 'Council Tax or Community Charge', 500.55, 'FOUR_WEEKS');
  const gas: PriorityDebtDetails = new PriorityDebtDetails(true, 'Gas', 300, 'WEEK');
  const electricity: PriorityDebtDetails = new PriorityDebtDetails(true, 'Electricity', 400, 'TWO_WEEKS');
  const water: PriorityDebtDetails = new PriorityDebtDetails(true, 'Water', 500, 'MONTH');
  const maintenance: PriorityDebtDetails = new PriorityDebtDetails(true, 'Maintenance Payments', 500, 'TWO_WEEKS');
  const priorityDebts: PriorityDebts = new PriorityDebts(mortgage, rent, councilTax, gas, electricity, water, maintenance);

  claim.statementOfMeans = {
    priorityDebts: priorityDebts,
  };

  return claim as Claim;
};

export const createClaimWithMultipleDebt = (): Claim => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.paymentOption = PaymentOptionType.BY_SET_DATE;

  const debts: Debts = new Debts();
  debts.option = 'yes';
  debts.debtsItems = [
    new DebtItems('Loan 1', '1000', '10'),
    new DebtItems('Loan 2', '2000', '10'),
  ];

  claim.statementOfMeans = {
    debts: debts,
  };

  return claim as Claim;
};

export const createClaimWithRegularExpenses = (): Claim => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.paymentOption = PaymentOptionType.BY_SET_DATE;

  const otherExpenses: TransactionSource[] = [
    new TransactionSource({ name: 'Expenses 1', amount: 1000, schedule: TransactionSchedule.TWO_WEEKS, isIncome: false, nameRequired: true }),
    new TransactionSource({ name: 'Expenses 2', amount: 2000, schedule: TransactionSchedule.MONTH, isIncome: false, nameRequired: true }),
  ];

  const expense_regular: RegularExpenses = new RegularExpenses(
    {
      mortgage: new Transaction(true, new TransactionSource({ name: 'mortgage', amount: 1000, schedule: TransactionSchedule.WEEK, isIncome: false })),
      rent: new Transaction(true, new TransactionSource({ name: 'rent', amount: 300, schedule: TransactionSchedule.WEEK, isIncome: false })),
      gas: new Transaction(true, new TransactionSource({ name: 'gas', amount: 100, schedule: TransactionSchedule.TWO_WEEKS, isIncome: false })),
      councilTax: new Transaction(true, new TransactionSource({ name: 'councilTax', amount: 10000, schedule: TransactionSchedule.FOUR_WEEKS, isIncome: false })),
      electricity: new Transaction(true, new TransactionSource({ name: 'electricity', amount: 100, schedule: TransactionSchedule.FOUR_WEEKS, isIncome: false })),
      water: new Transaction(true, new TransactionSource({ name: 'water', amount: 400, schedule: TransactionSchedule.TWO_WEEKS, isIncome: false })),
      travel: new Transaction(true, new TransactionSource({ name: 'travel', amount: 500, schedule: TransactionSchedule.MONTH, isIncome: false })),
      schoolCosts: new Transaction(true, new TransactionSource({ name: 'school costs (include clothing)', amount: 600, schedule: TransactionSchedule.WEEK, isIncome: false })),
      foodAndHousekeeping: new Transaction(true, new TransactionSource({ name: 'food and housekeeping', amount: 700, schedule: TransactionSchedule.MONTH, isIncome: false })),
      tvAndBroadband: new Transaction(true, new TransactionSource({ name: 'TV and broadband', amount: 500.50, schedule: TransactionSchedule.FOUR_WEEKS, isIncome: false })),
      hirePurchase: new Transaction(true, new TransactionSource({ name: 'hire purchase', amount: 44.40, schedule: TransactionSchedule.TWO_WEEKS, isIncome: false })),
      mobilePhone: new Transaction(true, new TransactionSource({ name: 'mobile phone', amount: 25, schedule: TransactionSchedule.TWO_WEEKS, isIncome: false })),
      maintenance: new Transaction(true, new TransactionSource({ name: 'maintenance payments', amount: 120, schedule: TransactionSchedule.TWO_WEEKS, isIncome: false })),
      other: new OtherTransaction(true, otherExpenses),
    });

  claim.statementOfMeans = {
    regularExpenses: expense_regular,
  };

  return claim as Claim;
};

export const createClaimWithRegularIncome = (): Claim => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.paymentOption = PaymentOptionType.BY_SET_DATE;

  const otherIncome: TransactionSource[] = [
    new TransactionSource({ name: 'Income 1', amount: 1000, schedule: TransactionSchedule.TWO_WEEKS, isIncome: true, nameRequired: true }),
    new TransactionSource({ name: 'Income 2', amount: 2000, schedule: TransactionSchedule.MONTH, isIncome: true, nameRequired: true }),
  ];

  const income_regular: RegularIncome = new RegularIncome(
    {
      job: new Transaction(true, new TransactionSource({ name: 'job', amount: 1000, schedule: TransactionSchedule.WEEK, isIncome: true })),
      universalCredit: new Transaction(true, new TransactionSource({ name: 'universalCredit', amount: 200, schedule: TransactionSchedule.WEEK, isIncome: true })),
      jobseekerAllowanceIncome: new Transaction(true, new TransactionSource({ name: 'jobseekerAllowanceIncome', amount: 300, schedule: TransactionSchedule.WEEK, isIncome: true })),
      jobseekerAllowanceContribution: new Transaction(true, new TransactionSource({ name: 'jobseekerAllowanceContribution', amount: 350.50, schedule: TransactionSchedule.WEEK, isIncome: true })),
      incomeSupport: new Transaction(true, new TransactionSource({ name: 'incomeSupport', amount: 475.33, schedule: TransactionSchedule.WEEK, isIncome: true })),
      workingTaxCredit: new Transaction(true, new TransactionSource({ name: 'workingTaxCredit', amount: 400.70, schedule: TransactionSchedule.WEEK, isIncome: true })),
      childTaxCredit: new Transaction(true, new TransactionSource({ name: 'childTaxCredit', amount: 550.50, schedule: TransactionSchedule.WEEK, isIncome: true })),
      childBenefit: new Transaction(true, new TransactionSource({ name: 'childBenefit', amount: 600, schedule: TransactionSchedule.WEEK, isIncome: true })),
      councilTaxSupport: new Transaction(true, new TransactionSource({ name: 'councilTaxSupport', amount: 10, schedule: TransactionSchedule.WEEK, isIncome: true })),
      pension: new Transaction(true, new TransactionSource({ name: 'pension', amount: 247, schedule: TransactionSchedule.WEEK, isIncome: true })),
      other: new OtherTransaction(true, otherIncome),
    });

  claim.statementOfMeans = {
    regularIncome: income_regular,
  };

  return claim as Claim;
};


export const createEmployers = () => {

  return new Employers(
    [
      new Employer('Version 1', 'FE Developer'),
      new Employer('Version 1', 'BE Developer'),
    ],
  );
};

export const createClaimWithEmplymentDetails = (): Claim => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.paymentOption = PaymentOptionType.BY_SET_DATE;

  const employmentType: EmploymentCategory[] = [EmploymentCategory.EMPLOYED, EmploymentCategory.SELF_EMPLOYED];
  const employment: Employment = { declared: true, employmentType: employmentType };
  const selfEmployedAs: SelfEmployedAs = { jobTitle: 'Developer', annualTurnover: 50000 };

  claim.statementOfMeans = {
    employment: employment,
    employers: createEmployers(),
    selfEmployedAs: selfEmployedAs,
  };

  return claim as Claim;
};

export const createClaimWithEmployedCategory = (): Claim => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.paymentOption = PaymentOptionType.BY_SET_DATE;

  const employmentType: EmploymentCategory[] = [EmploymentCategory.EMPLOYED];
  const employment: Employment = { declared: true, employmentType: employmentType };

  claim.statementOfMeans = {
    employment: employment,
    employers: createEmployers(),
  };

  return claim as Claim;
};

export const createClaimWithSelfEmployedAndTaxBehind = (): Claim => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.paymentOption = PaymentOptionType.BY_SET_DATE;

  const employmentType: EmploymentCategory[] = [EmploymentCategory.SELF_EMPLOYED];
  const employment: Employment = { declared: true, employmentType: employmentType };
  const selfEmployedAs: SelfEmployedAs = { jobTitle: 'Developer', annualTurnover: 50000 };
  const taxPayments: TaxPayments = { owed: true, amountOwed: 200, reason: 'Tax payment reasons'};

  claim.statementOfMeans = {
    employment: employment,
    selfEmployedAs: selfEmployedAs,
    taxPayments: taxPayments,
  };

  return claim as Claim;
};

export const createClaimWithSelfEmployedNoTaxBehind = (): Claim => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.paymentOption = PaymentOptionType.BY_SET_DATE;

  const employmentType: EmploymentCategory[] = [EmploymentCategory.SELF_EMPLOYED];
  const employment: Employment = { declared: true, employmentType: employmentType };
  const selfEmployedAs: SelfEmployedAs = { jobTitle: 'Developer', annualTurnover: 50000 };
  const taxPayments: TaxPayments = { owed: false, amountOwed: undefined, reason: ''};

  claim.statementOfMeans = {
    employment: employment,
    selfEmployedAs: selfEmployedAs,
    taxPayments: taxPayments,
  };

  return claim as Claim;
};

export const createClaimWithUnemplymentDetailsOne = (): Claim => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.paymentOption = PaymentOptionType.BY_SET_DATE;
  const unemployment = new Unemployment(UnemploymentCategory.UNEMPLOYED, new UnemploymentDetails('1', '1'), undefined);

  claim.statementOfMeans = {
    unemployment: unemployment,
  };

  return claim as Claim;
};

export const createClaimWithUnemplymentDetailsTwo = (): Claim => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.paymentOption = PaymentOptionType.BY_SET_DATE;
  const unemployment = new Unemployment(UnemploymentCategory.UNEMPLOYED, new UnemploymentDetails('10', '10'), undefined);

  claim.statementOfMeans = {
    unemployment: unemployment,
  };

  return claim as Claim;
};

export const createClaimWithUnemploymentCategoryRETIRED = (): Claim => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.paymentOption = PaymentOptionType.BY_SET_DATE;
  const unemployment = new Unemployment(UnemploymentCategory.RETIRED, undefined, undefined);

  claim.statementOfMeans = {
    unemployment: unemployment,
  };

  return claim as Claim;
};

export const createClaimWithUnemploymentCategoryOTHER = (): Claim => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.paymentOption = PaymentOptionType.BY_SET_DATE;
  const unemployment = new Unemployment(UnemploymentCategory.OTHER, undefined, new OtherDetails('Other details here'));

  claim.statementOfMeans = {
    unemployment: unemployment,
  };

  return claim as Claim;
};

export const createClaimWithDisability = (option:YesNo): Claim => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.paymentOption = PaymentOptionType.BY_SET_DATE;
  const disability: Disability = new Disability(option);
  const severeDisability: SevereDisability = new SevereDisability(option);
  claim.statementOfMeans = {
    disability: disability,
    severeDisability: severeDisability,
  };
  return claim;
};

export const createClaimWithDisabilityAndSevereDisability = (optionDisability:YesNo,optionSevereDisability:YesNo): Claim => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.paymentOption = PaymentOptionType.BY_SET_DATE;
  const disability: Disability = new Disability(optionDisability);
  const severeDisability: SevereDisability = new SevereDisability(optionSevereDisability);
  claim.statementOfMeans = {
    disability: disability,
    severeDisability: severeDisability,
  };
  return claim;
};

export const createClaimWithResidence = (value:string, displayValue:string): Claim => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.paymentOption = PaymentOptionType.BY_SET_DATE;
  const residence: Residence = new Residence(new ResidenceType(value, displayValue), '');
  claim.statementOfMeans = {
    residence: residence,
  };
  return claim;
};

export const createClaimWithResidenceOther = (): Claim => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.paymentOption = PaymentOptionType.BY_SET_DATE;
  const residence: Residence = new Residence(new ResidenceType('OTHER', 'Other'), 'Flat');
  claim.statementOfMeans = {
    residence: residence,
  };
  return claim;
};

export const createClaimWithCohabiting = (
  disabilityOption: YesNo,
  cohabitingOption: YesNo,
  partnerAgeOption: YesNo,
  partnerPensionOption: YesNo,
  partnerDisabilityOption: YesNo,
  partnerSevereDisabilityOption: YesNo): Claim => {

  const claim = createClaimWithBasicRespondentDetails();
  claim.paymentOption = PaymentOptionType.BY_SET_DATE;
  const disability: Disability = new Disability(disabilityOption);
  const cohabiting: Cohabiting = new Cohabiting(cohabitingOption);
  const partnerAge: PartnerAge = new PartnerAge(partnerAgeOption);
  const partnerPension: PartnerPension = new PartnerPension(partnerPensionOption);
  const partnerDisability: PartnerDisability = new PartnerDisability(partnerDisabilityOption);
  const partnerSevereDisability: PartnerSevereDisability = new PartnerSevereDisability(partnerSevereDisabilityOption);
  claim.statementOfMeans = {
    disability: disability,
    cohabiting: cohabiting,
    partnerAge: partnerAge,
    partnerPension: partnerPension,
    partnerDisability: partnerDisability,
    partnerSevereDisability: partnerSevereDisability,
  };
  return claim;
};

export const createClaimWithDependants = (declared: boolean, under11?:number, between11and15?:number, between16and19?:number, numberOfChildrenLivingWithYou?:number): Claim => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.paymentOption = PaymentOptionType.BY_SET_DATE;
  const numberOfChildren: NumberOfChildren = new NumberOfChildren(under11,between11and15,between16and19);
  const dependants: Dependants = new Dependants(declared, numberOfChildren);
  claim.statementOfMeans = {
    dependants: dependants,
    numberOfChildrenLivingWithYou: numberOfChildrenLivingWithYou,
  };
  return claim;
};

export const createClaimWithCarer = (option: YesNo): Claim => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.paymentOption = PaymentOptionType.BY_SET_DATE;
  const carer: Carer = new Carer(option);
  claim.statementOfMeans = {
    carer: carer,
  };
  return claim;
};

export const createClaimWithOtherDependants = (option: YesNo, numberOfPeople: number, details:string): Claim => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.paymentOption = PaymentOptionType.BY_SET_DATE;
  const otherDependants: OtherDependants = new OtherDependants(option, numberOfPeople, details);
  claim.statementOfMeans = {
    otherDependants: otherDependants,
  };
  return claim;
};

export const ceateClaimWithPartialAdmission = (alreadyPaid? :YesNo) => {
  const claim = new Claim();
  const param: HowMuchHaveYouPaidParams = {};
  param.amount = 100;
  param.totalClaimAmount = 200;
  param.day = '14';
  param.month = '2';
  param.year = '2022';
  param.text = 'Test details';

  const howMuchDoYouOwe: HowMuchDoYouOwe = new HowMuchDoYouOwe(100, 200);
  const whyDoYouDisagree: WhyDoYouDisagree = new WhyDoYouDisagree('Reasons for disagree');
  const howMuchHaveYouPaid: HowMuchHaveYouPaid = new HowMuchHaveYouPaid(param);

  const defendantTimeline: DefendantTimeline = new DefendantTimeline(
    [new TimelineRow('6 November 2022', 'Event 1'), new TimelineRow('7 November 2022', 'Event 2')],
    'Comments about timeline',
  );

  const defendantEvidence: DefendantEvidence = new Evidence(
    'Comments about their evidence',
    [
      new EvidenceItem(EvidenceType.CONTRACTS_AND_AGREEMENTS, 'Evidence details 1'),
      new EvidenceItem(EvidenceType.CORRESPONDENCE, 'Evidence details 2'),
      new EvidenceItem(EvidenceType.EXPERT_WITNESS, 'Evidence details 3'),
      new EvidenceItem(EvidenceType.PHOTO, 'Evidence details 4'),
      new EvidenceItem(EvidenceType.RECEIPTS, 'Evidence details 5'),
      new EvidenceItem(EvidenceType.STATEMENT_OF_ACCOUNT, 'Evidence details 7'),
      new EvidenceItem(EvidenceType.OTHER, 'Evidence details 8'),
    ],
  );

  const partialAdmission: PartialAdmission = {
    whyDoYouDisagree: whyDoYouDisagree,
    howMuchDoYouOwe: howMuchDoYouOwe,
    alreadyPaid: new AlreadyPaid(alreadyPaid || ''),
    howMuchHaveYouPaid: howMuchHaveYouPaid,
    timeline: defendantTimeline,
    paymentIntention: new PaymentIntention(),
  };
  claim.respondent1 = {
    partyName: PARTY_NAME,
    telephoneNumber: CONTACT_NUMBER,
    contactPerson: '',
    dateOfBirth: new Date('2000-12-12'),
    responseType: ResponseType.PART_ADMISSION,
    type: CounterpartyType.INDIVIDUAL,
    primaryAddress: {
      AddressLine1: '23 Brook lane',
      PostTown: 'Bristol',
      PostCode: 'BS13SS',
    },
  };
  claim.partialAdmission = partialAdmission;
  claim.evidence = defendantEvidence;
  return claim;
};

export const createClaimWithFreeTelephoneMediationSection = (): Claim => {
  const claim = createClaimWithBasicRespondentDetails('contactTest');
  if(claim.respondent1) {
    claim.respondent1.responseType = ResponseType.PART_ADMISSION;
  }
  claim.partialAdmission = new PartialAdmission();
  claim.partialAdmission.paymentIntention = new PaymentIntention();
  claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;

  claim.mediation = new Mediation({option:YesNo.YES, mediationPhoneNumber: '123456'},
    new FreeMediation(YesNo.YES),
    new NoMediationReason('notWant', 'no'),
    new CompanyTelephoneNumber(YesNo.YES, '123456', 'userTest', '123456'));

  return claim as Claim;
};
