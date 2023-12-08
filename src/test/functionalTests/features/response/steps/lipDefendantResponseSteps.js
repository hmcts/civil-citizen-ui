const TaskListPage = require('../pages/defendantLipResponse/taskList');
const DefendantLatestUpdate = require('../pages/defendantLipResponse/defendantLatestUpdate');
const BilingualLanguagePreference = require('../pages/defendantLipResponse/bilingualLanguagePreference');
const NameAndAddressDetailsPage = require('../pages/defendantLipResponse/confirmYourDetails/enterNameAndAddressDetails');
const DateOfBirthDetailsPage = require('../pages/defendantLipResponse/confirmYourDetails/enterDateOfBirthDetails');
const ContactNumberDetailsPage = require('../pages/defendantLipResponse/confirmYourDetails/enterContactNumberDetails');
const RespondTypePage = require('../pages/defendantLipResponse/chooseAResponse/respondType');
const PaymentOptionPage = require('../pages/defendantLipResponse/howYouWillPay/paymentOption');
const CheckYourAnswersPage = require('../pages/defendantLipResponse/checkYourAnswers');
const DateToPayOn = require('../pages/defendantLipResponse/yourRepaymentPlan/dateToPayOn');
const ShareYouFinancialDetailsIntro = require('../pages/defendantLipResponse/shareYourFinancialDetails/shareYouFinancialDetailsIntro');
const BankAccountsDetails = require('../pages/defendantLipResponse/shareYourFinancialDetails/bankAccountsDetails');
const DisabilityDetails = require('../pages/defendantLipResponse/shareYourFinancialDetails/disabilityDetails');
const SevereDisabilityDetails = require('../pages/defendantLipResponse/shareYourFinancialDetails/severeDisabilityDetails');
const ResidenceDetails = require('../pages/defendantLipResponse/shareYourFinancialDetails/residenceDetails');
const PartnerDetails = require('../pages/defendantLipResponse/shareYourFinancialDetails/partnerDetails');
const PartnerAgeDetails = require('../pages/defendantLipResponse/shareYourFinancialDetails/partnerAgeDetails');
const PartnerPensionDetails = require('../pages/defendantLipResponse/shareYourFinancialDetails/partnerPensionDetails');
const PartnerDisabilityDetails = require('../pages/defendantLipResponse/shareYourFinancialDetails/partnerDisabilityDetails');
const DependantDetails = require('../pages/defendantLipResponse/shareYourFinancialDetails/dependantDetails');
const OtherDependantDetails = require('../pages/defendantLipResponse/shareYourFinancialDetails/otherDependantDetails');
const EmploymentDetails = require('../pages/defendantLipResponse/shareYourFinancialDetails/employment');
const EmployerDetails = require('../pages/defendantLipResponse/shareYourFinancialDetails/employerDetails');
const SelfEmploymentDetails = require('../pages/defendantLipResponse/shareYourFinancialDetails/selfEmploymentDetails');
const SelfEmploymentTaxDetails = require('../pages/defendantLipResponse/shareYourFinancialDetails/selfEmploymentTaxDetails');
const CourtOrders = require('../pages/defendantLipResponse/shareYourFinancialDetails/courtOrders');
const PriorityDebtsDetails = require('../pages/defendantLipResponse/shareYourFinancialDetails/priorityDebtsDetails');
const Debts = require('../pages/defendantLipResponse/shareYourFinancialDetails/debts');
const MonthlyExpenses = require('../pages/defendantLipResponse/shareYourFinancialDetails/monthlyExpenses');
const MonthlyIncome = require('../pages/defendantLipResponse/shareYourFinancialDetails/monthlyIncome');
const Explanation = require('../pages/defendantLipResponse/whyDoYouDisagree/explanation');
const RepaymentPlan = require('../pages/defendantLipResponse/yourRepaymentPlan/repaymentPlan');
const PartAdmitAlreadyPaid = require('../pages/defendantLipResponse/howYouWillPay/partAdmitAlreadyPaid');
const RejectAllOfClaim = require('../pages/defendantLipResponse/howYouWillPay/rejectAllOfClaim');
const CarerDetails = require('../pages/defendantLipResponse/shareYourFinancialDetails/carerDetails');
const ViewYourOptionsBeforeDeadline = require('../pages/defendantLipResponse/viewYourOptionsBeforeDeadline/viewYourOptionsBeforeDeadline');
const HowMuchYouHavePaid = require('../pages/defendantLipResponse/howYouWillPay/howMuchYouHavePaid');
const HowMuchDoYouOwe = require('../pages/defendantLipResponse/howYouWillPay/howMuchDoYouOwe');
const AddYourTimeLine = require('../pages/defendantLipResponse/whyDoYouDisagree/addYourTimeLine');
const WhyDoYouDisagreeTheClaimAmount = require('../pages/defendantLipResponse/whyDoYouDisagree/whyDoYouDisagreeTheClaimAmount');
const WhyDoYouDisagree = require('../pages/defendantLipResponse/whyDoYouDisagree/whyDoYouDisagree');
const ListYourEvidence = require('../pages/defendantLipResponse/whyDoYouDisagree/listYourEvidence');
const FreeTelephoneMediation = require('../pages/defendantLipResponse/freeTelephoneMediation/freeTelephoneMediation');
const TelephoneMediation = require('../pages/defendantLipResponse/telephoneMediation/telephoneMediation');
const EmailConfirmation = require('../pages/defendantLipResponse/availabilityForMediation/emailConfirmation');
const PhoneConfirmation = require('../pages/defendantLipResponse/availabilityForMediation/phoneConfirmation');
const ContactPerson = require('../pages/defendantLipResponse/availabilityForMediation/contactPerson');
const AlternativeEmail = require('../pages/defendantLipResponse/availabilityForMediation/alternativeEmail');
const NextThreeMonthsDate = require('../pages/defendantLipResponse/availabilityForMediation/nextThreeMonthsDate');
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
const EnterCompanyDetails = require('../pages/defendantLipResponse/confirmYourDetails/enterCompanyDetails');
const TriedToSettle = require('../pages/defendantLipResponse/defendantDQ/triedToSettle');
const RequestExtraFourWeeks = require('../pages/defendantLipResponse/defendantDQ/requestExtraFourWeeks');
const ConsiderClaimantDocs  =  require('../pages/defendantLipResponse/defendantDQ/considerClaimantDocs');
const ExpertEvidence = require('../pages/defendantLipResponse/defendantDQ/expertEvidence');
const SentExpertReports = require('../pages/defendantLipResponse/defendantDQ/sentExpertReports');
const SharedExpert = require('../pages/defendantLipResponse/defendantDQ/sharedExpert');
const ExpertDetails = require('../pages/defendantLipResponse/defendantDQ/expertDetails');
const AssignCaseToLip = require('../pages/defendantLipResponse/assignCasePinInPost');

