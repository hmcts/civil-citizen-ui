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
import incompleteClaimIssueSubmissionController from './features/claim/incompleteClaimIssueSubmissionController';
import howMuchHaveYouPaidFRController from './features/response/admission/fullRejection/howMuchHaveYouPaidController';
import claimSummaryController from './features/dashboard/claimSummaryController';
import expertGuidanceController from './features/directionsQuestionnaire/experts/expertGuidanceController';
import partialAdmissionPaymentOptionController
  from './features/response/admission/partialAdmission/partialAdmissionPaymentOptionController';
import supportRequiredController from './features/directionsQuestionnaire/supportRequiredController';
import vulnerabilityController from './features/directionsQuestionnaire/vulnerabilityQuestions/vulnerabilityController';
import whyDoYouDisagreeFullRejectionController
  from './features/response/admission/fullRejection/whyDoYouDisagreeFullRejectionController';
import documentDownloadController from './features/document/documentDownloadController';
import responseDeadlineOptionsController from './features/response/responseDeadline/responseDeadlineOptionsController';
import understandingYourOptionsController from './features/response/understandingYourOptionsController';
import newDeadlineResponseController from './features/response/responseDeadline/newResponseDeadlineController';
import requestMoreTimeController from './features/response/requestMoreTimeController';
import agreedResponseDeadlineController from './features/response/responseDeadline/agreedResponseDeadlineController';
import determinationWithoutHearingController
  from './features/directionsQuestionnaire/hearing/determinationWithoutHearingController';
import totalAmountEligibilityController from './features/public/eligibility/totalAmountController';
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
import helpWithFeesReferenceEligibilityController
  from './features/public/eligibility/helpWithFeesReferenceEligibilityController';
import applyForHelpWithFeesController from './features/public/eligibility/applyForHelpWithFeesController';
import signpostingController from './features/public/firstContact/signpostingController';
import accessDeniedController from './features/public/firstContact/accessDeniedController';
import claimReferenceController from './features/public/firstContact/claimReferenceController';
import pinController from './features/public/firstContact/pinController';
import firstContactClaimSummaryController from './features/public/firstContact/claimSummaryController';
import eligibleController from './features/public/eligibility/eligibleController';
import claimantPartyTypeController from './features/claim/yourDetails/claimantPartyTypeController';
import completingClaimController from './features/claim/completingClaimController';
import submitConfirmationController from './features/response/submitConfirmationController';
import resolvingThisDisputeController from './features/claim/resolvingThisDisputeController';
import cookiesController from './features/public/cookiesController';
import defendantExpertEvidenceController from './features/directionsQuestionnaire/experts/expertEvidenceController';
import considerClaimantDocumentsController
  from './features/directionsQuestionnaire/considerClaimantDocumentsController';
import triedToSettleController from './features/directionsQuestionnaire/triedToSettleController';
import expertSmallClaimsController from './features/directionsQuestionnaire/experts/expertSmallClaimsController';
import sharedExpertController from './features/directionsQuestionnaire/experts/sharedExpertController';
import requestExtra4WeeksController from './features/directionsQuestionnaire/requestExtra4WeeksController';
import permissionForExpertController from './features/directionsQuestionnaire/experts/permissionForExpertController';
import defendantYourselfEvidenceController
  from './features/directionsQuestionnaire/defendantYourselfEvidenceController';
import expertCanStillExamineController
  from './features/directionsQuestionnaire/experts/expertCanStillExamineController';
import expertDetailsController from './features/directionsQuestionnaire/experts/expertDetailsController';
import sentExpertReportsController from './features/directionsQuestionnaire/experts/sentExpertReportsController';
import otherWitnessesController from './features/directionsQuestionnaire/witnesses/otherWitnessesController';
import expertReportDetailsController from './features/directionsQuestionnaire/experts/expertReportDetailsController';
import defendantPartyTypeController from './features/claim/yourDetails/defendantPartyTypeController';
import claimantDoBController from './features/claim/yourDetails/claimantDoBController';
import welshLanguageController
  from './features/directionsQuestionnaire/welshLanguageRequirements/welshLanguageController';
import claimantPhoneController from './features/claim/yourDetails/claimantPhoneController';
import whyUnavailableForHearingController
  from './features/directionsQuestionnaire/hearing/whyUnavailableForHearingController';
import phoneOrVideoHearingController from './features/directionsQuestionnaire/hearing/phoneOrVideoHearingController';
import cantAttendHearingInNext12MonthsController
  from './features/directionsQuestionnaire/hearing/cantAttendHearingInNext12MonthsController';
