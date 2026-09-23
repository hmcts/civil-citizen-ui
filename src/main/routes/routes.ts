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
import knownClaimAmountController from './features/public/eligibility/knownClaimAmountController';
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
import confirmYourDetailsEvidenceController
  from './features/directionsQuestionnaire/confirmYourDetailsEvidenceController';
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
import datePaidViewController from './features/claimantResponse/paidInFull/datePaidController';
import claimSettledConfirmationController from './features/claimantResponse/claimSettledConfirmationController';
import settleClaimController from './features/claimantResponse/settleClaimController';
import acceptRepaymentPlanController from './features/claimantResponse/acceptRepaymentPlanController';
import partPaymentReceivedController from './features/claimantResponse/partPaymentReceivedController';
import defendantDOBController from './features/claimantResponse/ccj/defendantDOBController';
import claimantIntentionToProceedController from './features/claimantResponse/claimantIntentionToProceedController';
import totalAmountController from './features/claim/totalAmountController';
import rejectionReasonController from './features/claimantResponse/rejectionReasonController';
import specificCourtController from './features/directionsQuestionnaire/hearing/specificCourtController';
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
import repaymentPlanSummaryDefendantController
  from './features/claimantResponse/ccj/repaymentPlanSummaryDefendantController';
import courtProposedDateController from './features/claimantResponse/courtProposedDateController';
import signSettlementAgreementController from './features/claimantResponse/signSettlmentAgreementController';
import repaymentPlanAcceptedController from './features/claimantResponse/repaymentPlanAcceptedController';
import courtProposedPlanController from './features/claimantResponse/courtProposedPlanController';
import claimantResponseConfirmationController from './features/claimantResponse/claimantResponseConfirmationController';
import incompleteClaimantResponseSubmissionController
  from './features/claimantResponse/incompleteClaimantResponseSubmissionController';
import assignClaimController from './features/claimAssignment/assignClaimController';
import judgmentAmountSummaryController from './features/claimantResponse/ccj/judgmentAmountSummaryController';
import judgmentAmountSummaryExtendedController
  from './features/claimantResponse/ccj/judgmentAmountSummaryExtendedController';
import ccjCheckAnswersController from './features/claimantResponse/ccj/ccjCheckAnswersController';
import claimantResponseTasklistController from './features/claimantResponse/claimantResponseTasklistController';
import unavailableDatesForHearingController
  from './features/directionsQuestionnaire/hearing/unavailableDatesForHearingController';
import claimantSuggestedPaymentOptionController
  from './features/claimantResponse/claimantSuggestedPaymentOptionController';
import claimantSuggestedPaymentDateController from './features/claimantResponse/claimantSuggestedPaymentDateController';
import claimantSuggestedInstalmentsController from './features/claimantResponse/claimantSuggestedInstalmentsController';
import typeOfDocumentsController from './features/caseProgression/typeOfDocumentsController';
import uploadDocumentsController from './features/caseProgression/uploadDocumentsController';
import uploadYourDocumentsController from 'routes/features/caseProgression/uploadYourDocumentsController';
import documentsUploadedController from 'routes/features/caseProgression/documentsUploadedController';
import cancelYourUploadController from 'routes/features/caseProgression/cancelYourUploadController';
import finaliseTrialArrangementsController
  from 'routes/features/caseProgression/trialArrangements/finaliseTrialArrangementsController';
import documentUploadCheckAnswerController from 'routes/features/caseProgression/checkAnswersController';
import claimTaskListController from './features/claim/claimTaskListController';
import isCaseReadyController from 'routes/features/caseProgression/trialArrangements/isCaseReadyController';
import hasAnythingChangedController
  from 'routes/features/caseProgression/trialArrangements/hasAnythingChangedController';
import claimFeeBreakDownController from './features/claim/payment/claimFeeBreakDownController';
import hearingDurationController
  from 'routes/features/caseProgression/trialArrangements/hearingDurationAndOtherInformationController';