const I = actor(); // eslint-disable-line no-unused-vars
const requestMoreTime = new RequestMoreTime();
const mediationCanWeUse = new MediationCanWeUse();
const addYourTimeLine = new AddYourTimeLine();
const freeTelephoneMediation = new FreeTelephoneMediation();
const telephoneMediation = new TelephoneMediation();
const emailConfirmation = new EmailConfirmation();
const phoneConfirmation = new PhoneConfirmation();
const contactPerson = new ContactPerson();
const alternativeEmail = new AlternativeEmail();
const nextThreeMonthsDate = new NextThreeMonthsDate();
const listYourEvidence = new ListYourEvidence();
const taskListPage = new TaskListPage();
const defendantLatestUpdate = new DefendantLatestUpdate();
const bilingualLanguagePreference = new BilingualLanguagePreference();
const nameAndAddressDetailsPage = new NameAndAddressDetailsPage();
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
const repaymentPlan = new RepaymentPlan();
const partAdmitAlreadyPaid = new PartAdmitAlreadyPaid();
const rejectAllOfClaim = new RejectAllOfClaim();
const selectCarerDetails = new CarerDetails();
const viewYourOptionsBeforeDeadline = new ViewYourOptionsBeforeDeadline();
const howMuchYouHavePaid = new HowMuchYouHavePaid();
const howMuchDoYouOwe = new HowMuchDoYouOwe();
const whyDoYouDisagreeTheClaimAmount = new WhyDoYouDisagreeTheClaimAmount();
const whyDoYouDisagree = new WhyDoYouDisagree();
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
const enterCompanyDetails = new EnterCompanyDetails();
const triedToSettle = new TriedToSettle();
const requestExtraFourWeeks = new RequestExtraFourWeeks();
const considerClaimantDocs = new ConsiderClaimantDocs();
const expertEvidence = new ExpertEvidence();
const sentExpertReports = new SentExpertReports();
const sharedExpert = new SharedExpert();
const expertDetails = new ExpertDetails();
const assignCaseToLip = new AssignCaseToLip();

