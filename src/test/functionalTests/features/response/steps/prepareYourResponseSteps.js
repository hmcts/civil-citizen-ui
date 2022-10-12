//import { TaskListPage } from '../pages/taskList';
const TaskListPage = require('../pages/taskList');
// import { NameAndAddressDetailsPage } from '../pages/enterNameAndAddressDetails';
// import { DateOfBirthDetailsPage } from '../pages/enterDateOfBirthDetails';
// import { ContactNumberDetailsPage } from '../pages/enterContactNumberDetails';
// import { RespondTypePage } from '../pages/respondType';
// import { PaymentOptionPage } from '../pages/paymentOption';
// import { CheckYourAnswersPage } from '../pages/checkYourAnswers';
// import { DateToPayOn } from '../pages/dateToPayOn';
// import { ShareYouFinancialDetailsIntro } from '../pages/shareYouFinancialDetailsIntro';
// import { BankAccountsDetails } from '../pages/bankAccountsDetails';
// import { DisabilityDetails } from '../pages/disabilityDetails';
// import { SevereDisabilityDetails } from '../pages/severeDisabilityDetails';
// import { ResidenceDetails } from '../pages/residenceDetails';
// import { PartnerDetails } from '../pages/partnerDetails';
// import { PartnerAgeDetails } from '../pages/partnerAgeDetails';
// import { PartnerPensionDetails } from '../pages/partnerPensionDetails';
// import { PartnerDisabilityDetails } from '../pages/partnerDisabilityDetails';
// import { DependantDetails } from '../pages/dependantDetails';
// import { OtherDependantDetails } from '../pages/otherDependantDetails';
// import { EmploymentDetails } from '../pages/employment';
// import { EmployerDetails } from '../pages/employerDetails';
// import { SelfEmploymentDetails } from '../pages/selfEmploymentDetails';
// import { SelfEmploymentTaxDetails } from '../pages/selfEmploymentTaxDetails';
// import { CourtOrders } from '../pages/courtOrders';
// import { PriorityDebtsDetails } from '../pages/priorityDebtsDetails';
// import { Debts } from '../pages/debts';
// import { MonthlyExpenses } from '../pages/monthlyExpenses';
// import { MonthlyIncome } from '../pages/monthlyIncome';
// import { Explanation } from '../pages/explanation';
// import { RepaymentPlan } from '../pages/repaymentPlan';
// import { PartAdmitAlreadyPaid } from '../pages/partAdmitAlreadyPaid';
// import { RejectAllOfClaim } from '../pages/rejectAllOfClaim';
// import { CarerDetails } from '../pages/carerDetails';

const  NameAndAddressDetailsPage  =  require('../pages/enterNameAndAddressDetails');
const  DateOfBirthDetailsPage  =  require('../pages/enterDateOfBirthDetails');
const  ContactNumberDetailsPage  =  require('../pages/enterContactNumberDetails');
const  RespondTypePage  =  require('../pages/respondType');
const  PaymentOptionPage  =  require('../pages/paymentOption');
const  CheckYourAnswersPage  =  require('../pages/checkYourAnswers');
const  DateToPayOn  =  require('../pages/dateToPayOn');
const  ShareYouFinancialDetailsIntro  =  require('../pages/shareYouFinancialDetailsIntro');
const  BankAccountsDetails  =  require('../pages/bankAccountsDetails');
const  DisabilityDetails  =  require('../pages/disabilityDetails');
const  SevereDisabilityDetails  =  require('../pages/severeDisabilityDetails');
const  ResidenceDetails  =  require('../pages/residenceDetails');
const  PartnerDetails  =  require('../pages/partnerDetails');
const  PartnerAgeDetails  =  require('../pages/partnerAgeDetails');
const  PartnerPensionDetails  =  require('../pages/partnerPensionDetails');
const  PartnerDisabilityDetails  =  require('../pages/partnerDisabilityDetails');
const  DependantDetails  =  require('../pages/dependantDetails');
const  OtherDependantDetails  =  require('../pages/otherDependantDetails');
const  EmploymentDetails  =  require('../pages/employment');
const  EmployerDetails  =  require('../pages/employerDetails');
const  SelfEmploymentDetails  =  require('../pages/selfEmploymentDetails');
const  SelfEmploymentTaxDetails  =  require('../pages/selfEmploymentTaxDetails');
const  CourtOrders  =  require('../pages/courtOrders');
const  PriorityDebtsDetails  =  require('../pages/priorityDebtsDetails');
const  Debts  =  require('../pages/debts');
const  MonthlyExpenses  =  require('../pages/monthlyExpenses');
const  MonthlyIncome  =  require('../pages/monthlyIncome');
const  Explanation  =  require('../pages/explanation');
const  RepaymentPlan  =  require('../pages/repaymentPlan');
const  PartAdmitAlreadyPaid  =  require('../pages/partAdmitAlreadyPaid');
const  RejectAllOfClaim  =  require('../pages/rejectAllOfClaim');
const  CarerDetails  =  require('../pages/carerDetails');