import trialCheckAnswersController from 'routes/features/caseProgression/trialArrangements/checkAnswersController';
import documentViewController from 'routes/features/document/documentViewController';
import feeChangeController from './features/claim/feeChangeController';
import createDraftClaimController from './features/claim/createDraftClaim';
import trialArrangementsConfirmationController
  from 'routes/features/caseProgression/trialArrangements/trialArrangementsConfirmationController';
import claimantResponseCheckAnswersController from './features/claimantResponse/claimantResponseCheckAnswersController';
import cancelTrialArrangementsController
  from 'routes/features/caseProgression/trialArrangements/cancelTrialArrangementsController';
import respondSettlementAgreementConfirmationController
  from 'routes/features/settlementAgreement/respondSettlementAgreementConfirmationController';
import respondSettlementAgreementController from './features/settlementAgreement/respondSettlementAgreementController';
import repaymentPlanSummaryClaimantController
  from './features/claimantResponse/ccj/repaymentPlanSummaryClaimantController';
import payHearingFeeStartScreenController
  from 'routes/features/caseProgression/hearingFee/payHearingFeeStartScreenController';
import claimantDashboardController from './features/dashboard/claimantDashboardController';
import applyHelpFeeSelectionController
  from 'routes/features/caseProgression/hearingFee/applyHelpFeeSelectionController';
import cancelHearingFeeJourneyController
  from 'routes/features/caseProgression/hearingFee/cancelHearingFeeJourneyController';
import applyHelpWithFeesController from 'routes/features/helpWithFees/helpWithFeesController';
import applyHelpWithFeeController from 'routes/features/caseProgression/hearingFee/applyHelpWithFeeController';
import contactNameMediationConfirmationController
  from 'routes/features/mediation/contactNameMediationConfirmationController';
import telephoneMediationController from 'routes/features/mediation/telephoneMediationController';
import emailMediationConfirmationController from 'routes/features/mediation/emailMediationConfirmationController';
import telephoneMediationConfirmationController
  from 'routes/features/mediation/telephoneMediationConfirmationController';
import applyHelpFeeReferenceController
  from 'routes/features/caseProgression/hearingFee/applyHelpFeeReferenceController';
import paymentUnsuccessfulController from 'routes/features/caseProgression/hearingFee/paymentUnsuccessfulController';
import payHearingFeeConfirmationController
  from 'routes/features/caseProgression/hearingFee/payHearingFeeConfirmationController';
import makePaymentAgainController from 'routes/features/caseProgression/hearingFee/makePaymentAgainController';
import paymentConfirmationController from 'routes/features/caseProgression/hearingFee/paymentConfirmationController';
import alternativeEmailAddressMediationController
  from 'routes/features/mediation/alternativeEmailAddressMediationController';
import mediationUnavailabilityNextThreeMonthsConfirmationController
  from 'routes/features/mediation/mediationUnavailabilityNextThreeMonthsConfirmationController';
import mediationUnavailabilitySelectDatesController
  from 'routes/features/mediation/mediationUnavailabilitySelectDatesController';
import alternativeTelephoneMediationController from 'routes/features/mediation/alternativeTelephoneMediationController';
import claimBilingualLangPreferenceController from 'routes/features/claim/bilingualLangPreferenceController';
import paymentSuccessfulController from 'routes/features/claim/paymentSuccessfulController';
import alternativeContactPersonMediationController
  from 'routes/features/mediation/alternativeContactPersonMediationController';
import startMediationUploadDocumentsController
  from 'routes/features/mediation/uploadDocuments/startMediationUploadDocumentsController';
import mediationTypeOfDocumentsController from 'routes/features/mediation/uploadDocuments/typeOfDocumentsController';
import claimFeePaymentConfirmationController from 'routes/features/claim/payment/claimFeePaymentConfirmationController';
import claimIssuePaymentSuccessfulController from 'routes/features/claim/payment/claimFeePaymentSuccessfulController';
import claimIssuePaymentUnsuccessfulController
  from 'routes/features/claim/payment/claimFeePaymentUnsuccessfulController';