class ResponseSteps {
  async AssignCaseToLip(claimNumber, securityCode){
    await assignCaseToLip.open(claimNumber, securityCode);
  }
  async RespondToClaim(claimRef){
    await defendantLatestUpdate.open(claimRef);
    await bilingualLanguagePreference.verifyContent();
  }

  async RespondToClaimError(claimRef){
    await defendantLatestUpdate.open(claimRef);
    await bilingualLanguagePreference.verifyContentError();
  }

  async DefendantSummaryPage(claimRef){
    await defendantLatestUpdate.openSummaryPage(claimRef);
  }

  async EnterPersonalDetails(claimRef, carmEnabled) {
    await taskListPage.verifyResponsePageContent();
    await nameAndAddressDetailsPage.enterNameAndAddressDetails(claimRef);
    await dateOfBirthDetailsPage.enterDateOfBirth(claimRef);
    await contactNumberDetailsPage.enterContactNumber(carmEnabled);
  }

  async EnterCompDetails(carmEnabled) {
    await taskListPage.verifyResponsePageContent();
    await nameAndAddressDetailsPage.enterCompanyContactDetails();
    await contactNumberDetailsPage.enterContactNumber(carmEnabled);
  }

  async EnterPersonalDetailsError(claimRef) {
    await taskListPage.verifyResponsePageContent();
    await nameAndAddressDetailsPage.emptyNameAndAddressDetails(claimRef);
    await nameAndAddressDetailsPage.enterWrongPostcode();
  }

  async EnterYourOptionsForDeadline(claimRef, deadlineOption) {
    await viewYourOptionsBeforeDeadline.selectYouOptions(claimRef, deadlineOption);
  }

  async EnterYourOptionsForDeadlineError(claimRef, deadlineOption) {
    await viewYourOptionsBeforeDeadline.selectYouOptionsError(claimRef, deadlineOption);
  }

  async EnterCompanyDetails(){
    await taskListPage.verifyResponsePageContent();
    await enterCompanyDetails.enterCompanyDetails();
    await enterCompanyDetails.enterCorrespondenceAddressManually();
    await contactNumberDetailsPage.enterContactNumber();
  }

  async EnterCompanyDetailError(){
    await taskListPage.verifyResponsePageContent();
    await enterCompanyDetails.emptyCompanyDetails();
    await enterCompanyDetails.enterWrongPostcode();
  }

  async RespondToRequest(claimRef) {
    await requestMoreTime.requestMoreTimeToRespond(claimRef);
  }

  async AddMandatoryPhoneNumber() {
    await mediationCanWeUse.enterPhoneNumber();
  }

  async AddYourTimeLineEvents() {
    await addYourTimeLine.addTimeLineOfEvents();
  }

  async AddYourTimeLineEventsError() {
    await addYourTimeLine.addTimeLineOfEvents();
  }

  async EnterResponseToClaim(claimRef, responseType) {
    await respondTypePage.enterResponseToClaim(claimRef, responseType);
  }
  async EnterResponseToClaimError(claimRef, responseType) {
    await respondTypePage.enterResponseToClaimError(claimRef, responseType);
  }

  async EnterPaymentOption(claimRef, responseType, paymentOption) {
    await paymentOptionPage.enterPaymentOption(claimRef, responseType, paymentOption);
  }

  async EnterRepaymentPlan(claimRef) {
    await repaymentPlan.enterRepaymentPlan(claimRef);
  }

  async CheckAndSubmit(claimRef, responseType, claimType) {
    await checkYourAnswersPage.checkAndSubmit(claimRef, responseType, claimType);
  }

