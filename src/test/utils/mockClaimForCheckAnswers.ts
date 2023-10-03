import {Claim} from '../../main/common/models/claim';
import {ResponseType} from '../../main/common/form/models/responseType';
import {PaymentOptionType} from '../../main/common/form/models/admission/paymentOption/paymentOptionType';
import {
  TransactionSchedule,
} from '../../main/common/form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {PartyType} from '../../main/common/models/partyType';
import {DebtItems} from '../../main/common/form/models/statementOfMeans/debts/debtItems';
import {Debts} from '../../main/common/form/models/statementOfMeans/debts/debts';
import {PriorityDebts} from '../../main/common/form/models/statementOfMeans/priorityDebts';
import {Transaction} from '../../main/common/form/models/statementOfMeans/expensesAndIncome/transaction';
import {TransactionSource} from '../../main/common/form/models/statementOfMeans/expensesAndIncome/transactionSource';
import {RegularExpenses} from '../../main/common/form/models/statementOfMeans/expensesAndIncome/regularExpenses';
import {OtherTransaction} from '../../main/common/form/models/statementOfMeans/expensesAndIncome/otherTransaction';
import {RegularIncome} from '../../main/common/form/models/statementOfMeans/expensesAndIncome/regularIncome';
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
import {YesNo} from '../../main/common/form/models/yesNo';
import {Residence} from '../../main/common/form/models/statementOfMeans/residence/residence';
import {ResidenceType} from '../../main/common/form/models/statementOfMeans/residence/residenceType';
import {Dependants} from '../../main/common/form/models/statementOfMeans/dependants/dependants';
import {NumberOfChildren} from '../../main/common/form/models/statementOfMeans/dependants/numberOfChildren';
import {OtherDependants} from '../../main/common/form/models/statementOfMeans/otherDependants';
import {HowMuchDoYouOwe} from '../../main/common/form/models/admission/partialAdmission/howMuchDoYouOwe';
import {HowMuchHaveYouPaid, HowMuchHaveYouPaidParams} from '../../main/common/form/models/admission/howMuchHaveYouPaid';
import {WhyDoYouDisagree} from '../../main/common/form/models/admission/partialAdmission/whyDoYouDisagree';
import {PartialAdmission} from '../../main/common/models/partialAdmission';
import {DefendantTimeline} from '../../main/common/form/models/timeLineOfEvents/defendantTimeline';
import {PaymentIntention} from '../../main/common/form/models/admission/paymentIntention';
import {NoMediationReason} from '../../main/common/form/models/mediation/noMediationReason';
import {CompanyTelephoneNumber} from '../../main/common/form/models/mediation/companyTelephoneNumber';
import {Mediation} from '../../main/common/models/mediation/mediation';
import {EvidenceType} from '../../main/common/models/evidence/evidenceType';
import {EvidenceItem} from '../../main/common/form/models/evidence/evidenceItem';
import {DefendantEvidence} from '../../main/common/models/evidence/evidence';
import {Evidence} from '../../main/common/form/models/evidence/evidence';
import {GenericYesNo} from '../../main/common/form/models/genericYesNo';
import {TimelineRow} from '../../main/common/form/models/timeLineOfEvents/timelineRow';
import {RejectAllOfClaimType} from '../../main/common/form/models/rejectAllOfClaimType';
import {InterestClaimOptionsType} from '../../main/common/form/models/claim/interest/interestClaimOptionsType';
import {
  InterestClaimFromType,
  InterestEndDateType,
  SameRateInterestType,
} from '../../main/common/form/models/claimDetails';
import {Address} from '../../main/common/form/models/address';
import {FullAdmission} from '../../main/common/models/fullAdmission';
import {DebtRespiteStartDate} from '../../main/common/models/breathingSpace/debtRespiteStartDate';
import {DebtRespiteEndDate} from '../../main/common/models/breathingSpace/debtRespiteEndDate';
import {DebtRespiteOptionType} from '../../main/common/models/breathingSpace/debtRespiteOptionType';
import {ClaimDetails} from '../../main/common/form/models/claim/details/claimDetails';
import {ClaimantTimeline} from '../../main/common/form/models/timeLineOfEvents/claimantTimeline';
import {ClaimantResponse} from 'models/claimantResponse';
import {CCJRequest} from 'models/claimantResponse/ccj/ccjRequest';
import {CcjPaymentOption} from 'form/models/claimantResponse/ccj/ccjPaymentOption';
import {PaymentDate} from 'form/models/admission/fullAdmission/paymentOption/paymentDate';
import {PaidAmount} from 'models/claimantResponse/ccj/paidAmount';
import {RepaymentPlanInstalments} from 'models/claimantResponse/ccj/repaymentPlanInstalments';
import {InstalmentFirstPaymentDate} from 'models/claimantResponse/ccj/instalmentFirstPaymentDate';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {TrialArrangements} from 'models/caseProgression/trialArrangements/trialArrangements';
import {HasAnythingChangedForm} from 'models/caseProgression/trialArrangements/hasAnythingChangedForm';

const CONTACT_PERSON = 'The Post Man';
const PARTY_NAME = 'Nice organisation';
const TITLE = 'Mr';
const FIRST_NAME = 'John';
const LAST_NAME = 'Richards';
const CONTACT_NUMBER = '077777777779';
const EMAIL_ADDRESS = 'contact@gmail.com';