import youCanUseServiceController from './features/public/eligibility/youCanUseServiceController';
import defendantDetailsController from './features/claim/defendant/defendantDetailsController';
import interestTypeController from './features/claim/interest/interestTypeController';
import interestRateController from './features/claim/interest/claimantInterestRateController';
import interestStartDateController from './features/claim/interest/interestStartDateController';
import interestEndDateController from './features/claim/interest/interestEndDateController';
import claimAmountBreakdownController from './features/claim/amount/claimAmountBreakdownController';
import claimInterestController from './features/claim/interest/claimInterestController';
import claimantInterestFromController from './features/claim/interest/claimantInterestFromController';
import claimantDetailsController from './features/claim/yourDetails/claimantDetailsController';
import defendantEmailController from './features/claim/yourDetails/defendantEmailController';
import claimTotalInterestController from './features/claim/interest/claimTotalInterestController';
import reasonController from './features/claim/details/reasonController';
import timelineController from './features/claim/yourDetails/timelineController';
import defendantPhoneController from './features/claim/yourDetails/defendantPhoneController';
import continueClaimingInterestController from './features/claim/interest/continueClaimingInterestController';
import claimCheckAnswersController from './features/claim/checkAnswersController';
import claimantEvidenceController from './features/claim/yourDetails/claimantEvidenceController';
import howMuchContinueClaimingController from './features/claim/interest/howMuchContinueClaimingController';
import helpWithFeesController from './features/claim/details/helpWithFeesController';
import debtRespiteReferenceNumberController from './features/breathingSpace/debtRespiteReferenceNumberController';
import datePaidViewController from './features/claimantResponse/paidInFull/datePaidController';
import claimSettledConfirmationController
  from './features/claimantResponse/claimSettledConfirmationController';
import settleClaimController from './features/claimantResponse/settleClaimController';
import acceptRepaymentPlanController from './features/claimantResponse/acceptRepaymentPlanController';
import partPaymentReceivedController from './features/claimantResponse/partPaymentReceivedController';
import defendantDOBController from './features/claimantResponse/ccj/defendantDOBController';
import claimantIntentionToProceedController from './features/claimantResponse/claimantIntentionToProceedController';
import breathingSpaceCheckAnswersController from './features/breathingSpace/checkAnswersController';
import totalAmountController from './features/claim/totalAmountController';
import rejectionReasonController from './features/claimantResponse/rejectionReasonController';
import specificCourtController from './features/directionsQuestionnaire/hearing/specificCourtController';
import debtRespiteOptionController from './features/breathingSpace/debtRespiteOptionController';
import debtStartDateController from './features/breathingSpace/debtRespiteStartDateController';
import debtRespiteEndDateController from './features/breathingSpace/debtRespiteEndDateController';
import reviewDefendantsResponseController from './features/claimantResponse/reviewDefendantsResponseController';
import claimSubmittedController from './features/claim/claimSubmittedController';
import ccjPaymentOptionController from './features/claimantResponse/ccj/ccjPaymentOptionController';
import paidSomeAmountController from './features/claimantResponse/ccj/paidAmountController';
import defendantPaymentDateController from './features/claimantResponse/ccj/defendantPaymentDateController';
import ccjConfirmationController from './features/claimantResponse/ccj/ccjConfirmationController';
import settleAdmittedController from './features/claimantResponse/settleAdmittedController';
import bilingualLangPreferenceController from './features/response/bilingualLangPreferenceController';
import chooseHowToProceedController from './features/claimantResponse/chooseHowToProceedController';
import repaymentPlanInstalmentsController from './features/claimantResponse/ccj/repaymentPlanInstalmentsController';
import courtProposedDateController from './features/claimantResponse/courtProposedDateController';
import signSettlementAgreementController from './features/claimantResponse/signSettlmentAgreementController';
import repaymentPlanAcceptedController from './features/claimantResponse/repaymentPlanAcceptedController';
import courtProposedPlanController from './features/claimantResponse/courtProposedPlanController';
import debtRespiteLiftedController from './features/breathingSpace/debtRespiteLiftedController';
import claimantResponseConfirmationController from './features/claimantResponse/claimantResponseConfirmationController';
import assignClaimController from './features/claimAssignment/assignClaimController';
import judgmentAmountSummaryController from './features/claimantResponse/ccj/judgmentAmountSummaryController';
import judgmentAmountSummaryExtendedController from './features/claimantResponse/ccj/judgmentAmountSummaryExtendedController';
import ccjCheckAnswersController from './features/claimantResponse/ccj/ccjCheckAnswersController';
import claimantResponseTasklistController from './features/claimantResponse/claimantResponseTasklistController';
import unavailableDatesForHearingController from './features/directionsQuestionnaire/hearing/unavailableDatesForHearingController';
import claimantSuggestedPaymentOptionController from './features/claimantResponse/claimantSuggestedPaymentOptionController';
import claimantSuggestedPaymentDateController from './features/claimantResponse/claimantSuggestedPaymentDateController';
import claimantSuggestedInstalmentsController from './features/claimantResponse/claimantSuggestedInstalmentsController';
import typeOfDocumentsController from './features/caseProgression/typeOfDocumentsController';
import uploadDocumentsController from './features/caseProgression/uploadDocumentsController';
import uploadYourDocumentsController from 'routes/features/caseProgression/uploadYourDocumentsController';
import documentsUploadedController from 'routes/features/caseProgression/documentsUploadedController';
import cancelYourUploadController from 'routes/features/caseProgression/cancelYourUploadController';
import finaliseTrialArrangementsController from 'routes/features/caseProgression/trialArrangements/finaliseTrialArrangementsController';
import uploadFileController from 'routes/features/caseProgression/uploadFileController';
import documentUploadCheckAnswerController from 'routes/features/caseProgression/checkAnswersController';
import claimTaskListController from './features/claim/claimTaskListController';
import isCaseReadyController from 'routes/features/caseProgression/trialArrangements/isCaseReadyController';
import hasAnythingChangedController from 'routes/features/caseProgression/trialArrangements/hasAnythingChangedController';
import claimFeeBreakDownController from './features/claim/payment/claimFeeBreakDownController';
import hearingDurationController from 'routes/features/caseProgression/trialArrangements/hearingDurationAndOtherInformationController';
import trialCheckAnswersController from 'routes/features/caseProgression/trialArrangements/checkAnswersController';
import documentViewController from 'routes/features/document/documentViewController';
import feeChangeController from './features/claim/feeChangeController';
import trialArrangementsConfirmationController
  from 'routes/features/caseProgression/trialArrangements/trialArrangementsConfirmationController';