  async EnterDateToPayOn() {
    await dateToPayOn.enterDateToPayOn();
  }

  async EnterDateToPayOnError() {
    await dateToPayOn.enterDateToPayOnError();
  }

  async EnterFinancialDetails(claimRef) {
    await this.ShareYourFinancialDetailsIntro(claimRef);
    await this.EnterBankAccountDetails();
    await this.SelectDisabilityDetails('yes', 'yes');
    await this.SelectResidenceDetails('ownHome');
    await this.SelectPartnerDetails('yes');
    await this.SelectPartnerAge('yes');
    await this.SelectPartnerPension('yes');
    await this.SelectPartnerDisability('no');
    await this.SelectDependantDetails('yes');
    await this.SelectOtherDependantDetails('yes');
    await this.SelectEmploymentDetails('yes');
    await this.EnterEmployerDetails();
    await this.EnterSelfEmploymentDetails();
    await this.EnterSelfEmploymentTaxDetails();
    await this.EnterCourtOrderDetails(claimRef);
    await this.PriorityDebtsDetails('120', '20', '10', '5');
    await this.EnterDebtDetails();
    await this.MonthlyExpensesDetails('1200', '45', '25', '30', '100', '125');
    await this.MonthlyIncomeDetails('4500', '120', '1100');
    await this.EnterExplanation();
  }

  async ShareYourFinancialDetailsIntro(claimRef) {
    await shareYourFinancialDetailsIntro.open(claimRef);
    await shareYourFinancialDetailsIntro.clickContinue();
  }

  async EnterBankAccountDetails() {
    await bankAccountDetails.enterBankAccountDetails();
    await bankAccountDetails.clickContinue();
  }

  async SelectDisabilityDetails(disability, severeDisability) {
    if (disability == 'yes') {
      await disabilityDetails.clickYesButton();
      if (severeDisability == 'yes') {
        await severeDisabilityDetails.clickYesButton();
      } else {
        await severeDisabilityDetails.clickNoButton();
      }
    } else {
      await disabilityDetails.clickNoButton();
    }
  }

  async SelectResidenceDetails(residenceType) {
    await selectResidenceDetails.selectResidenceType(residenceType);
  }

  async SelectPartnerDetails(partner) {
    if (partner == 'yes') {
      await selectPartnerDetails.clickYesButton();
    } else {
      await selectPartnerDetails.clickNoButton();
    }
  }

  async SelectPartnerAge(partnerAge) {
    if (partnerAge == 'yes') {
      await selectPartnerAge.clickYesButton();
    } else {
      await selectPartnerAge.clickNoButton();
    }
  }

  async SelectPartnerPension(partnerPension) {
    if (partnerPension == 'yes') {
      await selectPartnerPension.clickYesButton();
    } else {
      await selectPartnerPension.clickNoButton();
    }
  }

  async SelectPartnerDisability(partnerDisability) {
    if (partnerDisability == 'yes') {
      await selectPartnerDisability.clickYesButton();
    } else {
      await selectPartnerDisability.clickNoButton();
    }
  }

  async SelectDependantDetails(dependant) {
    if (dependant == 'yes') {
      await selectDependantDetails.clickYesButton();
    } else {
      await selectDependantDetails.clickNoButton();
    }
  }

  async SelectOtherDependantDetails(dependant) {
    if (dependant == 'yes') {
      await selectOtherDependantsDetails.clickYesButton();
    } else {
      await selectOtherDependantsDetails.clickNoButton();
    }
  }

  async SelectCarerDetails(carer) {
    if (carer == 'yes') {
      await selectCarerDetails.clickYesButton();
    } else {
      await selectCarerDetails.clickNoButton();
    }
  }

  async SelectEmploymentDetails(employment) {
    if (employment == 'yes') {
      await selectEmploymentDetails.clickYesButton();
    } else {
      await selectEmploymentDetails.clickNoButton();
    }
  }

  async EnterHowMuchYouHavePaid(claimRef, amount, responseType) {
    await howMuchYouHavePaid.enterPaymentDetails(claimRef, amount, responseType);
  }

  async EnterHowMuchYouHavePaidError(claimRef, amount, responseType) {
    await howMuchYouHavePaid.enterPaymentDetailsError(claimRef, amount, responseType);
  }

