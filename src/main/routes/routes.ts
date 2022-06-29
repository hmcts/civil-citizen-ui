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
import repaymentPlanController from './features/response/repaymentPlan/repaymentPlanController';
import regularIncomeController from './features/response/statementOfMeans/income/regularIncomeController';
import mediationIndividualPhoneController from './features/mediation/mediationIndividualPhoneController';
import howMuchHaveYouPaidController from './features/response/admission/partialAdmission/howMuchHaveYouPaidController';
import companyTelephoneNumberController from './features/mediation/companyTelephoneNumberController';
import mediationDisagreementController from './features/mediation/mediationDisagreementController';
import sendYourResponseByEmailController from './features/response/eligibility/sendYourResponseByEmailController';
import freeTelephoneMediationController from './features/mediation/freeTelephoneMediationController';
import rejectAllOfClaimController from './features/response/rejectAllOfClaimController';
import defendantTimelineController from './features/response/timelineOfEvents/defendantTimelineController';
import theirPdfTimelineDownloadController from './features/response/timelineOfEvents/theirPdfTimelineDownloadController';
import iDontWantFreeMediationController from './features/mediation/iDontWantFreeMediationController';
import evidenceController from './features/response/evidence/evidenceController';
import checkAnswersController from './features/response/checkAnswersController';
import youHavePaidLessController from './features/response/rejection/fullReject/youHavePaidLessController';
import yourDefenceController from './features/response/yourDefenceController';
import incompleteSubmissionController from './features/response/incompleteSubmissionController';
import howMuchHaveYouPaidFRController from './features/response/rejection/fullReject/howMuchHaveYouPaidController';
import claimSummaryController from './features/dashboard/claimSummaryController';
import expertGuidanceController from './features/directionsQuestionnaire/expertGuidanceController';
import partialAdmissionPaymentOptionController
  from './features/response/admission/partialAdmission/partialAdmissionPaymentOptionController';
import supportRequiredController from './features/directionsQuestionnaire/supportRequiredController';

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
];
