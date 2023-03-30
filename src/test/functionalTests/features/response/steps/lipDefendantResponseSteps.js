const TaskListPage = require('../pages/defendantLipResponse/taskList');
const  NameAndAddressDetailsPage  =  require('../pages/defendantLipResponse/confirmYourDetails/enterNameAndAddressDetails');
const  DateOfBirthDetailsPage  =  require('../pages/defendantLipResponse/confirmYourDetails/enterDateOfBirthDetails');
const  ContactNumberDetailsPage  =  require('../pages/defendantLipResponse/confirmYourDetails/enterContactNumberDetails');
const  RespondTypePage  =  require('../pages/defendantLipResponse/chooseAResponse/respondType');
const  PaymentOptionPage  =  require('../pages/defendantLipResponse/howYouWillPay/paymentOption');
const  CheckYourAnswersPage  =  require('../pages/defendantLipResponse/checkYourAnswers');
const  DateToPayOn  =  require('../pages/defendantLipResponse/yourRepaymentPlan/dateToPayOn');
const  ShareYouFinancialDetailsIntro  =  require('../pages/defendantLipResponse/shareYourFinancialDetails/shareYouFinancialDetailsIntro');
const  BankAccountsDetails  =  require('../pages/defendantLipResponse/shareYourFinancialDetails/bankAccountsDetails');
const  DisabilityDetails  =  require('../pages/defendantLipResponse/shareYourFinancialDetails/disabilityDetails');
const  SevereDisabilityDetails  =  require('../pages/defendantLipResponse/shareYourFinancialDetails/severeDisabilityDetails');
const  ResidenceDetails  =  require('../pages/defendantLipResponse/shareYourFinancialDetails/residenceDetails');
const  PartnerDetails  =  require('../pages/defendantLipResponse/shareYourFinancialDetails/partnerDetails');
const  PartnerAgeDetails  =  require('../pages/defendantLipResponse/shareYourFinancialDetails/partnerAgeDetails');
const  PartnerPensionDetails  =  require('../pages/defendantLipResponse/shareYourFinancialDetails/partnerPensionDetails');
const  PartnerDisabilityDetails  =  require('../pages/defendantLipResponse/shareYourFinancialDetails/partnerDisabilityDetails');
const  DependantDetails  =  require('../pages/defendantLipResponse/shareYourFinancialDetails/dependantDetails');
const  OtherDependantDetails  =  require('../pages/defendantLipResponse/shareYourFinancialDetails/otherDependantDetails');
const  EmploymentDetails  =  require('../pages/defendantLipResponse/shareYourFinancialDetails/employment');
const  EmployerDetails  =  require('../pages/defendantLipResponse/shareYourFinancialDetails/employerDetails');
const  SelfEmploymentDetails  =  require('../pages/defendantLipResponse/shareYourFinancialDetails/selfEmploymentDetails');
const  SelfEmploymentTaxDetails  =  require('../pages/defendantLipResponse/shareYourFinancialDetails/selfEmploymentTaxDetails');
const  CourtOrders  =  require('../pages/defendantLipResponse/shareYourFinancialDetails/courtOrders');
const  PriorityDebtsDetails  =  require('../pages/defendantLipResponse/shareYourFinancialDetails/priorityDebtsDetails');
const  Debts  =  require('../pages/defendantLipResponse/shareYourFinancialDetails/debts');
const  MonthlyExpenses  =  require('../pages/defendantLipResponse/shareYourFinancialDetails/monthlyExpenses');
const  MonthlyIncome  =  require('../pages/defendantLipResponse/shareYourFinancialDetails/monthlyIncome');
const  Explanation  =  require('../pages/defendantLipResponse/whyDoYouDisagree/explanation');
const  RepaymentPlan  =  require('../pages/defendantLipResponse/yourRepaymentPlan/repaymentPlan');
const  PartAdmitAlreadyPaid  =  require('../pages/defendantLipResponse/howYouWillPay/partAdmitAlreadyPaid');
const  RejectAllOfClaim  =  require('../pages/defendantLipResponse/howYouWillPay/rejectAllOfClaim');
const  CarerDetails  =  require('../pages/defendantLipResponse/shareYourFinancialDetails/carerDetails');
const ViewYourOptionsBeforeDeadline = require('../pages/defendantLipResponse/viewYourOptionsBeforeDeadline/viewYourOptionsBeforeDeadline');
const HowMuchYouHavePaid = require('../pages/defendantLipResponse/howYouWillPay/howMuchYouHavePaid');
const HowMuchDoYouOwe = require('../pages/defendantLipResponse/howYouWillPay/howMuchDoYouOwe');
const AddYourTimeLine = require('../pages/defendantLipResponse/whyDoYouDisagree/addYourTimeLine');
const WhyDoYouDisagreeTheClaimAmount = require('../pages/defendantLipResponse/whyDoYouDisagree/whyDoYouDisagreeTheClaimAmount');
const ListYourEvidence = require('../pages/defendantLipResponse/whyDoYouDisagree/listYourEvidence');
const FreeTelephoneMediation = require('../pages/defendantLipResponse/freeTelephoneMediation/freeTelephoneMediation');
const MediationCanWeUse = require('../pages/defendantLipResponse/freeTelephoneMediation/mediatonCanWeUse');
const RequestMoreTime = require('../pages/defendantLipResponse/viewYourOptionsBeforeDeadline/requestMoreTime');
const HearingRequirements = require('../pages/defendantLipResponse/defendantDQ/hearingRequirements');
const DQExpert = require('../pages/defendantLipResponse/defendantDQ/dqExpert');
const ExpertReportDetails = require('../pages/defendantLipResponse/defendantDQ/expertReportDetails');
const GiveEvidenceYourself = require('../pages/defendantLipResponse/defendantDQ/giveEvidenceYourself');
const DefendantWitnesses = require('../pages/defendantLipResponse/defendantDQ/defendantWitnesses');
const CantAttendHearing = require('../pages/defendantLipResponse/defendantDQ/cantAttendHearing');
const AvailabilityDates = require('../pages/defendantLipResponse/defendantDQ/availabilityDates');
const PhoneOrVideoHearing = require('../pages/defendantLipResponse/defendantDQ/phoneOrVideoHearing');
const VulnerabilityDetails = require('../pages/defendantLipResponse/defendantDQ/vulnerability');
const SupportRequired = require('../pages/defendantLipResponse/defendantDQ/supportRequired');
const CourtLocation = require('../pages/defendantLipResponse/defendantDQ/courtLocation');
const WelshLanguage = require('../pages/defendantLipResponse/defendantDQ/welshLanguage');