  async EnterHowMuchMoneyYouOwe(claimRef, amount) {
    await howMuchDoYouOwe.enterHowMuchMoneyDoYouOwe(claimRef, amount);
  }

  async EnterHowMuchMoneyYouOweError(claimRef) {
    await howMuchDoYouOwe.enterHowMuchMoneyDoYouOweError(claimRef);
  }

  async EnterEmployerDetails() {
    await enterEmployerDetails.enterEmployerDetails();
  }

  async EnterSelfEmploymentDetails() {
    await enterSelfEmploymentDetails.enterSelfEmployerDetails();
  }

  async EnterSelfEmploymentTaxDetails() {
    await enterSelfEmploymentTaxDetails.clickYesButton();
  }

  async EnterCourtOrderDetails(claimRef) {
    await courtOrders.clickYesButton(claimRef);
  }

  async PriorityDebtsDetails(mortage, councilTax, gas, electricity) {
    await priorityDebtsDetails.selectMortgage(mortage);
    await priorityDebtsDetails.selectCouncilTax(councilTax);
    await priorityDebtsDetails.selectGas(gas);
    await priorityDebtsDetails.selectElectricity(electricity);
    await priorityDebtsDetails.clickContinue();
  }

  async EnterDebtDetails() {
    await debts.clickYesButton();
  }

  async MonthlyExpensesDetails(mortgage, councilTax, gas, electricity, foodAndHouseKeeping, otherExpenses) {
    await monthlyExpenses.selectMortgage(mortgage);
    await monthlyExpenses.selectCouncilTax(councilTax);
    await monthlyExpenses.selectGas(gas);
    await monthlyExpenses.selectElectricity(electricity);
    await monthlyExpenses.selectFoodAndHouseKeeping(foodAndHouseKeeping);
    await monthlyExpenses.selectOtherExpenses(otherExpenses);
    await monthlyExpenses.clickContinue();
  }

  async MonthlyIncomeDetails(incomeFromJob, childBenefit, otherIncome) {
    await monthlyIncome.selectIncomeFromJob(incomeFromJob);
    await monthlyIncome.selectChildBenefit(childBenefit);
    await monthlyIncome.selectOtherIncome(otherIncome);
    await monthlyIncome.clickContinue();
  }

  async EnterExplanation() {
    await explanation.enterExplanation();
  }

  async EnterRepaymentPlanError(claimRef) {
    await repaymentPlan.enterRepaymentPlanError(claimRef);
  }

  async SelectPartAdmitAlreadyPaid(option) {
    await partAdmitAlreadyPaid.selectAlreadyPaid(option);
  }

  async SelectOptionInRejectAllClaim(reason) {
    await rejectAllOfClaim.selectRejectAllReason(reason);
  }

  async EnterWhyYouDisagreeTheClaimAmount(claimRef, responseType) {
    await whyDoYouDisagreeTheClaimAmount.enterReason(claimRef, responseType);
  }

  async EnterWhyYouDisagreeTheClaimAmountError(claimRef, responseType) {
    await whyDoYouDisagreeTheClaimAmount.enterReasonError(claimRef, responseType);
  }

  async EnterWhyYouDisagree(claimRef){
    await whyDoYouDisagree.enterReason(claimRef);
  }

  async EnterYourEvidenceDetails() {
    await listYourEvidence.selectEvidenceFromDropDown();
  }

  async EnterFreeTelephoneMediationDetails(claimRef) {
    await freeTelephoneMediation.selectMediation(claimRef);
    await mediationCanWeUse.selectOptionForMediation(claimRef);
  }

  async EnterTelephoneMediationDetails(claimRef) {
    await telephoneMediation.selectMediation(claimRef);
  }

  async ConfirmEmailDetails() {
    await emailConfirmation.confirmEmail();
  }

  async ConfirmPhoneDetails() {
    await phoneConfirmation.enterPhoneDetails();
  }

  async ConfirmAltPhoneDetails() {
    await phoneConfirmation.enterAltPhoneDetails();
  }
  async ConfirmAltEmailDetails() {
    await alternativeEmail.confirmAltEmail();
  }