export const createClaimWithBasicRespondentDetails = (contactPerson?: string): Claim => {
  const claim = new Claim();
  claim.respondent1 = {
    partyPhone: {phone: CONTACT_NUMBER},
    emailAddress: {emailAddress: EMAIL_ADDRESS},
    dateOfBirth: {date: new Date('2000-12-12'), year: 1985, month: 2, day: 2},
    responseType: ResponseType.FULL_ADMISSION,
    type: PartyType.INDIVIDUAL,
    partyDetails: {
      partyName: PARTY_NAME,
      contactPerson: contactPerson,
      individualTitle: TITLE,
      individualLastName: LAST_NAME,
      individualFirstName: FIRST_NAME,
    },
  };
  claim.respondent1.partyDetails.primaryAddress = new Address('23 Brook lane', '', '', 'Bristol', 'BS13SS');
  claim.fullAdmission = new FullAdmission();
  const repaymentPlan = {
    paymentAmount: 100,
    repaymentFrequency: 'MONTH',
    firstRepaymentDate: new Date(Date.now()),
  };
  const mockDate = new Date(Date.now());
  mockDate.getMonth() + 1;
  claim.fullAdmission.paymentIntention = new PaymentIntention();
  claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;
  claim.fullAdmission.paymentIntention.paymentDate = mockDate;
  claim.fullAdmission.paymentIntention.repaymentPlan = repaymentPlan;
  return claim;
};
export const createClaimWithBasicClaimDetails = (contactPerson?: string): Claim => {
  const claim = new Claim();
  claim.applicant1 = {
    partyPhone: {phone: CONTACT_NUMBER},
    dateOfBirth: {date: new Date('2000-12-12'), year: 1985, month: 2, day: 2},
    responseType: ResponseType.FULL_ADMISSION,
    type: PartyType.INDIVIDUAL,
    partyDetails: {
      partyName: PARTY_NAME,
      contactPerson: contactPerson,
      individualTitle: TITLE,
      individualLastName: LAST_NAME,
      individualFirstName: FIRST_NAME,
    },
  };
  claim.claimDetails = new ClaimDetails();
  claim.applicant1.partyDetails.primaryAddress = new Address('23 Brook lane', '', '', 'Bristol', 'BS13SS');
  claim.fullAdmission = new FullAdmission();
  claim.fullAdmission.paymentIntention = new PaymentIntention();
  claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;
  return claim;
};
export const createClaimWithBasicDetails = (contactPerson?: string): Claim => {
  const claim = new Claim();
  claim.applicant1 = {
    partyPhone: {phone: CONTACT_NUMBER},
    dateOfBirth: {date: new Date('2000-12-12'), year: 1985, month: 2, day: 2},
    responseType: ResponseType.FULL_ADMISSION,
    type: PartyType.INDIVIDUAL,
    partyDetails: {
      partyName: PARTY_NAME,
      contactPerson: contactPerson,
      individualTitle: TITLE,
      individualLastName: LAST_NAME,
      individualFirstName: FIRST_NAME,
    },
  };
  claim.respondent1 = {
    partyPhone: {phone: CONTACT_NUMBER},
    dateOfBirth: {date: new Date('2000-12-12'), year: 1985, month: 2, day: 2},
    responseType: ResponseType.FULL_ADMISSION,
    type: PartyType.INDIVIDUAL,
    partyDetails: {
      partyName: PARTY_NAME,
      contactPerson: contactPerson,
      individualTitle: TITLE,
      individualLastName: LAST_NAME,
      individualFirstName: FIRST_NAME,
    },
  };
  claim.claimDetails = new ClaimDetails();
  claim.respondent1.partyDetails.primaryAddress = new Address('23 Brook lane', '', '', 'Bristol', 'BS13SS');
  claim.fullAdmission = new FullAdmission();
  claim.fullAdmission.paymentIntention = new PaymentIntention();
  claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;
  return claim;
};

export const createClaimWithBasicApplicantDetails = (contactPerson?: string): Claim => {
  const claim = new Claim();
  claim.applicant1 = {
    partyPhone: {phone: CONTACT_NUMBER},
    dateOfBirth: {date: new Date('2000-12-12'), year: 1985, month: 2, day: 2},
    type: PartyType.INDIVIDUAL,
    responseType: ResponseType.FULL_ADMISSION,
    partyDetails: {
      partyName: PARTY_NAME,
      individualTitle: TITLE,
      individualLastName: LAST_NAME,
      individualFirstName: FIRST_NAME,
      contactPerson: contactPerson,
    },
  };
  claim.applicant1.partyDetails.primaryAddress = new Address('23 Brook lane', '', '', 'Bristol', 'BS13SS');
  claim.fullAdmission = new FullAdmission();
  claim.fullAdmission.paymentIntention = new PaymentIntention();
  claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;
  return claim;
};

export const createClaimWithRespondentDetailsWithPaymentOption = (paymentOption: PaymentOptionType): Claim => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.fullAdmission = new FullAdmission();
  claim.fullAdmission.paymentIntention = new PaymentIntention();
  claim.fullAdmission.paymentIntention.paymentOption = paymentOption;
  claim.fullAdmission.paymentIntention.repaymentPlan = {
    paymentAmount: 33,
    repaymentFrequency: TransactionSchedule.WEEK,
    firstRepaymentDate: new Date('2022-06-25'),
  };
  claim.fullAdmission.paymentIntention.paymentDate = new Date('2022-06-25');
  claim.statementOfMeans = {
    explanation: {
      text: 'Reasons cannot pay immediately',
    },
  };
  return claim;
};