import claimantResponseCheckAnswersController from './features/claimantResponse/claimantResponseCheckAnswersController';
import claimFeeController from 'routes/features/claim/claimFeeController';
import cancelTrialArrangementsController from 'routes/features/caseProgression/trialArrangements/cancelTrialArrangementsController';
import respondSettlementAgreementController from './features/settlementAgreement/respondSettlementAgreementController';
import respondSettlementAgreementConfirmationController
  from 'routes/features/settlementAgreement/respondSettlementAgreementConfirmationController';

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
  incompleteClaimIssueSubmissionController,
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
  totalAmountEligibilityController,
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
  helpWithFeesReferenceEligibilityController,
  signpostingController,
  accessDeniedController,
  claimReferenceController,
  pinController,
  firstContactClaimSummaryController,
  eligibleController,
  claimantPartyTypeController,
  completingClaimController,
  submitConfirmationController,
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
  defendantPartyTypeController,
  welshLanguageController,
  claimantPhoneController,
  whyUnavailableForHearingController,
  claimantDoBController,
  phoneOrVideoHearingController,
  cantAttendHearingInNext12MonthsController,
  youCanUseServiceController,
  defendantDetailsController,
  interestTypeController,
  interestRateController,
  claimAmountBreakdownController,
  claimInterestController,
  interestStartDateController,
  claimantDetailsController,
  interestStartDateController,
  interestEndDateController,
  claimantInterestFromController,
  defendantEmailController,
  claimTotalInterestController,
  reasonController,
  timelineController,
  defendantPhoneController,
  continueClaimingInterestController,
  claimCheckAnswersController,
  claimantEvidenceController,
  howMuchContinueClaimingController,
  helpWithFeesController,
  debtRespiteReferenceNumberController,
  breathingSpaceCheckAnswersController,
  datePaidViewController,
  claimSettledConfirmationController,
  settleClaimController,
  acceptRepaymentPlanController,
  partPaymentReceivedController,
  defendantDOBController,
  claimantIntentionToProceedController,
  totalAmountController,
  rejectionReasonController,
  specificCourtController,
  debtRespiteOptionController,
  debtStartDateController,
  debtRespiteEndDateController,
  debtRespiteLiftedController,
  reviewDefendantsResponseController,
  claimSubmittedController,
  ccjPaymentOptionController,
  paidSomeAmountController,
  defendantPaymentDateController,
  ccjConfirmationController,
  settleAdmittedController,
  bilingualLangPreferenceController,
  chooseHowToProceedController,
  repaymentPlanInstalmentsController,
  courtProposedDateController,
  signSettlementAgreementController,
  repaymentPlanAcceptedController,
  courtProposedPlanController,
  claimantResponseConfirmationController,
  assignClaimController,
  ccjCheckAnswersController,
  judgmentAmountSummaryController,
  judgmentAmountSummaryExtendedController,
  claimantResponseTasklistController,
  unavailableDatesForHearingController,
  claimantSuggestedPaymentOptionController,
  claimantSuggestedPaymentDateController,
  claimantSuggestedInstalmentsController,
  typeOfDocumentsController,
  uploadDocumentsController,
  uploadYourDocumentsController,
  documentsUploadedController,
  cancelYourUploadController,
  finaliseTrialArrangementsController,
  uploadFileController,
  documentUploadCheckAnswerController,
  claimTaskListController,
  isCaseReadyController,
  hasAnythingChangedController,
  claimFeeBreakDownController,
  hearingDurationController,
  trialCheckAnswersController,
  documentViewController,
  feeChangeController,
  trialArrangementsConfirmationController,
  claimantResponseCheckAnswersController,
  claimFeeController,
  cancelTrialArrangementsController,
  respondSettlementAgreementController,
  respondSettlementAgreementConfirmationController,
];