  async EnterUnavailableDates() {
    await nextThreeMonthsDate.enterNextThreeMonthsDate();
    await availabilityDates.enterUnavailableDates(true);
    await taskListPage.verifyResponsePageContent();
  }

  async ConfirmContactPerson(claimRef) {
    await contactPerson.confirmContactPerson(claimRef);
  }
  EnterNoMediation(claimRef){
    freeTelephoneMediation.selectNoMediation(claimRef);
  }

  async EnterDQForSmallClaims(claimRef) {
    await this.SelectHearingRequirements(claimRef);
    await this.SelectExpertNeededOrNot();
    await this.EnterExpertReportDetails('TestExpert1', '20', '10', '2022');
    await this.SelectGiveEvidenceYourself();
    await this.EnterDefedantWitnesses();
    await this.SelectOptionForCantAttendHearing();
    await this.EnterUnavailabilityDates();
    await this.SelectOptionForPhoneOrVideoHearing();
    await this.SelectOptionForVulnerability();
    await this.SelectOptionForSupportRequired();
    await this.SelectPreferredCourtLocation();
    await this.SelectLanguageOption();
  }

  async EnterDQForFastTrack(claimRef){
    await this.SelectOptionForTriedToSettle(claimRef);
    await this.SelectOptionToRequestExtraFourWeeksToSettle();
    await this.SelectConsiderClaimantDocs();
    await this.SelectExpertEvidence();
    await this.SelectSentExpertReports();
    await this.SelectOptionForSharedExpert();
    await this.EnterExpertDetails();
    await this.SelectGiveEvidenceYourself();
    await this.EnterDefedantWitnesses();
    await this.SelectOptionForCantAttendHearing();
    await this.EnterUnavailabilityDates();
    await this.SelectOptionForPhoneOrVideoHearing();
    await this.SelectOptionForVulnerability();
    await this.SelectOptionForSupportRequired();
    await this.SelectPreferredCourtLocation();
    await this.SelectLanguageOption();
  }

  async SelectHearingRequirements(claimRef) {
    await hearingRequirements.selectHearingRequirements(claimRef);
  }

  async SelectExpertNeededOrNot() {
    await dqExpert.chooseExpert();
  }

  async EnterExpertReportDetails(expertName, day, month, year) {
    await expertReportDetails.enterExpertReportDetails(expertName, day, month, year);
  }

  async SelectGiveEvidenceYourself() {
    await giveEvidenceYourself.SelectGiveEvidenceYourself();
  }

  async EnterDefedantWitnesses() {
    await defendantWitnesses.enterDefendantWitnesses();
  }

  async SelectOptionForCantAttendHearing() {
    await cantAttendHearing.selectYesForCantAttendHearing();
  }

  async EnterUnavailabilityDates() {
    await availabilityDates.enterUnavailableDates();
  }

  async SelectOptionForPhoneOrVideoHearing() {
    await phoneOrVideoHearing.selectOptionForPhoneOrVideoHearing();
  }

  async SelectOptionForVulnerability() {
    await vulnerabilityDetails.selectOptionForVulnerability();
  }

  async SelectOptionForSupportRequired() {
    await supportRequired.selectOptionForSupportRequired();
  }

  async SelectPreferredCourtLocation() {
    await courtLocation.selectPreferredCourtLocation();
  }

  async SelectLanguageOption() {
    await welshLanguage.selectLanguageOption();
  }

  async SelectOptionForTriedToSettle(claimRef){
    await triedToSettle.selectTriedToSettle(claimRef);
  }

  async SelectOptionToRequestExtraFourWeeksToSettle(){
    await requestExtraFourWeeks.SelectExtraFourWeeksToSettle();
  }

  async SelectConsiderClaimantDocs(){
    await considerClaimantDocs.SelectConsiderClaimantDocs();
  }

  async SelectExpertEvidence(){
    await expertEvidence.SelectOptionForExpertEvidence();
  }

  async SelectSentExpertReports(){
    await sentExpertReports.SentExpertReports();
  }

  async SelectOptionForSharedExpert(){
    await sharedExpert.SelectOptionForSharedExpert();
  }

  async EnterExpertDetails(){
    await expertDetails.EnterExpertDetails();
  }
}

module.exports = new ResponseSteps();
