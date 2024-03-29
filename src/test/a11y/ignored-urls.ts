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
  urls.BREATHING_SPACE_RESPITE_LIFTED_URL,
  urls.CP_UPLOAD_DOCUMENTS_URL,
  urls.CP_EVIDENCE_UPLOAD_SUBMISSION_URL,
  urls.TRIAL_ARRANGEMENTS_CHECK_YOUR_ANSWERS,
  urls.MEDIATION_UPLOAD_DOCUMENTS,
  urls.PAY_CLAIM_FEE_UNSUCCESSFUL_URL,
  urls.CLAIM_FEE_PAYMENT_CONFIRMATION_URL_WITH_UNIQUE_ID,
  urls.CLAIM_FEE_PAYMENT_CONFIRMATION_URL,
  urls.MAKE_CLAIM,
  //TODO: remove this once finished CIV-11619
  urls.MEDIATION_UPLOAD_DOCUMENTS_CHECK_AND_SEND,
  urls.TESTING_SUPPORT_URL,
];
