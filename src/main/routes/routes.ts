import homeController from './homeController';
import unauthorisedController from './unauthorisedController';
import dashboardController from './features/dashboard/dashboardController';
import phoneDetailsController from './features/response/citizenPhoneNumber/citizenPhoneController';
import responseDobController from './features/response/citizenDob/citizenDobController';
import ageEligibilityController from './features/response/ageEligibility/ageEligibilityController';
import responseDetailsController from './features/response/citizenDetails/citizenDetailsController';
import claimDetailsController from './features/response/claimDetails/claimDetailsController';
import responsePostcodeLookupController from './features/response/citizenDetails/postcodeLookupController';
import citizenResponseTypeController from './features/response/responseType/citizenResponseTypeController';
import citizenPartnerAgeController from './features/response/statementOfMeans/partner/partnerAgeController';
import citizenDisabilityController from './features/response/statementOfMeans/disabilityController';
import citizenSevereDisabilityController from './features/response/statementOfMeans/severeDisabilityController';
import bankAccountsController from './features/response/statementOfMeans/bankAccounts/bankAccountsController';
import partnerController from './features/response/statementOfMeans/partner/partnerController';
import partnerDisabilityController from './features/response/statementOfMeans/partner/partnerDisabilityController';
import partnerSevereDisabilityController
  from './features/response/statementOfMeans/partner/partnerSevereDisabilityController';
import employmentStatusController from './features/response/statementOfMeans/employment/employmentStatusController';
import residenceController from './features/response/statementOfMeans/residenceController';
import financialDetailsController from './features/response/financialDetails/financialDetailsController';
import whoEmploysYouController from './features/response/statementOfMeans/employment/whoEmploysYouController';
import otherDependantsController from './features/response/statementOfMeans/otherDependants/otherDependantsController';
import partnerPensionController from './features/response/statementOfMeans/partner/partnerPensionController';
import paymentOptionController from './features/response/admission/fullAdmission/paymentOption/paymentOptionController';
import paymentDateController from './features/response/admission/fullAdmission/paymentOption/paymentDateController';
import paymentDatePAController from './features/response/admission/partialAdmission/paymentDateController';
import betweenSixteenAndNineteenController
  from './features/response/statementOfMeans/dependants/betweenSixteenAndNineteenController';
import dependantsController from './features/response/statementOfMeans/dependants/dependantsController';
import priorityDebtsController from './features/response/statementOfMeans/priorityDebtsController';
import selfEmployedAsController
  from './features/response/statementOfMeans/employment/selfEmployed/selfEmployedAsController';
import onTaxPaymentsController
  from './features/response/statementOfMeans/employment/selfEmployed/onTaxPaymentsController';
import unemploymentController from './features/response/statementOfMeans/unemployment/unemploymentController';
import childrenDisabilityController from './features/response/statementOfMeans/dependants/childrenDisabilityController';
import regularExpensesController from './features/response/statementOfMeans/expenses/regularExpensesController';
import debtsController from './features/response/statementOfMeans/debts/debtsController';
import monthlyExpenseIncomeCalculatorController
  from './calculateMonthlyIncomeExpense/monthlyExpenseIncomeCalculatorController';
import carerController from './features/response/statementOfMeans/carerController';
import explanationController from './features/response/statementOfMeans/explanationController';
import alreadyPaidController from './features/response/admission/partialAdmission/alreadyPaidController';
import taskListController from './features/response/taskListController';
import contactThemController from './features/dashboard/contactThemController';
import howMuchDoYouOweController from './features/response/admission/partialAdmission/howMuchDoYouOweController';
import courtOrdersController from './features/response/statementOfMeans/courtOrders/courtOrdersController';
import whyDoYouDisagreeController from './features/response/admission/partialAdmission/whyDoYouDisagreeController';
import repaymentPlanController from './features/response/admission/fullAdmission/repaymentPlan/repaymentPlanController';
import repaymentPlanPartialController
  from './features/response/admission/partialAdmission/repaymentPlan/repaymentPlanController';
import regularIncomeController from './features/response/statementOfMeans/income/regularIncomeController';
import mediationIndividualPhoneController from './features/mediation/mediationIndividualPhoneController';
import howMuchHaveYouPaidController from './features/response/admission/partialAdmission/howMuchHaveYouPaidController';
import companyTelephoneNumberController from './features/mediation/companyTelephoneNumberController';
import mediationDisagreementController from './features/mediation/mediationDisagreementController';
import sendYourResponseByEmailController from './features/response/eligibility/sendYourResponseByEmailController';
import freeTelephoneMediationController from './features/mediation/freeTelephoneMediationController';
import rejectAllOfClaimController from './features/response/rejectAllOfClaimController';
import defendantTimelineController from './features/response/timelineOfEvents/defendantTimelineController';
import theirPdfTimelineDownloadController
  from './features/response/timelineOfEvents/theirPdfTimelineDownloadController';