import mediationUploadDocumentsController from 'routes/features/mediation/uploadDocuments/uploadDocumentsController';
import mediationDocumentUploadCheckAnswerController
  from 'routes/features/mediation/uploadDocuments/checkAnswersController';
import mediationConfirmationController from 'routes/features/mediation/uploadDocuments/confirmationController';
import mediationCancelUploadController from 'routes/features/mediation/uploadDocuments/mediationCancelUploadController';
import notificationRedirectController from 'routes/features/dashboard/notificationRedirectController';
import claimantClaimSummaryController from 'routes/features/dashboard/claimantClaimSummaryController';
import bundlesController from 'routes/features/caseProgression/bundlesController';
import viewMediationSettlementAgreementDocument
  from 'routes/features/document/mediation/viewSettlementAgreementDocumentController';
import viewDefendantInformationController from './features/dashboard/viewDefendantInformationController';
import viewClaimantInformationController from './features/dashboard/viewClaimantInformationController';
import cancelController from 'routes/common/cancelController';
import evidenceUploadDocumentsController from 'routes/features/caseProgression/evidenceUploadDocumentsController';
import viewMediationDocuments from 'routes/features/document/mediation/viewMediationDocumentsController';
import applicationTypeController from './features/generalApplication/applicationTypeController';
import respondentAgreementController from './features/generalApplication/response/respondentAgreementController';
import viewTheHearingController from 'routes/features/caseProgression/viewTheHearingController';
import viewResponseToClaimController from 'routes/features/dashboard/viewResponseToClaimController';
import viewTheJudgementController from 'routes/features/caseProgression/viewTheJudgementController';
import claimFeeMakePaymentAgainController from 'routes/features/claim/payment/claimFeeMakePaymentAgainController';
import informOtherPartiesController from './features/generalApplication/informOtherPartiesController';
import hearingSupportController from './features/generalApplication/hearingSupportController';
import agreementFromOtherPartyController from './features/generalApplication/agreementFromOtherPartyController';
import applicationFeePaymentSuccessfulController
  from './features/generalApplication/applicationFeePaymentSuccessfulController';
import claimApplicationCostController from './features/generalApplication/claimApplicationCostController';
import respondentAgreeToOrderController from 'routes/features/generalApplication/respondentAgreeToOrderController';
import payingForApplicationController from './features/generalApplication/payingForApplicationController';
import applicationCostsController from './features/generalApplication/applicationCostsController';
import requestingReasonController from 'routes/features/generalApplication/requestingReasonController';
import addAnotherApplicationController from './features/generalApplication/addAnotherApplicationController';
import orderJudgeController from './features/generalApplication/orderJudgeController';
import ordersAndNoticesController from 'routes/features/dashboard/ordersAndNoticesController';
import uploadN245FormController from 'routes/features/generalApplication/uploadN245FormController';
import unavailableHearingDatesController from 'routes/features/generalApplication/unavailableHearingDatesController';
import hearingArrangementController from './features/generalApplication/hearingArrangementController';
import hearingContactDetailsController from './features/generalApplication/hearingContactDetailsController';
import gaCheckAnswersController from 'routes/features/generalApplication/checkAnswersController';
import applicationPaymentUnsuccessfulController
  from './features/generalApplication/applicationPaymentUnsuccessfulController';
import applicationResponseConfirmationController
  from 'routes/features/generalApplication/response/applicationResponseConfirmationController';
import flightDetailsController from './features/claim/airlines/flightDetailsController';
import delayedFlightController from './features/claim/airlines/delayedFlightController';
import respondentRequestChangeInformationController
  from 'routes/features/generalApplication/respondentRequestChangeInformationController';
import accessibilityStatementController from './features/public/accessibilityStatementController';
import termsAndConditionsController from './features/public/termsAndConditionsController';
import contactUsController from './features/public/contactUsController';
import privacyPolicyController from './features/public/privacyPolicyController';
import hearingArrangementsGuidanceController
  from 'routes/features/generalApplication/hearingArrangementsGuidanceController';
