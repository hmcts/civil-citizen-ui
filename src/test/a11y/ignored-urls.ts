import * as urls from '../../main/routes/urls';

export const IGNORED_URLS = [
  urls.SIGN_IN_URL,
  urls.SIGN_OUT_URL,
  urls.CALLBACK_URL,
  urls.POSTCODE_LOOKUP_URL,
  urls.CITIZEN_DETAILS_URL,
  urls.DASHBOARD_URL,
  urls.CASE_TIMELINE_DOCUMENTS_URL,
  urls.CASE_DOCUMENT_DOWNLOAD_URL,
  urls.CLAIM_CHECK_ANSWERS_URL,
  urls.CLAIM_INTEREST_TOTAL_URL,
  urls.DEFENDANT_SUMMARY_URL,
  urls.CITIZEN_CONTACT_THEM_URL,
  urls.MAKE_APPLICATION_TO_COURT,
  urls.HELP_WITH_FEES_ELIGIBILITY,
  urls.GENERIC_HELP_FEES_URL,
  urls.HEARING_FEE_MAKE_PAYMENT_AGAIN_URL,
  urls.CANCEL_TRIAL_ARRANGEMENTS,
  urls.HEARING_FEE_CANCEL_JOURNEY,
  urls.HEARING_FEE_PAYMENT_CONFIRMATION_URL,
  urls.HEARING_FEE_PAYMENT_CONFIRMATION_URL_WITH_UNIQUE_ID,
  urls.CLAIM_FEE_URL,
  urls.DEFENDANT_SUMMARY_TAB_URL,
  urls.DASHBOARD_NOTIFICATION_REDIRECT,
  urls.DASHBOARD_NOTIFICATION_REDIRECT_DOCUMENT,
  urls.MEDIATION_SERVICE_EXTERNAL,
  urls.BASE_CASE_PROGRESSION_URL,
  //Currently failing on accessibility
  urls.ASSIGN_CLAIM_URL,
  urls.CLAIM_TIMELINE_URL,
  urls.CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL,
  urls.MEDIATION_UNAVAILABLE_SELECT_DATES_URL,
  urls.DEFENDANT_DOCUMENTS_URL,
  urls.FIRST_CONTACT_CLAIM_SUMMARY_URL,
  urls.CLAIM_FEE_BREAKUP,
  urls.CLAIM_FEE_CHANGE_URL,
  urls.CITIZEN_TIMELINE_URL,
  urls.CP_UPLOAD_DOCUMENTS_URL,
  urls.CP_EVIDENCE_UPLOAD_SUBMISSION_URL,
  urls.TRIAL_ARRANGEMENTS_CHECK_YOUR_ANSWERS,
  urls.MEDIATION_UPLOAD_DOCUMENTS,
  urls.PAY_CLAIM_FEE_UNSUCCESSFUL_URL,
  urls.CLAIM_FEE_PAYMENT_CONFIRMATION_URL_WITH_UNIQUE_ID,
  urls.CLAIM_FEE_PAYMENT_CONFIRMATION_URL,
  urls.CLAIM_FEE_MAKE_PAYMENT_AGAIN_URL,
  urls.MAKE_CLAIM,
  urls.VIEW_DEFENDANT_INFO,
  urls.VIEW_CLAIMANT_INFO,
  urls.VIEW_RESPONSE_TO_CLAIM,
  //TODO: remove this once finished CIV-11619
  urls.MEDIATION_UPLOAD_DOCUMENTS_CHECK_AND_SEND,
  urls.TESTING_SUPPORT_URL,
  urls.DASHBOARD_CLAIMANT_URL,
  // WCAG2AA.Principle1.Guideline1_3.1_3_1.H39.3.LayoutTable - govUK has caption on tables
  urls.VIEW_MEDIATION_SETTLEMENT_AGREEMENT_DOCUMENT,
  urls.CANCEL_URL,
  urls.VIEW_MEDIATION_DOCUMENTS,
  urls.BASE_GENERAL_APPLICATION_URL,
  urls.BASE_GENERAL_APPLICATION_RESPONSE_URL,
  urls.DASHBOARD_CLAIMANT_URL,
  //TODO: remove this once finished the page
  urls.VIEW_THE_HEARING_URL,
  urls.BASE_GENERAL_APPLICATION_RESPONSE_URL,
  //TODO: remove this once finished the page
  urls.VIEW_THE_JUDGMENT_URL,
  //TODO: remove this once finished the page
  urls.GENERAL_APPLICATION_CONFIRM_URL,
  urls.CONFIRM_YOU_HAVE_BEEN_PAID_URL, //TODO: remove this once finished the page
  urls.VIEW_THE_JUDGMENT_URL, //TODO: remove this once finished the page
  urls.REQUEST_FOR_CONSIDERATION, //TODO: remove this once finished the page
  urls.GA_APPLICATION_SUMMARY_URL, //TODO: remove this once finished the page
  urls.GA_VIEW_APPLICATION_URL, //TODO: remove this once finished the page
];