const I = actor(); // eslint-disable-line no-unused-vars
const requestMoreTime = new RequestMoreTime();
const mediationCanWeUse = new MediationCanWeUse();
const addYourTimeLine = new AddYourTimeLine();
const freeTelephoneMediation = new FreeTelephoneMediation();
const listYourEvidence = new ListYourEvidence();
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
const viewYourOptionsBeforeDeadline = new ViewYourOptionsBeforeDeadline();
const howMuchYouHavePaid = new HowMuchYouHavePaid();
const howMuchDoYouOwe = new HowMuchDoYouOwe();
const whyDoYouDisagreeTheClaimAmount = new WhyDoYouDisagreeTheClaimAmount();
const hearingRequirements = new HearingRequirements();
const dqExpert = new DQExpert();
const expertReportDetails = new ExpertReportDetails();
const giveEvidenceYourself = new GiveEvidenceYourself();
const defendantWitnesses = new DefendantWitnesses();
const cantAttendHearing = new CantAttendHearing();
const availabilityDates = new AvailabilityDates();
const phoneOrVideoHearing = new PhoneOrVideoHearing();
const vulnerabilityDetails = new VulnerabilityDetails();
const supportRequired = new SupportRequired();
const courtLocation = new CourtLocation();
const welshLanguage = new WelshLanguage();

class ResponseSteps {

  EnterPersonalDetails(claimRef) {
    taskListPage.open(claimRef);
    taskListPage.verifyResponsePageContent();
    nameAndAddressDetailsPage.enterNameAndAddressDetails(claimRef);
    dateOfBirthDetailsPage.enterDateOfBirth(claimRef);
    contactNumberDetailsPage.enterContactNumber(claimRef);
  }

  EnterYourOptionsForDeadline(claimRef, deadlineOption){
    viewYourOptionsBeforeDeadline.selectYouOptions(claimRef, deadlineOption);
  }

  RespondToRequest (claimRef) {
    requestMoreTime.requestMoreTimeToRespond(claimRef);
  }

  AddMandatoryPhoneNumber(){
    mediationCanWeUse.enterPhoneNumber();
  }

  AddYourTimeLineEvents(){
    addYourTimeLine.addTimeLineOfEvents();
  }