export const createClaimWithIndividualDetails = (): Claim => {
  const claim = new Claim();
  claim.respondent1 = {
    type: PartyType.INDIVIDUAL,
    responseType: ResponseType.FULL_ADMISSION,
    partyPhone: {phone: CONTACT_NUMBER},
    partyDetails: {
      individualTitle: TITLE,
      individualLastName: LAST_NAME,
      individualFirstName: FIRST_NAME,
      partyName: PARTY_NAME,
    },
  };
  claim.respondent1.partyDetails.primaryAddress = new Address('24 Brook lane', '', '', 'Bristol', 'BS13SS');
  claim.respondent1.partyDetails.correspondenceAddress = new Address('24 Brook lane', '', '', 'Bristol', 'BS13SS');
  return claim;
};
export const createClaimWithIndividualDetailsWithCcdPhoneExist = (): Claim => {
  const claim = new Claim();
  claim.respondent1 = {
    type: PartyType.INDIVIDUAL,
    responseType: ResponseType.FULL_ADMISSION,
    partyPhone: {phone: CONTACT_NUMBER, ccdPhoneExist: true},
    partyDetails: {
      individualTitle: TITLE,
      individualLastName: LAST_NAME,
      individualFirstName: FIRST_NAME,
      partyName: PARTY_NAME,
    },
  };
  claim.respondent1.partyDetails.primaryAddress = new Address('24 Brook lane', '', '', 'Bristol', 'BS13SS');
  claim.respondent1.partyDetails.correspondenceAddress = new Address('24 Brook lane', '', '', 'Bristol', 'BS13SS');
  return claim;
};

export const createClaimWithIndividualDetailsWithPartyPhoneNotExist = (): Claim => {
  const claim = new Claim();
  claim.respondent1 = {
    type: PartyType.INDIVIDUAL,
    responseType: ResponseType.FULL_ADMISSION,
    partyDetails: {
      individualTitle: TITLE,
      individualLastName: LAST_NAME,
      individualFirstName: FIRST_NAME,
      partyName: PARTY_NAME,
    },
  };
  claim.respondent1.partyDetails.primaryAddress = new Address('24 Brook lane', '', '', 'Bristol', 'BS13SS');
  claim.respondent1.partyDetails.correspondenceAddress = new Address('24 Brook lane', '', '', 'Bristol', 'BS13SS');
  return claim;
};

export const createClaimWithApplicantIndividualDetails = (): Claim => {
  const claim = new Claim();
  claim.applicant1 = {
    type: PartyType.INDIVIDUAL,
    partyPhone: {phone: CONTACT_NUMBER},
    responseType: ResponseType.FULL_ADMISSION,
    partyDetails: {
      individualTitle: TITLE,
      individualLastName: LAST_NAME,
      individualFirstName: FIRST_NAME,
      partyName: PARTY_NAME,
    },
  };
  claim.applicant1.partyDetails.primaryAddress = new Address('24 Brook lane', '', '', 'Bristol', 'BS13SS');
  claim.applicant1.partyDetails.correspondenceAddress = new Address('24 Brook lane', '', '', 'Bristol', 'BS13SS');

  return claim;
};

export const createCCJClaimWithClaimResponseDetailsForPayBySetDate = (): Claim => {
  const claim = new Claim();
  claim.claimantResponse = new ClaimantResponse();
  claim.claimantResponse.hasPartPaymentBeenAccepted = new GenericYesNo('Yes');
  claim.claimantResponse.ccjRequest = new CCJRequest();
  claim.claimantResponse.ccjRequest.ccjPaymentOption = new CcjPaymentOption();
  claim.claimantResponse.ccjRequest.ccjPaymentOption.type = PaymentOptionType.BY_SET_DATE;
  claim.claimantResponse.ccjRequest.defendantPaymentDate = new PaymentDate();
  claim.claimantResponse.ccjRequest.defendantPaymentDate.date = new Date('2023-12-25');
  claim.claimantResponse.ccjRequest.paidAmount = new PaidAmount();
  claim.claimantResponse.ccjRequest.paidAmount.option = YesNo.YES;
  claim.claimantResponse.ccjRequest.paidAmount.totalAmount = 1000;
  claim.claimantResponse.ccjRequest.paidAmount.amount = 200;
  claim.totalClaimAmount = 1000;
  return claim;
};

export const createCCJClaimWithClaimResponseDetailsForPayByInstalments = (): Claim => {
  const claim = new Claim();
  claim.claimantResponse = new ClaimantResponse();
  claim.claimantResponse.hasPartPaymentBeenAccepted = new GenericYesNo('Yes');
  claim.claimantResponse.ccjRequest = new CCJRequest();
  claim.claimantResponse.ccjRequest.ccjPaymentOption = new CcjPaymentOption();
  claim.claimantResponse.ccjRequest.ccjPaymentOption.type = PaymentOptionType.INSTALMENTS;
  claim.totalClaimAmount = 1000;
  claim.claimantResponse.ccjRequest.repaymentPlanInstalments = new RepaymentPlanInstalments();
  claim.claimantResponse.ccjRequest.repaymentPlanInstalments.amount = 200;
  const firstPaymentDate: Record<string, string> = {};
  firstPaymentDate['year'] = '2023';
  firstPaymentDate['month'] = '6';
  firstPaymentDate['day'] = '6';
  claim.claimantResponse.ccjRequest.repaymentPlanInstalments.firstPaymentDate = new InstalmentFirstPaymentDate(firstPaymentDate);
  claim.claimantResponse.ccjRequest.repaymentPlanInstalments.paymentFrequency = TransactionSchedule.WEEK;
  claim.claimantResponse.ccjRequest.paidAmount = new PaidAmount();
  claim.claimantResponse.ccjRequest.paidAmount.totalAmount = 1000;
  claim.claimantResponse.ccjRequest.paidAmount.amount = 200;
  claim.totalClaimAmount = 1000;
  claim.claimantResponse.ccjRequest.paidAmount.option = YesNo.YES;
  return claim;
};

export const createClaimWithContactPersonDetails = (): Claim => {
  return createClaimWithBasicRespondentDetails(CONTACT_PERSON);
};
export const createClaimWithContactPersonApplicantDetails = (): Claim => {
  return createClaimWithBasicApplicantDetails(CONTACT_PERSON);
};