import iDontWantFreeMediationController from './features/mediation/iDontWantFreeMediationController';
import evidenceController from './features/response/evidence/evidenceController';
import checkAnswersController from './features/response/checkAnswersController';
import youHavePaidLessController from './features/response/admission/fullRejection/youHavePaidLessController';
import yourDefenceController from './features/response/yourDefenceController';
import incompleteSubmissionController from './features/response/incompleteSubmissionController';
import howMuchHaveYouPaidFRController from './features/response/admission/fullRejection/howMuchHaveYouPaidController';
import claimSummaryController from './features/dashboard/claimSummaryController';
import expertGuidanceController from './features/directionsQuestionnaire/expertGuidanceController';
import partialAdmissionPaymentOptionController
  from './features/response/admission/partialAdmission/partialAdmissionPaymentOptionController';
import supportRequiredController from './features/directionsQuestionnaire/supportRequiredController';
import vulnerabilityController from './features/directionsQuestionnaire/vulnerabilityController';
import whyDoYouDisagreeFullRejectionController
  from './features/response/admission/fullRejection/whyDoYouDisagreeFullRejectionController';
import documentDownloadController from './features/document/documentDownloadController';
import responseDeadlineOptionsController from './features/response/responseDeadline/responseDeadlineOptionsController';
import understandingYourOptionsController from './features/response/understandingYourOptionsController';
import newDeadlineResponseController from './features/response/responseDeadline/newResponseDeadlineController';
import requestMoreTimeController from './features/response/requestMoreTimeController';
import agreedResponseDeadlineController from './features/response/responseDeadline/agreedResponseDeadlineController';
import determinationWithoutHearingController
  from './features/directionsQuestionnaire/determinationWithoutHearingController';
import totalAmountController from './features/public/eligibility/totalAmountController';
import claimTypeController from './features/public/eligibility/claimTypeController';
import notEligibleController from './features/public/eligibility/notEligibleController';
import claimantAddressEligibilityController from './features/public/eligibility/claimantAddressEligibilityController';
import singleDefendantController from './features/public/eligibility/singleDefendantController';
import defendantAddressEligibilityController from './features/public/eligibility/defendantAddressEligibilityController';
import helpWithFeesEligibilityController from './features/public/eligibility/helpWithFeesEligibilityController';
import tryNewServiceController from './features/public/eligibility/tryNewServiceController';
import tenancyDepositController from './features/public/eligibility/tenancyDepositController';
import claimAgainstGovernmentController from './features/public/eligibility/claimAgainstGovernmentController';
import claimantOver18EligibilityController from './features/public/eligibility/claimantOver18EligibilityController';
import defendantAgeEligibilityController from './features/public/eligibility/defendantAgeEligibilityController';
import someUsefulInfoFeesController from './features/public/eligibility/someUsefulInfoFeesController';
import helpWithFeesReferenceController from './features/public/eligibility/helpWithFeesReferenceController';
import applyForHelpWithFeesController from './features/public/eligibility/applyForHelpWithFeesController';
import signpostingController from './features/public/firstContact/signpostingController';
import accessDeniedController from './features/public/firstContact/accessDeniedController';
import claimReferenceController from './features/public/firstContact/claimReferenceController';
import pinController from './features/public/firstContact/pinController';
import firstContactClaimSummaryController from './features/public/firstContact/claimSummaryController';
import eligibleController from './features/public/eligibility/eligibleController';
import claimantPartyTypeController from './features/public/claim/claimantPartyTypeController';
import completingClaimController from './features/claim/completingClaimController';
import submitComfirmationController from './features/response/submitComfirmationController';
import resolvingThisDisputeController from './features/claim/resolvingThisDisputeController';
import cookiesController from './features/public/cookiesController';
import defendantExpertEvidenceController from './features/directionsQuestionnaire/defendantExpertEvidenceController';
import considerClaimantDocumentsController
  from './features/directionsQuestionnaire/considerClaimantDocumentsController';