import wantToUploadDocumentsController from 'routes/features/generalApplication/wantToUploadDocuments';
import uploadEvidenceDocumentsForApplicationController
  from 'routes/features/generalApplication/uploadEvidenceDocumentForApplication';
import confirmYouHaveBeenPaidController from 'routes/features/judgmentOnline/confirmYouHaveBeenPaidController';
import confirmYouHaveBeenPaidConfirmController
  from 'routes/features/judgmentOnline/confirmYouHaveBeenPaidConfirmationController';
import gaCheckAnswersResponseController
  from 'routes/features/generalApplication/response/checkAnswersResponseController';
import hearingArrangementResponseController
  from 'routes/features/generalApplication/response/hearingArrangementResponseController';
import hearingContactDetailsResponseController
  from 'routes/features/generalApplication/response/hearingContactDetailsResponseController';
import hearingSupportResponseController
  from 'routes/features/generalApplication/response/hearingSupportResponseController';
import unavailableHearingDatesResponseController
  from 'routes/features/generalApplication/response/unavailableHearingDatesResponseController';
import helpWithApplicationFeeController
  from 'routes/features/generalApplication/applicationFee/helpWithApplicationFeeController';
import helpWithFeesContentController
  from 'routes/features/generalApplication/applicationFee/helpWithFeesContentController';
import helpWithApplicationFeeReferenceController
  from 'routes/features/generalApplication/applicationFee/helpWithApplicationFeeReferenceController';
import helpWithApplicationFeeContinueController
  from './features/generalApplication/applicationFee/helpWithApplicationFeeContinueController';
import payApplicationFeeConfirmationController
  from 'routes/features/generalApplication/applicationFee/payApplicationFeeConfirmationController';
import submitGeneralApplicationConfirmationController
  from 'routes/features/generalApplication/submitGeneralApplicationConfirmationController';
import acceptDefendantOfferController from './features/generalApplication/response/acceptDefendantOfferController';
import viewApplicationController from 'routes/features/generalApplication/viewApplicationController';
import requestForReviewController
  from 'routes/features/caseProgression/requestForReconsideration/requestForReviewController';
import requestForReconsiderationCheckAnswersController from './features/caseProgression/requestForReconsideration/checkAnswersController';
import requestForReconsiderationConfirmationController
  from 'routes/features/caseProgression/requestForReconsideration/confirmationController';
import cancelRequestForReconsiderationController
  from 'routes/features/caseProgression/requestForReconsideration/cancelRequestForReconsiderationController';
import viewBreathingSpaceInformationController from 'routes/features/dashboard/viewBreathingSpaceInformationController';
import multiTrackDisclosureNonElectronicDocuments
  from 'routes/features/directionsQuestionnaire/mintiMultitrack/disclosureNonElectronicDocumentsController';
import disclosureOfDocumentsController
  from 'routes/features/directionsQuestionnaire/mintiMultitrack/disclosureOfDocumentsController';
import disclosureOfElectronicDocumentsIssues
  from 'routes/features/directionsQuestionnaire/mintiMultitrack/disclosureOfElectronicDocumentsIssuesController';
import documentsConsideredDetailsController
  from 'routes/features/directionsQuestionnaire/mintiMultitrack/documentsConsideredDetailsController';
import agreementReachedController
  from 'routes/features/directionsQuestionnaire/mintiMultitrack/agreementReachedController';
import documentsTobeConsideredController
  from 'routes/features/directionsQuestionnaire/mintiMultitrack/documentsTobeConsideredController';
import subjectToFRCController from './features/directionsQuestionnaire/fixedRecoverableCosts/subjectToFRCController';
import frcBandAgreedController
  from 'routes/features/directionsQuestionnaire/fixedRecoverableCosts/frcBandAgreedController';
import chooseComplexityBandController from './features/directionsQuestionnaire/fixedRecoverableCosts/chooseComplexityBandController';
import reasonForComplexityBandController
  from 'routes/features/directionsQuestionnaire/fixedRecoverableCosts/reasonForChoosingComplexityBandController';