  EnterResponseToClaim(claimRef, responseType) {
    respondTypePage.enterResponseToClaim(claimRef, responseType);
  }
  EnterPaymentOption(claimRef, paymentOption) {
    paymentOptionPage.enterPaymentOption(claimRef, paymentOption);
  }
  CheckAndSubmit(claimRef,responseType) {
    checkYourAnswersPage.checkAndSubmit(claimRef,responseType);
  }
  EnterDateToPayOn() {
    dateToPayOn.enterDateToPayOn();
  }

  EnterFinancialDetails(claimRef) {
    this.ShareYourFinancialDetailsIntro(claimRef);
    this.EnterBankAccountDetails();
    this.SelectDisabilityDetails('yes', 'yes');
    this.SelectResidenceDetails('ownHome');
    this.SelectPartnerDetails('yes');
    this.SelectPartnerAge('yes');
    this.SelectPartnerPension('yes');
    this.SelectPartnerDisability('no');
    this.SelectDependantDetails('yes');
    this.SelectOtherDependantDetails('yes');
    this.SelectEmploymentDetails('yes');
    this.EnterEmployerDetails();
    this.EnterSelfEmploymentDetails();
    this.EnterSelfEmploymentTaxDetails();
    this.EnterCourtOrderDetails(claimRef);
    this.PriorityDebtsDetails('120','20','10', '5');
    this.EnterDebtDetails();
    this.MonthlyExpensesDetails('1200','45', '25', '30', '100', '125');
    this.MonthlyIncomeDetails('4500', '120', '1100');
    this.EnterExplanation();
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
  EnterHowMuchYouHavePaid(claimRef, amount) {
    howMuchYouHavePaid.enterPaymentDetails(claimRef, amount);
  }
  EnterHowMuchMoneyYouOwe(claimRef, amount) {
    howMuchDoYouOwe.enterHowMuchMoneyDoYouOwe(claimRef, amount);
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
  EnterWhyYouDisagreeTheClaimAmount(claimRef) {
    whyDoYouDisagreeTheClaimAmount.enterReason(claimRef);
  }

  EnterYourEvidenceDetails() {
    listYourEvidence.selectEvidenceFromDropDown();
  }

  EnterFreeTelephoneMediationDetails(claimRef) {
    freeTelephoneMediation.selectMediation(claimRef);
    mediationCanWeUse.selectOptionForMediation(claimRef);
  }

  EnterDQForSmallClaims(claimRef){
    this.SelectHearingRequirements(claimRef);
    this.SelectExpertNeededOrNot(claimRef);
    this.EnterExpertReportDetails(claimRef, 'TestExpert1', '20', '10', '2022');
    this.SelectGiveEvidenceYourself(claimRef);
    this.EnterDefedantWitnesses(claimRef);
    this.SelectOptionForCantAttendHearing(claimRef);
    this.EnterUnavailabilityDates(claimRef);
    this.SelectOptionForPhoneOrVideoHearing(claimRef);
    this.SelectOptionForVulnerability(claimRef);
    this.SelectOptionForSupportRequired(claimRef);
    this.SelectPreferredCourtLocation(claimRef);
    this.SelectLanguageOption(claimRef);
  }

  SelectHearingRequirements(claimRef){
    hearingRequirements.selectHearingRequirements(claimRef);
  }

  SelectExpertNeededOrNot(claimRef){
    dqExpert.chooseExpert(claimRef);
  }

  EnterExpertReportDetails(claimRef, expertName, day, month, year){
    expertReportDetails.enterExpertReportDetails(claimRef, expertName, day, month, year);
  }

  SelectGiveEvidenceYourself(claimRef){
    giveEvidenceYourself.SelectGiveEvidenceYourself(claimRef);
  }

  EnterDefedantWitnesses(claimRef){
    defendantWitnesses.enterDefendantWitnesses(claimRef);
  }

  SelectOptionForCantAttendHearing(claimRef){
    cantAttendHearing.selectYesForCantAttendHearing(claimRef);
  }

  EnterUnavailabilityDates(claimRef){
    availabilityDates.enterUnavailableDates(claimRef);
  }

  SelectOptionForPhoneOrVideoHearing(claimRef){
    phoneOrVideoHearing.selectOptionForPhoneOrVideoHearing(claimRef);
  }

  SelectOptionForVulnerability(claimRef){
    vulnerabilityDetails.selectOptionForVulnerability(claimRef);
  }

  SelectOptionForSupportRequired(claimRef){
    supportRequired.selectOptionForSupportRequired(claimRef);
  }

  SelectPreferredCourtLocation(claimRef){
    courtLocation.selectPreferredCourtLocation(claimRef);
  }

  SelectLanguageOption(claimRef){
    welshLanguage.selectLanguageOption(claimRef);
  }
}

module.exports = new ResponseSteps();