import triedToSettleController from './features/directionsQuestionnaire/triedToSettleController';
import expertSmallClaimsController from './features/directionsQuestionnaire/expertSmallClaimsController';
import sharedExpertController from './features/directionsQuestionnaire/sharedExpertController';
import requestExtra4WeeksController from './features/directionsQuestionnaire/requestExtra4WeeksController';
import permissionForExpertController from './features/directionsQuestionnaire/permissionForExpertController';
import defendantYourselfEvidenceController
  from './features/directionsQuestionnaire/defendantYourselfEvidenceController';
import expertCanStillExamineController from './features/directionsQuestionnaire/expertCanStillExamineController';
import expertDetailsController from './features/directionsQuestionnaire/experts/expertDetailsController';
import sentExpertReportsController from './features/directionsQuestionnaire/sentExpertReportsController';
import otherWitnessesController from './features/directionsQuestionnaire/otherWitnessesController';
import expertReportDetailsController from './features/directionsQuestionnaire/expertReportDetailsController';
import claimantDoBController from './features/public/claim/claimantDoBController';
import claimantIndividualDetailsController from './features/claim/claimantIndividualDetailsController';
import phoneOrVideoHearingController from './features/directionsQuestionnaire/phoneOrVideoHearingController';

export default [
  homeController,
  dashboardController,
  unauthorisedController,
  responseDetailsController,
  phoneDetailsController,
  responseDobController,
  claimDetailsController,
  ageEligibilityController,
  responsePostcodeLookupController,
  citizenResponseTypeController,
  citizenPartnerAgeController,
  partnerDisabilityController,
  citizenDisabilityController,
  citizenSevereDisabilityController,
  bankAccountsController,
  partnerController,
  partnerSevereDisabilityController,
  residenceController,
  employmentStatusController,
  financialDetailsController,
  whoEmploysYouController,
  otherDependantsController,
  partnerPensionController,
  paymentOptionController,
  paymentDateController,
  betweenSixteenAndNineteenController,
  dependantsController,
  priorityDebtsController,
  selfEmployedAsController,
  onTaxPaymentsController,
  unemploymentController,
  childrenDisabilityController,
  regularExpensesController,
  debtsController,
  monthlyExpenseIncomeCalculatorController,
  whyDoYouDisagreeController,
  carerController,
  explanationController,
  alreadyPaidController,
  taskListController,
  howMuchDoYouOweController,
  courtOrdersController,
  repaymentPlanController,
  regularIncomeController,
  mediationIndividualPhoneController,
  howMuchHaveYouPaidController,
  companyTelephoneNumberController,
  mediationDisagreementController,
  freeTelephoneMediationController,
  sendYourResponseByEmailController,
  contactThemController,
  rejectAllOfClaimController,
  iDontWantFreeMediationController,
  evidenceController,
  defendantTimelineController,
  theirPdfTimelineDownloadController,
  checkAnswersController,
  youHavePaidLessController,
  yourDefenceController,
  incompleteSubmissionController,
  howMuchHaveYouPaidFRController,
  claimSummaryController,
  paymentDatePAController,
  expertGuidanceController,
  partialAdmissionPaymentOptionController,
  supportRequiredController,
  whyDoYouDisagreeFullRejectionController,
  documentDownloadController,
  vulnerabilityController,
  understandingYourOptionsController,
  repaymentPlanPartialController,
  responseDeadlineOptionsController,
  requestMoreTimeController,
  agreedResponseDeadlineController,
  newDeadlineResponseController,
  determinationWithoutHearingController,
  totalAmountController,
  claimTypeController,
  notEligibleController,
  claimantAddressEligibilityController,
  singleDefendantController,
  claimAgainstGovernmentController,
  defendantAddressEligibilityController,
  helpWithFeesEligibilityController,
  tryNewServiceController,
  tenancyDepositController,
  claimantOver18EligibilityController,
  defendantAgeEligibilityController,
  someUsefulInfoFeesController,
  applyForHelpWithFeesController,
  helpWithFeesReferenceController,
  signpostingController,
  accessDeniedController,
  claimReferenceController,
  pinController,
  firstContactClaimSummaryController,
  eligibleController,
  claimantPartyTypeController,
  completingClaimController,
  submitComfirmationController,
  resolvingThisDisputeController,
  cookiesController,
  considerClaimantDocumentsController,
  sharedExpertController,
  triedToSettleController,
  expertSmallClaimsController,
  requestExtra4WeeksController,
  permissionForExpertController,
  defendantExpertEvidenceController,
  expertCanStillExamineController,
  defendantYourselfEvidenceController,
  expertDetailsController,
  sentExpertReportsController,
  otherWitnessesController,
  expertReportDetailsController,
  claimantIndividualDetailsController,
  claimantDoBController,
  phoneOrVideoHearingController,
];
