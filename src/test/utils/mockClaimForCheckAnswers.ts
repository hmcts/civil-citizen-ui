import {Claim} from '../../main/common/models/claim';
import {ResponseType} from '../../main/common/form/models/responseType';
import PaymentOptionType
  from '../../main/common/form/models/admission/fullAdmission/paymentOption/paymentOptionType';
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
  claim.paymentOption = ResponseType.FULL_ADMISSION;
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

export const createClaimWithCourtOrders = () => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.paymentOption = ResponseType.FULL_ADMISSION;
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
  claim.paymentOption = ResponseType.FULL_ADMISSION;
  const courtOrders: CourtOrders = new CourtOrders(true, []);

  claim.statementOfMeans = {
    courtOrders: courtOrders,
  };

  return claim as Claim;
};

export const createClaimWithDebts = () => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.paymentOption = ResponseType.FULL_ADMISSION;

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