import whyNotSubjectToFRCController
  from 'routes/features/directionsQuestionnaire/fixedRecoverableCosts/whyNotSubjectToFRCController';
import backController from 'routes/common/backController';
import applicationFeePaymentConfirmationController from './features/generalApplication/payment/applicationFeePaymentConfirmationController';
import uploadAdditionalDocumentsController from './features/generalApplication/additionalDocuments/uploadAdditionalDocumentsController';
import gaAdditionalDocCheckAnswerController from './features/generalApplication/additionalDocuments/checkAnswersController';
import additionalDocSubmittedController from './features/generalApplication/additionalDocuments/submittedController';
import viewApplicationToRespondentController from 'routes/features/generalApplication/response/viewApplicationController';
import applicationSummaryController from './features/generalApplication/applicationSummaryController';
import applicationResponseSummaryController from './features/generalApplication/response/applicationResponseSummaryController';
import additionalFeeController from './features/generalApplication/additionalFee/additionalFeeController';
import payAdditionalFeeController from 'routes/features/generalApplication/additionalFee/payAdditionalFeeController';
import requestForReviewCommentsController
  from 'routes/features/caseProgression/requestForReconsideration/requestForReviewCommentsController';
import checkAnswersCommentsController
  from 'routes/features/caseProgression/requestForReconsideration/checkAnswersCommentsController';
import commentsConfirmationController
  from 'routes/features/caseProgression/requestForReconsideration/commentsConfirmationController';
import respondentHearingPreferenceController
  from 'routes/features/generalApplication/response/respondentHearingPreferenceController';
import respondentWantToUploadDocumentsController
  from 'routes/features/generalApplication/response/respondentWantToUploadDocumentsController';
import respondentUploadEvidenceDocumentsController
  from 'routes/features/generalApplication/response/respondentUploadEvidenceDocmentsController';
import uploadDocumentsForRequestMoreInfoController
  from 'routes/features/generalApplication/additionalInfoUpload/uploadDocumentsForRequestMoreInfoController';
import gaRequestMoreInfoCheckAnswersController
  from 'routes/features/generalApplication/additionalInfoUpload/checkAnswerController';
import moreInfoSubmittedConfirmationController
  from 'routes/features/generalApplication/additionalInfoUpload/moreInfoSubmittedConfirmationController';
import uploadDocumentsDirectionsOrderController
  from 'routes/features/generalApplication/directionsOrderUpload/uploadDocumentsDirectionsOrderController';
import gaDirectionOrderCheckAnswersController from './features/generalApplication/directionsOrderUpload/checkAnswerController';
import directionOrderSubmittedConfirmationController from './features/generalApplication/directionsOrderUpload/directionOrderSubmittedConfirmationController';
import uploadDocumentsForRequestWrittenRepresentation from './features/generalApplication/writtenRepresentationDocs/uplodWrittenRepresentationDocsController';
import gaWrittenRepresentationCheckAnswersController from './features/generalApplication/writtenRepresentationDocs/checkAnswerController';
import respondAddInfoController
  from 'routes/features/generalApplication/additionalInfoUpload/respondController';
import respondWrittenRepController
  from 'routes/features/generalApplication/writtenRepresentationDocs/respondToWrittenRepController';
import debtPaymentEvidenceController
  from 'routes/features/generalApplication/certOfSorC/debtPaymentEvidenceController';
import askProofOfDebtPaymentGuidanceController
  from 'routes/features/generalApplication/certOfSorC/askProofOfDebtPaymentGuidanceController';
import defendantFinalPaymentDateController from 'routes/features/generalApplication/certOfSorC/defendantFinalPaymentDateController';
import coscCheckAnswersController from 'routes/features/generalApplication/certOfSorC/checkAnswersController';
import submitCoScApplicationConfirmationController
  from 'routes/features/generalApplication/certOfSorC/submitCoScApplicationConfirmationController';