export const createClaimWithOneBankAccount = (): Claim => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.fullAdmission = new FullAdmission();
  claim.fullAdmission.paymentIntention = new PaymentIntention();
  claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
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
  claim.fullAdmission = new FullAdmission();
  claim.fullAdmission.paymentIntention = new PaymentIntention();
  claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
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
  claim.fullAdmission = new FullAdmission();
  claim.fullAdmission.paymentIntention = new PaymentIntention();
  claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
  return claim as Claim;
};

export const createClaimWithCourtOrders = () => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.fullAdmission = new FullAdmission();
  claim.fullAdmission.paymentIntention = new PaymentIntention();
  claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
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
  claim.fullAdmission = new FullAdmission();
  claim.fullAdmission.paymentIntention = new PaymentIntention();
  claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
  const courtOrders: CourtOrders = new CourtOrders(true, []);

  claim.statementOfMeans = {
    courtOrders: courtOrders,
  };

  return claim as Claim;
};

export const createClaimWithDebts = (option: YesNo) => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.fullAdmission = new FullAdmission();
  claim.fullAdmission.paymentIntention = new PaymentIntention();
  claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;

  const debts: Debts = new Debts();
  debts.option = option;
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
  claim.fullAdmission = new FullAdmission();
  claim.fullAdmission.paymentIntention = new PaymentIntention();
  claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;

  const priorityDebts: PriorityDebts = new PriorityDebts(
    {
      mortgage: new Transaction(true, new TransactionSource({
        name: 'Mortgage',
        amount: 1000,
        schedule: TransactionSchedule.WEEK,
        isIncome: false,
      })),
      rent: new Transaction(true, new TransactionSource({
        name: 'Rent',
        amount: 2000,
        schedule: TransactionSchedule.FOUR_WEEKS,
        isIncome: false,
      })),
      gas: new Transaction(true, new TransactionSource({
        name: 'Gas',
        amount: 300,
        schedule: TransactionSchedule.WEEK,
        isIncome: false,
      })),
      councilTax: new Transaction(true, new TransactionSource({
        name: 'Council Tax or Community Charge',
        amount: 500.55,
        schedule: TransactionSchedule.FOUR_WEEKS,
        isIncome: false,
      })),
      electricity: new Transaction(true, new TransactionSource({
        name: 'Electricity',
        amount: 400,
        schedule: TransactionSchedule.TWO_WEEKS,
        isIncome: false,
      })),
      water: new Transaction(true, new TransactionSource({
        name: 'Water',
        amount: 500,
        schedule: TransactionSchedule.MONTH,
        isIncome: false,
      })),
      maintenance: new Transaction(true, new TransactionSource({
        name: 'Maintenance Payments',
        amount: 500,
        schedule: TransactionSchedule.TWO_WEEKS,
        isIncome: false,
      })),
    });

  claim.statementOfMeans = {
    priorityDebts: priorityDebts,
  };

  return claim as Claim;
};

export const createClaimWithMultipleDebt = (): Claim => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.fullAdmission = new FullAdmission();
  claim.fullAdmission.paymentIntention = new PaymentIntention();
  claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;

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
  claim.fullAdmission = new FullAdmission();
  claim.fullAdmission.paymentIntention = new PaymentIntention();
  claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;

  const otherExpenses: TransactionSource[] = [
    new TransactionSource({
      name: 'Expenses 1',
      amount: 1000,
      schedule: TransactionSchedule.TWO_WEEKS,
      isIncome: false,
      nameRequired: true,
    }),
    new TransactionSource({
      name: 'Expenses 2',
      amount: 2000,
      schedule: TransactionSchedule.MONTH,
      isIncome: false,
      nameRequired: true,
    }),
  ];

  const expense_regular: RegularExpenses = new RegularExpenses(
    {
      mortgage: new Transaction(true, new TransactionSource({
        name: 'mortgage',
        amount: 1000,
        schedule: TransactionSchedule.WEEK,
        isIncome: false,
      })),
      rent: new Transaction(true, new TransactionSource({
        name: 'rent',
        amount: 300,
        schedule: TransactionSchedule.WEEK,
        isIncome: false,
      })),
      gas: new Transaction(true, new TransactionSource({
        name: 'gas',
        amount: 100,
        schedule: TransactionSchedule.TWO_WEEKS,
        isIncome: false,
      })),
      councilTax: new Transaction(true, new TransactionSource({
        name: 'councilTax',
        amount: 10000,
        schedule: TransactionSchedule.FOUR_WEEKS,
        isIncome: false,
      })),
      electricity: new Transaction(true, new TransactionSource({
        name: 'electricity',
        amount: 100,
        schedule: TransactionSchedule.FOUR_WEEKS,
        isIncome: false,
      })),
      water: new Transaction(true, new TransactionSource({
        name: 'water',
        amount: 400,
        schedule: TransactionSchedule.TWO_WEEKS,
        isIncome: false,
      })),
      travel: new Transaction(true, new TransactionSource({
        name: 'travel',
        amount: 500,
        schedule: TransactionSchedule.MONTH,
        isIncome: false,
      })),
      schoolCosts: new Transaction(true, new TransactionSource({
        name: 'school costs (include clothing)',
        amount: 600,
        schedule: TransactionSchedule.WEEK,
        isIncome: false,
      })),
      foodAndHousekeeping: new Transaction(true, new TransactionSource({
        name: 'food and housekeeping',
        amount: 700,
        schedule: TransactionSchedule.MONTH,
        isIncome: false,
      })),
      tvAndBroadband: new Transaction(true, new TransactionSource({
        name: 'TV and broadband',
        amount: 500.50,
        schedule: TransactionSchedule.FOUR_WEEKS,
        isIncome: false,
      })),
      hirePurchase: new Transaction(true, new TransactionSource({
        name: 'hire purchase',
        amount: 44.40,
        schedule: TransactionSchedule.TWO_WEEKS,
        isIncome: false,
      })),
      mobilePhone: new Transaction(true, new TransactionSource({
        name: 'mobile phone',
        amount: 25,
        schedule: TransactionSchedule.TWO_WEEKS,
        isIncome: false,
      })),
      maintenance: new Transaction(true, new TransactionSource({
        name: 'maintenance payments',
        amount: 120,
        schedule: TransactionSchedule.TWO_WEEKS,
        isIncome: false,
      })),
      other: new OtherTransaction(true, otherExpenses),
    });

  claim.statementOfMeans = {
    regularExpenses: expense_regular,
  };

  return claim as Claim;
};