//const I = actor();
const taskListPage = new TaskListPage();
const nameAndAddressDetailsPage  = new NameAndAddressDetailsPage();
const dateOfBirthDetailsPage = new DateOfBirthDetailsPage();
const contactNumberDetailsPage = new ContactNumberDetailsPage();
const respondTypePage = new RespondTypePage();
const paymentOptionPage = new PaymentOptionPage();
const checkYourAnswersPage = new CheckYourAnswersPage();
const dateToPayOn = new DateToPayOn();
const shareYourFinancialDetailsIntro = new ShareYouFinancialDetailsIntro();
const bankAccountDetails = new BankAccountsDetails();
const disabilityDetails = new DisabilityDetails();
const severeDisabilityDetails = new SevereDisabilityDetails();
const selectResidenceDetails = new ResidenceDetails();
const selectPartnerDetails = new PartnerDetails();
const selectPartnerAge = new PartnerAgeDetails();
const selectPartnerPension = new PartnerPensionDetails();
const selectPartnerDisability = new PartnerDisabilityDetails();
const selectDependantDetails = new DependantDetails();
const selectOtherDependantsDetails = new OtherDependantDetails();
const selectEmploymentDetails = new EmploymentDetails();
const enterEmployerDetails = new EmployerDetails();
const enterSelfEmploymentDetails = new SelfEmploymentDetails();
const enterSelfEmploymentTaxDetails = new SelfEmploymentTaxDetails();
const courtOrders = new CourtOrders();
const priorityDebtsDetails = new PriorityDebtsDetails();
const debts = new Debts();
const monthlyExpenses = new MonthlyExpenses();
const monthlyIncome = new MonthlyIncome();
const explanation = new Explanation();
const repaymentPlan= new RepaymentPlan();
const partAdmitAlreadyPaid = new PartAdmitAlreadyPaid();
const rejectAllOfClaim = new RejectAllOfClaim();
const selectCarerDetails = new CarerDetails();

class ResponseSteps {