import contactCNBCController from 'routes/features/contact/contactCNBCController';
import contactMediationController from 'routes/features/contact/contactMediationController';
import submitApplicationOfflineController from 'routes/features/generalApplication/submitApplicationOfflineController';
import gaUnavailabilityDatesConfirmationController from './features/generalApplication/unavailableHearingDatesControllerConfirmation';
import gaUnavailabilityDatesResponseConfirmationController
  from 'routes/features/generalApplication/response/unavailableHearingDatesControllerResponseConfirmation';
import qmStartController from 'routes/features/queryManagement/qmStartController';
import qmWhatToDoController from 'routes/features/queryManagement/qmWhatToDoController';
import qmInformationController from 'routes/features/queryManagement/qmInformationController';
import createQueryController from 'routes/features/queryManagement/createQueryController';
import createQueryCheckYourAnswerController from 'routes/features/queryManagement/createQueryCheckYourAnswerController';
import qmConfirmationController from 'routes/features/queryManagement/qmConfirmationController';
import sendFollowUpQueryController from 'routes/features/queryManagement/sendFollowUpQueryController';
import qmViewQueriesController from 'routes/features/queryManagement/qmViewQueriesController';
import qmViewQueryDetailsController from 'routes/features/queryManagement/qmViewQueryDetailsController';
import claimantTelephoneMediationController from 'routes/features/mediation/claimantTelephoneMediationController';
import shareQueryConfirmationController from 'routes/features/queryManagement/shareQueryConfirmationController';