export const createClaimWithRegularIncome = (): Claim => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.fullAdmission = new FullAdmission();
  claim.fullAdmission.paymentIntention = new PaymentIntention();
  claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;

  const otherIncome: TransactionSource[] = [
    new TransactionSource({
      name: 'Income 1',
      amount: 1000,
      schedule: TransactionSchedule.TWO_WEEKS,
      isIncome: true,
      nameRequired: true,
    }),
    new TransactionSource({
      name: 'Income 2',
      amount: 2000,
      schedule: TransactionSchedule.MONTH,
      isIncome: true,
      nameRequired: true,
    }),
  ];

  const income_regular: RegularIncome = new RegularIncome(
    {
      job: new Transaction(true, new TransactionSource({
        name: 'job',
        amount: 1000,
        schedule: TransactionSchedule.WEEK,
        isIncome: true,
      })),
      universalCredit: new Transaction(true, new TransactionSource({
        name: 'universalCredit',
        amount: 200,
        schedule: TransactionSchedule.WEEK,
        isIncome: true,
      })),
      jobseekerAllowanceIncome: new Transaction(true, new TransactionSource({
        name: 'jobseekerAllowanceIncome',
        amount: 300,
        schedule: TransactionSchedule.WEEK,
        isIncome: true,
      })),
      jobseekerAllowanceContribution: new Transaction(true, new TransactionSource({
        name: 'jobseekerAllowanceContribution',
        amount: 350.50,
        schedule: TransactionSchedule.WEEK,
        isIncome: true,
      })),
      incomeSupport: new Transaction(true, new TransactionSource({
        name: 'incomeSupport',
        amount: 475.33,
        schedule: TransactionSchedule.WEEK,
        isIncome: true,
      })),
      workingTaxCredit: new Transaction(true, new TransactionSource({
        name: 'workingTaxCredit',
        amount: 400.70,
        schedule: TransactionSchedule.WEEK,
        isIncome: true,
      })),
      childTaxCredit: new Transaction(true, new TransactionSource({
        name: 'childTaxCredit',
        amount: 550.50,
        schedule: TransactionSchedule.WEEK,
        isIncome: true,
      })),
      childBenefit: new Transaction(true, new TransactionSource({
        name: 'childBenefit',
        amount: 600,
        schedule: TransactionSchedule.WEEK,
        isIncome: true,
      })),
      councilTaxSupport: new Transaction(true, new TransactionSource({
        name: 'councilTaxSupport',
        amount: 10,
        schedule: TransactionSchedule.WEEK,
        isIncome: true,
      })),
      pension: new Transaction(true, new TransactionSource({
        name: 'pension',
        amount: 247,
        schedule: TransactionSchedule.WEEK,
        isIncome: true,
      })),
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
  claim.fullAdmission = new FullAdmission();
  claim.fullAdmission.paymentIntention = new PaymentIntention();
  claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;

  const employmentType: EmploymentCategory[] = [EmploymentCategory.EMPLOYED, EmploymentCategory.SELF_EMPLOYED];
  const employment: Employment = {declared: true, employmentType: employmentType};
  const selfEmployedAs: SelfEmployedAs = {jobTitle: 'Developer', annualTurnover: 50000};

  claim.statementOfMeans = {
    employment: employment,
    employers: createEmployers(),
    selfEmployedAs: selfEmployedAs,
  };

  return claim as Claim;
};

export const createClaimWithEmployedCategory = (): Claim => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.fullAdmission = new FullAdmission();
  claim.fullAdmission.paymentIntention = new PaymentIntention();
  claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;

  const employmentType: EmploymentCategory[] = [EmploymentCategory.EMPLOYED];
  const employment: Employment = {declared: true, employmentType: employmentType};

  claim.statementOfMeans = {
    employment: employment,
    employers: createEmployers(),
  };

  return claim as Claim;
};

export const createClaimWithSelfEmployedAndTaxBehind = (): Claim => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.fullAdmission = new FullAdmission();
  claim.fullAdmission.paymentIntention = new PaymentIntention();
  claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;

  const employmentType: EmploymentCategory[] = [EmploymentCategory.SELF_EMPLOYED];
  const employment: Employment = {declared: true, employmentType: employmentType};
  const selfEmployedAs: SelfEmployedAs = {jobTitle: 'Developer', annualTurnover: 50000};
  const taxPayments: TaxPayments = {owed: true, amountOwed: 200, reason: 'Tax payment reasons'};

  claim.statementOfMeans = {
    employment: employment,
    selfEmployedAs: selfEmployedAs,
    taxPayments: taxPayments,
  };

  return claim as Claim;
};

export const createClaimWithSelfEmployedNoTaxBehind = (): Claim => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.fullAdmission = new FullAdmission();
  claim.fullAdmission.paymentIntention = new PaymentIntention();
  claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;

  const employmentType: EmploymentCategory[] = [EmploymentCategory.SELF_EMPLOYED];
  const employment: Employment = {declared: true, employmentType: employmentType};
  const selfEmployedAs: SelfEmployedAs = {jobTitle: 'Developer', annualTurnover: 50000};
  const taxPayments: TaxPayments = {owed: false, amountOwed: undefined, reason: ''};

  claim.statementOfMeans = {
    employment: employment,
    selfEmployedAs: selfEmployedAs,
    taxPayments: taxPayments,
  };

  return claim as Claim;
};