  VerifyResponsePageContent (claimRef) {
    taskListPage.open(claimRef);
    taskListPage.verifyResponsePageContent();
  }
  EnterNameAndAddressDetails (claimRef) {
    nameAndAddressDetailsPage.enterNameAndAddressDetails(claimRef);
  }
  EnterDateOfBirth (claimRef) {
    dateOfBirthDetailsPage.enterDateOfBirth(claimRef);
  }
  EnterContactNumber (claimRef) {
    contactNumberDetailsPage.enterContactNumber(claimRef);
  }
  EnterResponseToClaim(claimRef, responseType) {
    respondTypePage.enterResponseToClaim(claimRef, responseType);
  }
  EnterPaymentOption(claimRef, paymentOption) {
    paymentOptionPage.enterPaymentOption(claimRef, paymentOption);
  }
  CheckAndSubmit(claimRef) {
    checkYourAnswersPage.checkAndSubmit(claimRef);
  }
  EnterDateToPayOn() {
    dateToPayOn.enterDateToPayOn();
  }
  ShareYourFinancialDetailsIntro(claimRef) {
    shareYourFinancialDetailsIntro.open(claimRef);
    shareYourFinancialDetailsIntro.clickContinue();
  }
  EnterBankAccountDetails() {
    bankAccountDetails.enterBankAccountDetails();
    bankAccountDetails.clickContinue();
  }
  SelectDisabilityDetails(disability, severeDisability) {
    if(disability == 'yes'){
      disabilityDetails.clickYesButton();
      if(severeDisability == 'yes'){
        severeDisabilityDetails.clickYesButton();
      }else{
        severeDisabilityDetails.clickNoButton();
      }
    }else{
      disabilityDetails.clickNoButton();
    }
  }
  SelectResidenceDetails(residenceType) {
    selectResidenceDetails.selectResidenceType(residenceType);
  }
  SelectPartnerDetails(partner) {
    if(partner == 'yes'){
      selectPartnerDetails.clickYesButton();
    }else{
      selectPartnerDetails.clickNoButton();
    }
  }
  SelectPartnerAge(partnerAge) {
    if(partnerAge == 'yes'){
      selectPartnerAge.clickYesButton();
    }else{
      selectPartnerAge.clickNoButton();
    }
  }
  SelectPartnerPension(partnerPension) {
    if(partnerPension == 'yes'){
      selectPartnerPension.clickYesButton();
    }else{
      selectPartnerPension.clickNoButton();
    }
  }
  SelectPartnerDisability(partnerDisability) {
    if(partnerDisability == 'yes'){
      selectPartnerDisability.clickYesButton();
    }else{
      selectPartnerDisability.clickNoButton();
    }
  }
  SelectDependantDetails(dependant) {
    if(dependant == 'yes'){
      selectDependantDetails.clickYesButton();
    }else{
      selectDependantDetails.clickNoButton();
    }
  }
  SelectOtherDependantDetails(dependant) {
    if(dependant == 'yes'){
      selectOtherDependantsDetails.clickYesButton();
    }else{
      selectOtherDependantsDetails.clickNoButton();
    }
  }
  SelectCarerDetails(carer) {
    if(carer == 'yes'){
      selectCarerDetails.clickYesButton();
    }else{
      selectCarerDetails.clickNoButton();
    }
  }
  SelectEmploymentDetails(employment) {
    if(employment == 'yes'){
      selectEmploymentDetails.clickYesButton();
    }else{
      selectEmploymentDetails.clickNoButton();
    }
  }
  EnterEmployerDetails() {
    enterEmployerDetails.enterEmployerDetails();
  }
  EnterSelfEmploymentDetails() {
    enterSelfEmploymentDetails.enterSelfEmployerDetails();
  }
  EnterSelfEmploymentTaxDetails() {
    enterSelfEmploymentTaxDetails.clickYesButton();
  }
  EnterCourtOrderDetails(claimRef) {
    courtOrders.clickYesButton(claimRef);
  }
  PriorityDebtsDetails(mortage, councilTax, gas, electricity) {
    priorityDebtsDetails.selectMortgage(mortage);
    priorityDebtsDetails.selectCouncilTax(councilTax);
    priorityDebtsDetails.selectGas(gas);
    priorityDebtsDetails.selectElectricity(electricity);
    priorityDebtsDetails.clickContinue();
  }
  EnterDebtDetails() {
    debts.clickYesButton();
  }
  MonthlyExpensesDetails(mortgage, councilTax, gas, electricity, foodAndHouseKeeping, otherExpenses) {
    monthlyExpenses.selectMortgage(mortgage);
    monthlyExpenses.selectCouncilTax(councilTax);
    monthlyExpenses.selectGas(gas);
    monthlyExpenses.selectElectricity(electricity);
    monthlyExpenses.selectFoodAndHouseKeeping(foodAndHouseKeeping);
    monthlyExpenses.selectOtherExpenses(otherExpenses);
    monthlyExpenses.clickContinue();
  }
  MonthlyIncomeDetails(incomeFromJob, childBenefit, otherIncome) {
    monthlyIncome.selectIncomeFromJob(incomeFromJob);
    monthlyIncome.selectChildBenefit(childBenefit);
    monthlyIncome.selectOtherIncome(otherIncome);
    monthlyIncome.clickContinue();
  }
  EnterExplanation() {
    explanation.enterExplanation();
  }
  EnterRepaymentPlan(claimRef) {
    repaymentPlan.enterRepaymentPlan(claimRef);
  }
  SelectPartAdmitAlreadyPaid(option) {
    partAdmitAlreadyPaid.selectAlreadyPaid(option);
  }
  SelectOptionInRejectAllClaim(reason) {
    rejectAllOfClaim.selectRejectAllReason(reason);
  }
}

module.exports = ResponseSteps;