export default [
  homeController,
  dashboardController,
  unauthorisedController,
  responseDetailsController,
  phoneDetailsController,
  responseDobController,
  claimDetailsController,
  claimBilingualLangPreferenceController,
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
  claimantDashboardController,
  claimantClaimSummaryController,
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
  knownClaimAmountController,
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
  confirmYourDetailsEvidenceController,
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
  repaymentPlanSummaryDefendantController,
  repaymentPlanSummaryClaimantController,
  courtProposedDateController,
  signSettlementAgreementController,
  repaymentPlanAcceptedController,
  courtProposedPlanController,
  claimantResponseConfirmationController,
  incompleteClaimantResponseSubmissionController,
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
  cancelTrialArrangementsController,
  respondSettlementAgreementController,
  respondSettlementAgreementConfirmationController,
  respondSettlementAgreementController,
  payHearingFeeStartScreenController,
  applyHelpWithFeeController,
  applyHelpFeeSelectionController,
  cancelHearingFeeJourneyController,
  contactNameMediationConfirmationController,
  telephoneMediationController,
  emailMediationConfirmationController,
  telephoneMediationConfirmationController,
  applyHelpFeeReferenceController,
  paymentUnsuccessfulController,
  payHearingFeeConfirmationController,
  makePaymentAgainController,
  paymentConfirmationController,
  applyHelpWithFeesController,
  alternativeEmailAddressMediationController,
  mediationUnavailabilityNextThreeMonthsConfirmationController,
  mediationUnavailabilitySelectDatesController,
  alternativeTelephoneMediationController,
  paymentSuccessfulController,
  alternativeContactPersonMediationController,
  createDraftClaimController,
  startMediationUploadDocumentsController,
  mediationTypeOfDocumentsController,
  claimFeePaymentConfirmationController,
  claimIssuePaymentSuccessfulController,
  claimIssuePaymentUnsuccessfulController,
  mediationUploadDocumentsController,
  mediationDocumentUploadCheckAnswerController,
  mediationConfirmationController,
  mediationCancelUploadController,
  notificationRedirectController,
  viewDefendantInformationController,
  viewClaimantInformationController,
  viewMediationSettlementAgreementDocument,
  bundlesController,
  cancelController,
  evidenceUploadDocumentsController,
  viewMediationDocuments,
  applicationTypeController,
  respondentAgreementController,
  viewTheHearingController,
  viewResponseToClaimController,
  viewTheJudgementController,
  hearingSupportController,
  claimFeeMakePaymentAgainController,
  agreementFromOtherPartyController,
  applicationFeePaymentSuccessfulController,
  informOtherPartiesController,
  claimApplicationCostController,
  respondentAgreeToOrderController,
  payingForApplicationController,
  applicationCostsController,
  requestingReasonController,
  addAnotherApplicationController,
  orderJudgeController,
  ordersAndNoticesController,
  uploadN245FormController,
  unavailableHearingDatesController,
  hearingArrangementController,
  hearingContactDetailsController,
  gaCheckAnswersController,
  applicationPaymentUnsuccessfulController,
  flightDetailsController,
  delayedFlightController,
  respondentRequestChangeInformationController,
  accessibilityStatementController,
  termsAndConditionsController,
  privacyPolicyController,
  contactUsController,
  hearingArrangementsGuidanceController,
  wantToUploadDocumentsController,
  uploadEvidenceDocumentsForApplicationController,
  applicationResponseConfirmationController,
  confirmYouHaveBeenPaidController,
  confirmYouHaveBeenPaidConfirmController,
  gaCheckAnswersResponseController,
  hearingArrangementResponseController,
  hearingContactDetailsResponseController,
  hearingSupportResponseController,
  unavailableHearingDatesResponseController,
  submitGeneralApplicationConfirmationController,
  acceptDefendantOfferController,
  requestForReviewController,
  requestForReconsiderationCheckAnswersController,
  requestForReconsiderationConfirmationController,
  cancelRequestForReconsiderationController,
  helpWithApplicationFeeController,
  helpWithFeesContentController,
  helpWithApplicationFeeReferenceController,
  helpWithApplicationFeeContinueController,
  payApplicationFeeConfirmationController,
  viewApplicationController,
  viewBreathingSpaceInformationController,
  multiTrackDisclosureNonElectronicDocuments,
  disclosureOfDocumentsController,
  disclosureOfElectronicDocumentsIssues,
  documentsConsideredDetailsController,
  agreementReachedController,
  documentsTobeConsideredController,
  subjectToFRCController,
  frcBandAgreedController,
  chooseComplexityBandController,
  reasonForComplexityBandController,
  whyNotSubjectToFRCController,
  backController,
  applicationFeePaymentConfirmationController,
  viewApplicationToRespondentController,
  applicationSummaryController,
  applicationResponseSummaryController,
  additionalFeeController,
  payAdditionalFeeController,
  requestForReviewCommentsController,
  checkAnswersCommentsController,
  commentsConfirmationController,
  respondentHearingPreferenceController,
  respondentWantToUploadDocumentsController,
  respondentUploadEvidenceDocumentsController,
  respondAddInfoController,
  uploadAdditionalDocumentsController,
  gaAdditionalDocCheckAnswerController,
  additionalDocSubmittedController,
  uploadDocumentsForRequestMoreInfoController,
  gaRequestMoreInfoCheckAnswersController,
  moreInfoSubmittedConfirmationController,
  uploadDocumentsDirectionsOrderController,
  gaDirectionOrderCheckAnswersController,
  directionOrderSubmittedConfirmationController,
  uploadDocumentsForRequestWrittenRepresentation,
  gaWrittenRepresentationCheckAnswersController,
  respondWrittenRepController,
  askProofOfDebtPaymentGuidanceController,
  defendantFinalPaymentDateController,
  debtPaymentEvidenceController,
  coscCheckAnswersController,
  submitCoScApplicationConfirmationController,
  contactCNBCController,
  contactMediationController,
  submitApplicationOfflineController,
  gaUnavailabilityDatesConfirmationController,
  gaUnavailabilityDatesResponseConfirmationController,
  qmStartController,
  qmWhatToDoController,
  qmInformationController,
  qmConfirmationController,
  createQueryCheckYourAnswerController,
  createQueryController,
  qmViewQueriesController,
  sendFollowUpQueryController,
  qmViewQueryDetailsController,
  claimantTelephoneMediationController,
  shareQueryConfirmationController,
];