export const createClaimWithUnemplymentDetailsOne = (): Claim => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.fullAdmission = new FullAdmission();
  claim.fullAdmission.paymentIntention = new PaymentIntention();
  claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
  const unemployment = new Unemployment(UnemploymentCategory.UNEMPLOYED, new UnemploymentDetails('1', '1'), undefined);

  claim.statementOfMeans = {
    unemployment: unemployment,
  };

  return claim as Claim;
};

export const createClaimWithUnemplymentDetailsTwo = (): Claim => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.fullAdmission = new FullAdmission();
  claim.fullAdmission.paymentIntention = new PaymentIntention();
  claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
  const unemployment = new Unemployment(UnemploymentCategory.UNEMPLOYED, new UnemploymentDetails('10', '10'), undefined);

  claim.statementOfMeans = {
    unemployment: unemployment,
  };

  return claim as Claim;
};

export const createClaimWithUnemploymentCategoryRETIRED = (): Claim => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.fullAdmission = new FullAdmission();
  claim.fullAdmission.paymentIntention = new PaymentIntention();
  claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
  const unemployment = new Unemployment(UnemploymentCategory.RETIRED, undefined, undefined);

  claim.statementOfMeans = {
    unemployment: unemployment,
  };

  return claim as Claim;
};

export const createClaimWithUnemploymentCategoryOTHER = (): Claim => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.fullAdmission = new FullAdmission();
  claim.fullAdmission.paymentIntention = new PaymentIntention();
  claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
  const unemployment = new Unemployment(UnemploymentCategory.OTHER, undefined, new OtherDetails('Other details here'));

  claim.statementOfMeans = {
    unemployment: unemployment,
  };

  return claim as Claim;
};

export const createClaimWithDisability = (option: YesNo): Claim => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.fullAdmission = new FullAdmission();
  claim.fullAdmission.paymentIntention = new PaymentIntention();
  claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
  const disability: GenericYesNo = new GenericYesNo(option);
  const severeDisability: GenericYesNo = new GenericYesNo(option);
  claim.statementOfMeans = {
    disability: disability,
    severeDisability: severeDisability,
  };
  return claim;
};

export const createClaimWithDisabilityAndSevereDisability = (optionDisability: YesNo, optionSevereDisability: YesNo): Claim => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.fullAdmission = new FullAdmission();
  claim.fullAdmission.paymentIntention = new PaymentIntention();
  claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
  const disability: GenericYesNo = new GenericYesNo(optionDisability);
  const severeDisability: GenericYesNo = new GenericYesNo(optionSevereDisability);
  claim.statementOfMeans = {
    disability: disability,
    severeDisability: severeDisability,
  };
  return claim;
};

export const createClaimWithResidence = (value: ResidenceType): Claim => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.fullAdmission = new FullAdmission();
  claim.fullAdmission.paymentIntention = new PaymentIntention();
  claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
  const residence: Residence = new Residence(value, '');
  claim.statementOfMeans = {
    residence: residence,
  };
  return claim;
};

export const createClaimWithResidenceOther = (): Claim => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.fullAdmission = new FullAdmission();
  claim.fullAdmission.paymentIntention = new PaymentIntention();
  claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
  const residence: Residence = new Residence(ResidenceType.OTHER, 'Flat');
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
  claim.fullAdmission = new FullAdmission();
  claim.fullAdmission.paymentIntention = new PaymentIntention();
  claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
  const disability: GenericYesNo = new GenericYesNo(disabilityOption);
  const cohabiting: GenericYesNo = new GenericYesNo(cohabitingOption);
  const partnerAge: GenericYesNo = new GenericYesNo(partnerAgeOption);
  const partnerPension: GenericYesNo = new GenericYesNo(partnerPensionOption);
  const partnerDisability: GenericYesNo = new GenericYesNo(partnerDisabilityOption);
  const partnerSevereDisability: GenericYesNo = new GenericYesNo(partnerSevereDisabilityOption);
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

export const createClaimWithDependants = (declared: boolean, under11?: number, between11and15?: number, between16and19?: number, numberOfChildrenLivingWithYou?: number): Claim => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.fullAdmission = new FullAdmission();
  claim.fullAdmission.paymentIntention = new PaymentIntention();
  claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
  const numberOfChildren: NumberOfChildren = new NumberOfChildren(under11, between11and15, between16and19);
  const dependants: Dependants = new Dependants(declared, numberOfChildren);
  claim.statementOfMeans = {
    dependants: dependants,
    numberOfChildrenLivingWithYou: numberOfChildrenLivingWithYou,
  };
  return claim;
};

export const createClaimWithCarer = (option: YesNo): Claim => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.fullAdmission = new FullAdmission();
  claim.fullAdmission.paymentIntention = new PaymentIntention();
  claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
  const carer: GenericYesNo = new GenericYesNo(option);
  claim.statementOfMeans = {
    carer: carer,
  };
  return claim;
};

export const createClaimWithOtherDependants = (option: YesNo, numberOfPeople: number, details: string): Claim => {
  const claim = createClaimWithBasicRespondentDetails();
  claim.fullAdmission = new FullAdmission();
  claim.fullAdmission.paymentIntention = new PaymentIntention();
  claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
  const otherDependants: OtherDependants = new OtherDependants(option, numberOfPeople, details);
  claim.statementOfMeans = {
    otherDependants: otherDependants,
  };
  return claim;
};

export const ceateClaimWithPartialAdmission = (alreadyPaid?: YesNo, paymentOptionType?: PaymentOptionType) => {
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

  const timeline: DefendantTimeline = new DefendantTimeline(
    [new TimelineRow(6, 11, 2022, 'Event 1'), new TimelineRow(7, 11, 2022, 'Event 2')],
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
    alreadyPaid: new GenericYesNo(alreadyPaid || ''),
    howMuchHaveYouPaid: howMuchHaveYouPaid,
    timeline,
    paymentIntention: new PaymentIntention(),
  };
  claim.respondent1 = {
    dateOfBirth: {date: new Date('2000-12-12'), year: 1985, month: 2, day: 2},
    responseType: ResponseType.PART_ADMISSION,
    type: PartyType.INDIVIDUAL,
    partyPhone: {phone: CONTACT_NUMBER},
    partyDetails: {
      partyName: PARTY_NAME,
      contactPerson: '',
    },
  };
  claim.respondent1.partyDetails.primaryAddress = new Address('24 Brook lane', '', '', 'Bristol', 'BS13SS');
  claim.partialAdmission = partialAdmission;
  claim.evidence = defendantEvidence;
  claim.partialAdmission.paymentIntention?.paymentOption ? paymentOptionType : undefined;
  return claim;
};

export const createClaimWithFreeTelephoneMediationSection = (): Claim => {
  const claim = createClaimWithBasicRespondentDetails('contactTest');
  if (claim.respondent1) {
    claim.respondent1.responseType = ResponseType.PART_ADMISSION;
  }
  claim.partialAdmission = new PartialAdmission();
  claim.partialAdmission.paymentIntention = new PaymentIntention();
  claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;

  claim.mediation = new Mediation({option: YesNo.YES, mediationPhoneNumber: '123456'},
    new GenericYesNo(YesNo.YES),
    new NoMediationReason('notWant', 'no'),
    new CompanyTelephoneNumber(YesNo.YES, '123456', 'userTest', '123456'));

  return claim as Claim;
};

export const createClaimWithFreeTelephoneMediationSectionForIndividual = (): Claim => {
  const claim = createClaimWithBasicRespondentDetails('contactTest');
  if (claim.respondent1) {
    claim.respondent1.responseType = ResponseType.PART_ADMISSION;
    claim.respondent1.type = PartyType.INDIVIDUAL;
  }
  const timeline: DefendantTimeline = new DefendantTimeline(
    [new TimelineRow(6, 11, 2022, 'Event 1'), new TimelineRow(7, 11,  2022, 'Event 2')],
    'Comments about timeline',
  );
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
  claim.partialAdmission = {
    whyDoYouDisagree: whyDoYouDisagree,
    howMuchDoYouOwe: howMuchDoYouOwe,
    alreadyPaid: new GenericYesNo(YesNo.YES),
    howMuchHaveYouPaid: howMuchHaveYouPaid,
    timeline,
    paymentIntention: new PaymentIntention(),
  };
  claim.mediation = new Mediation({option: YesNo.NO, mediationPhoneNumber: '01632960001'});

  return claim as Claim;
};

export const createClaimWithFullRejection = (option: RejectAllOfClaimType, paidAmount?: number): Claim => {
  const claim = createClaimWithBasicRespondentDetails();
  if (claim.respondent1) {
    claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
  }
  claim.rejectAllOfClaim = {
    option: option,
    howMuchHaveYouPaid: {
      amount: paidAmount || 100,
      date: new Date('2022-02-14T00:00:00.000Z'),
      day: 14,
      month: 2,
      year: 2022,
      text: 'details here...',
    },
    whyDoYouDisagree: {
      text: 'Reasons for disagree',
    },
  };
  claim.totalClaimAmount = 1000;
  claim.fullAdmission = new FullAdmission();
  claim.fullAdmission.paymentIntention = new PaymentIntention();
  claim.fullAdmission.paymentIntention.paymentOption = undefined;
  return claim;
};

export const createClaimWithPaymentOption = (responseType: ResponseType, paymentOption: PaymentOptionType): Claim => {
  const claim = createClaimWithBasicRespondentDetails();
  const getDate = () => Date.now() + (3600 * 1000 * 24);

  if (claim.respondent1) {
    claim.respondent1.responseType = responseType;
  }
  claim.fullAdmission.paymentIntention.paymentOption = paymentOption;
  claim.fullAdmission.paymentIntention.repaymentPlan = {
    paymentAmount: 33,
    repaymentFrequency: TransactionSchedule.WEEK,
    firstRepaymentDate: new Date(getDate()),
  };

  claim.fullAdmission.paymentIntention.paymentDate = new Date(getDate());
  claim.statementOfMeans = {
    explanation: {
      text: 'Reasons cannot pay immediately',
    },
  };

  claim.partialAdmission = new PartialAdmission();
  claim.partialAdmission.paymentIntention = new PaymentIntention();
  claim.partialAdmission.paymentIntention.paymentOption = paymentOption;
  claim.partialAdmission.paymentIntention.repaymentPlan = {
    paymentAmount: 33,
    repaymentFrequency: TransactionSchedule.WEEK,
    firstRepaymentDate: new Date(getDate()),
  };

  if (responseType === ResponseType.PART_ADMISSION && paymentOption === PaymentOptionType.BY_SET_DATE) {
    claim.partialAdmission.paymentIntention.paymentDate = new Date(getDate());
  }

  claim.partialAdmission.alreadyPaid = new GenericYesNo(YesNo.NO);

  claim.mediation = new Mediation({option: YesNo.YES, mediationPhoneNumber: '123456'},
    new GenericYesNo(YesNo.YES),
    new NoMediationReason('notWant', 'no'),
    new CompanyTelephoneNumber(YesNo.YES, '123456', 'userTest', '123456'));

  return claim;
};
export const claimWithClaimAmountParticularDate = (): Claim => {
  const claim = new Claim();
  claim.claimInterest = YesNo.YES;

  claim.interest = {
    interestEndDate: InterestEndDateType.UNTIL_SETTLED_OR_JUDGEMENT_MADE,
    interestStartDate: {
      day: 1,
      month: 1,
      year: 2011,
      date: new Date(2011, 1, 1),
      reason: 'Reason',
    },
    interestClaimFrom: InterestClaimFromType.FROM_A_SPECIFIC_DATE,
    interestClaimOptions: InterestClaimOptionsType.SAME_RATE_INTEREST,
    sameRateInterestSelection: {
      sameRateInterestType: SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE,
      differentRate: 10,
      reason: 'Reason',
    },
  };

  return claim;
};
export const claimWithClaimAmountSubmitDate = (): Claim => {
  const claim = new Claim();
  claim.claimInterest = YesNo.YES;
  claim.interest = {
    interestClaimFrom: InterestClaimFromType.FROM_CLAIM_SUBMIT_DATE,
    interestClaimOptions: InterestClaimOptionsType.SAME_RATE_INTEREST,
    sameRateInterestSelection: {sameRateInterestType: SameRateInterestType.SAME_RATE_INTEREST_8_PC},
  };

  return claim;
};

export const claimWithClaimAmountSameRate = (): Claim => {
  const claim = new Claim();
  claim.interest = {
    interestClaimOptions: InterestClaimOptionsType.SAME_RATE_INTEREST,
    sameRateInterestSelection: {sameRateInterestType: SameRateInterestType.SAME_RATE_INTEREST_8_PC},
  };
  return claim;
};

export const claimWithClaimAmountDifferentRate = (): Claim => {
  const claim = new Claim();
  claim.interest = {
    sameRateInterestSelection: {
      sameRateInterestType: SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE,
      differentRate: 10,
      reason: 'Reason',
    },
  };

  return claim;
};
export const claimWithClaimAmountBreakDown = (): Claim => {
  const claim = new Claim();

  claim.claimAmountBreakup = [{value: {claimAmount: '200', claimReason: 'roof'}},
    {value: {claimAmount: '2000', claimReason: 'pool'}},
    {value: {claimAmount: '300', claimReason: 'door'}}];

  return claim;
};
export const claimWithClaimAmountOneBreakDown = (): Claim => {
  const claim = new Claim();

  claim.claimAmountBreakup = [{value: {claimAmount: '200', claimReason: 'roof'}}];

  return claim;
};

export const getClaimWithFewDetails = (): Claim => {
  const claim = new Claim();
  claim.claimDetails = new ClaimDetails();
  claim.claimDetails.breathingSpace = {
    debtRespiteReferenceNumber: {
      referenceNumber: 'R225B1230',
    },
    debtRespiteOption: {
      type: DebtRespiteOptionType.STANDARD || DebtRespiteOptionType.MENTAL_HEALTH,
    },
    debtRespiteStartDate: new DebtRespiteStartDate('10', 'January', '2022'),
    debtRespiteEndDate: new DebtRespiteEndDate('10', 'December', '2022'),

  };
  return claim;
};

export const getClaimWithNoDetails = (): Claim => {
  const claim = new Claim();
  claim.claimDetails = new ClaimDetails();
  claim.claimDetails.breathingSpace = {
    debtRespiteReferenceNumber: {
      referenceNumber: '',
    },
    debtRespiteOption: {
      type: DebtRespiteOptionType.STANDARD || DebtRespiteOptionType.MENTAL_HEALTH,
    },
    debtRespiteStartDate: new DebtRespiteStartDate(),
    debtRespiteEndDate: new DebtRespiteEndDate(),

  };
  return claim;
};

export const claimWithClaimTimeLineAndEvents = (): Claim => {
  const claim = new Claim();
  claim.claimDetails = new ClaimDetails();
  claim.claimDetails.evidence = new Evidence('test', [new EvidenceItem(EvidenceType.CONTRACTS_AND_AGREEMENTS, 'roof'), new EvidenceItem(EvidenceType.EXPERT_WITNESS, 'door')]);
  claim.claimDetails.timeline = new ClaimantTimeline([new TimelineRow(1, 2, 2000, 'contract'), new TimelineRow(1, 2, 2002, 'meeting'), new TimelineRow(1, 2, 1999, 'damages')]);

  return claim;
};

export const getClaimWithDefendantTrialArrangements = (): Claim => {
  const claim = new Claim();
  const caseProgression = new CaseProgression();
  const defendantTrialArrangements = new TrialArrangements();
  defendantTrialArrangements.otherTrialInformation = 'Other Information';
  defendantTrialArrangements.isCaseReady = YesNo.YES;
  const hasAnythingChanged = new HasAnythingChangedForm();
  hasAnythingChanged.textArea = 'Changed';
  hasAnythingChanged.option = YesNo.YES;
  defendantTrialArrangements.hasAnythingChanged = hasAnythingChanged;
  caseProgression.defendantTrialArrangements = defendantTrialArrangements;
  claim.caseProgression = caseProgression;
  return claim;
};

export const getClaimWithClaimantTrialArrangements = (): Claim => {
  const claim = new Claim();
  const caseProgression = new CaseProgression();
  const claimantTrialArrangements = new TrialArrangements();
  claimantTrialArrangements.otherTrialInformation = 'Other Information';
  claimantTrialArrangements.isCaseReady = YesNo.YES;
  const hasAnythingChanged = new HasAnythingChangedForm();
  hasAnythingChanged.textArea = 'Changed';
  hasAnythingChanged.option = YesNo.YES;
  claimantTrialArrangements.hasAnythingChanged = hasAnythingChanged;
  caseProgression.claimantTrialArrangements = claimantTrialArrangements;
  claim.caseProgression = caseProgression;
  return claim;
};

