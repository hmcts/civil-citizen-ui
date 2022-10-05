const BASE_CASE_URL = '/case/:id';
const BASE_CLAIM_URL = '/claim';
export const BASE_ELIGIBILITY_URL = '/eligibility';
export const BASE_FIRST_CONTACT_URL = '/first-contact';
const BASE_CASE_RESPONSE_URL = `${BASE_CASE_URL}/response`;
const STATEMENT_OF_MEANS_URL = `${BASE_CASE_RESPONSE_URL}/statement-of-means`;
const MEDIATION_URL = `${BASE_CASE_URL}/mediation`;
const DIRECTIONS_QUESTIONNAIRE_URL = `${BASE_CASE_URL}/directions-questionnaire`;
const FULL_REJECTION_URL = `${BASE_CASE_RESPONSE_URL}/full-rejection`;
const PARTIAL_ADMISSION_URL = `${BASE_CASE_RESPONSE_URL}/partial-admission`;
const FULL_ADMISSION_URL = `${BASE_CASE_RESPONSE_URL}/full-admission`;
export const CALLBACK_URL = '/oauth2/callback';
export const COOKIES_URL = '/cookies';
export const SIGN_IN_URL = '/login';
export const SIGN_OUT_URL = '/logout';
export const CASES_URL = '/cases';
export const DASHBOARD_URL = '/dashboard';
export const CITIZEN_PHONE_NUMBER_URL = `${BASE_CASE_RESPONSE_URL}/your-phone`;
export const ROOT_URL = '/';
export const HOME_URL = '/home';
export const DOB_URL = `${BASE_CASE_RESPONSE_URL}/your-dob`;
export const AGE_ELIGIBILITY_URL = `${BASE_CASE_RESPONSE_URL}/eligibility/under-18`;
export const SEND_RESPONSE_BY_EMAIL_URL = `${BASE_CASE_RESPONSE_URL}/eligibility/send-your-response-by-email`;
export const UNAUTHORISED_URL = '/unauthorised';
export const CLAIM_DETAILS_URL = `${BASE_CASE_RESPONSE_URL}/claim-details`;
export const CITIZEN_DETAILS_URL = `${BASE_CASE_RESPONSE_URL}/your-details`;
export const POSTCODE_LOOKUP_URL = '/postcode-lookup';
export const CITIZEN_RESPONSE_TYPE_URL = `${BASE_CASE_RESPONSE_URL}/response-type`;
export const CITIZEN_DISABILITY_URL = `${STATEMENT_OF_MEANS_URL}/disability`;
export const CITIZEN_SEVERELY_DISABLED_URL = `${STATEMENT_OF_MEANS_URL}/severe-disability`;
export const CITIZEN_RESIDENCE_URL = `${STATEMENT_OF_MEANS_URL}/residence`;
export const CITIZEN_PARTNER_URL = `${STATEMENT_OF_MEANS_URL}/partner/partner`;
export const CITIZEN_PARTNER_AGE_URL = `${STATEMENT_OF_MEANS_URL}/partner/partner-age`;
export const CITIZEN_PARTNER_PENSION_URL = `${STATEMENT_OF_MEANS_URL}/partner/partner-pension`;
export const CITIZEN_PARTNER_DISABILITY_URL = `${STATEMENT_OF_MEANS_URL}/partner/partner-disability`;
export const CITIZEN_PARTNER_SEVERE_DISABILITY_URL = `${STATEMENT_OF_MEANS_URL}/partner/partner-severe-disability`;
export const CITIZEN_DEPENDANTS_URL = `${STATEMENT_OF_MEANS_URL}/dependants`;
export const CITIZEN_BANK_ACCOUNT_URL = `${STATEMENT_OF_MEANS_URL}/bank-accounts`;
export const CITIZEN_OTHER_DEPENDANTS_URL = `${STATEMENT_OF_MEANS_URL}/other-dependants`;
export const CITIZEN_EMPLOYMENT_URL = `${STATEMENT_OF_MEANS_URL}/employment`;
export const CITIZEN_WHO_EMPLOYS_YOU_URL = `${CITIZEN_EMPLOYMENT_URL}/employers`;
export const CITIZEN_UNEMPLOYED_URL = `${STATEMENT_OF_MEANS_URL}/unemployment`;
export const CITIZEN_SELF_EMPLOYED_URL = `${CITIZEN_EMPLOYMENT_URL}/self-employment`;
export const ON_TAX_PAYMENTS_URL = `${CITIZEN_SELF_EMPLOYED_URL}/on-tax-payments`;
export const FINANCIAL_DETAILS_URL = `${STATEMENT_OF_MEANS_URL}/intro`;
export const CLAIM_TASK_LIST_URL = `${BASE_CASE_RESPONSE_URL}/task-list`;
export const CONFIRMATION_URL = `${BASE_CASE_RESPONSE_URL}/confirmation`;
export const CITIZEN_PAYMENT_OPTION_URL = `${FULL_ADMISSION_URL}/payment-option`;
export const CITIZEN_PAYMENT_DATE_URL = `${FULL_ADMISSION_URL}/payment-date`;
export const CITIZEN_PA_PAYMENT_DATE_URL = `${PARTIAL_ADMISSION_URL}/payment-date`;
export const CITIZEN_DEPENDANTS_EDUCATION_URL = `${STATEMENT_OF_MEANS_URL}/dependants/education`;
export const CHILDREN_DISABILITY_URL = `${CITIZEN_DEPENDANTS_URL}/children-disability`;
export const CITIZEN_COURT_ORDERS_URL = `${STATEMENT_OF_MEANS_URL}/court-orders`;
export const CITIZEN_PRIORITY_DEBTS_URL = `${STATEMENT_OF_MEANS_URL}/priority-debts`;
export const CITIZEN_DEBTS_URL = `${STATEMENT_OF_MEANS_URL}/debts`;
export const CITIZEN_MONTHLY_EXPENSES_URL = `${STATEMENT_OF_MEANS_URL}/monthly-expenses`;
export const CITIZEN_MONTHLY_INCOME_URL = `${STATEMENT_OF_MEANS_URL}/monthly-income`;
export const TOTAL_AMOUNT_CALCULATION_URL = '/total-income-expense-calculation';
export const CITIZEN_REPAYMENT_PLAN_FULL_URL = `${FULL_ADMISSION_URL}/payment-plan`;
export const CITIZEN_REPAYMENT_PLAN_PARTIAL_URL = `${PARTIAL_ADMISSION_URL}/payment-plan`;
export const CITIZEN_WHY_DO_YOU_DISAGREE_URL = `${PARTIAL_ADMISSION_URL}/why-do-you-disagree`;
export const CITIZEN_TIMELINE_URL = `${BASE_CASE_RESPONSE_URL}/timeline`;
export const CITIZEN_EVIDENCE_URL = `${BASE_CASE_RESPONSE_URL}/evidence`;
export const CITIZEN_CARER_URL = `${STATEMENT_OF_MEANS_URL}/carer`;
export const CITIZEN_EXPLANATION_URL = `${STATEMENT_OF_MEANS_URL}/explanation`;
export const CITIZEN_OWED_AMOUNT_URL = `${PARTIAL_ADMISSION_URL}/how-much-do-you-owe`;
export const CITIZEN_ALREADY_PAID_URL = `${PARTIAL_ADMISSION_URL}/already-paid`;
export const CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL = `${PARTIAL_ADMISSION_URL}/payment-option`;
export const CITIZEN_AMOUNT_YOU_PAID_URL = `${PARTIAL_ADMISSION_URL}/how-much-have-you-paid`;
export const MEDIATION_DISAGREEMENT_URL = `${MEDIATION_URL}/mediation-disagreement`;
export const DONT_WANT_FREE_MEDIATION_URL = `${MEDIATION_URL}/i-dont-want-free-mediation`;
export const CAN_WE_USE_URL = `${MEDIATION_URL}/can-we-use`;
export const CAN_WE_USE_COMPANY_URL = `${MEDIATION_URL}/can-we-use-company`;
export const CITIZEN_FREE_TELEPHONE_MEDIATION_URL = `${MEDIATION_URL}/free-telephone-mediation`;
export const CITIZEN_REJECT_ALL_CLAIM_URL = `${BASE_CASE_RESPONSE_URL}/reject-all-of-claim`;
export const CITIZEN_CONTACT_THEM_URL = `${DASHBOARD_URL}/:id/contact-them`;
export const RESPONSE_CHECK_ANSWERS_URL = `${BASE_CASE_RESPONSE_URL}/check-and-send`;
export const RESPONSE_YOUR_DEFENCE_URL = `${BASE_CASE_RESPONSE_URL}/your-defence`;
export const CITIZEN_FULL_REJECTION_YOU_PAID_LESS_URL = `${FULL_REJECTION_URL}/you-have-paid-less`;
export const CITIZEN_WHY_DO_YOU_DISAGREE_FULL_REJECTION_URL = `${FULL_REJECTION_URL}/why-do-you-disagree`;
export const RESPONSE_INCOMPLETE_SUBMISSION_URL = `${BASE_CASE_RESPONSE_URL}/incomplete-submission`;
export const CITIZEN_FR_AMOUNT_YOU_PAID_URL = `${FULL_REJECTION_URL}/how-much-have-you-paid`;
export const DEFENDANT_SUMMARY_URL = `${DASHBOARD_URL}/:id/defendant`;
export const EXPERT_GUIDANCE_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/expert-guidance`;
export const PERMISSION_FOR_EXPERT_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/permission-for-expert`;
export const SUPPORT_REQUIRED_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/support-required`;
export const CASE_TIMELINE_DOCUMENTS_URL = `${BASE_CASE_URL}/documents/timeline`;
export const CASE_DOCUMENT_DOWNLOAD_URL = `${BASE_CASE_URL}/documents/:documentType`;
export const VULNERABILITY_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/vulnerability`;
export const UNDERSTANDING_RESPONSE_OPTIONS_URL = `${BASE_CASE_RESPONSE_URL}/understanding-your-options`;
export const RESPONSE_DEADLINE_OPTIONS_URL = `${BASE_CASE_RESPONSE_URL}/response-deadline-options`;
export const AGREED_TO_MORE_TIME_URL = `${BASE_CASE_RESPONSE_URL}/agreed-to-more-time`;
export const REQUEST_MORE_TIME_URL = `${BASE_CASE_RESPONSE_URL}/request-more-time`;
export const NEW_RESPONSE_DEADLINE_URL = `${BASE_CASE_RESPONSE_URL}/new-response-deadline`;
export const DETERMINATION_WITHOUT_HEARING_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/determination-without-hearing`;
export const ELIGIBILITY_CLAIM_VALUE_URL = `${BASE_ELIGIBILITY_URL}/claim-value`;
export const ELIGIBILITY_SINGLE_DEFENDANT_URL = `${BASE_ELIGIBILITY_URL}/single-defendant`;
export const ELIGIBILITY_CLAIMANT_ADDRESS_URL = `${BASE_ELIGIBILITY_URL}/claimant-address`;
export const NOT_ELIGIBLE_FOR_THIS_SERVICE_URL = `${BASE_ELIGIBILITY_URL}/not-eligible`;
export const ELIGIBILITY_DEFENDANT_ADDRESS_URL = `${BASE_ELIGIBILITY_URL}/defendant-address`;
export const ELIGIBILITY_TENANCY_DEPOSIT_URL = `${BASE_ELIGIBILITY_URL}/claim-is-for-tenancy-deposit`;
export const ELIGIBILITY_CLAIM_TYPE_URL = `${BASE_ELIGIBILITY_URL}/claim-type`;
export const ELIGIBILITY_GOVERNMENT_DEPARTMENT_URL = `${BASE_ELIGIBILITY_URL}/government-department`;
export const ELIGIBILITY_HELP_WITH_FEES_URL = `${BASE_ELIGIBILITY_URL}/help-with-fees`;
export const ELIGIBILITY_INFORMATION_ABOUT_HELP_WITH_FEES_URL = `${BASE_ELIGIBILITY_URL}/information-about-help-with-fees`;
export const ELIGIBILITY_DEFENDANT_AGE_URL = `${BASE_ELIGIBILITY_URL}/defendant-age`;
export const ELIGIBILITY_APPLY_HELP_WITH_FEES_URL = `${BASE_ELIGIBILITY_URL}/apply-for-help-with-fees`;
export const ELIGIBILITY_HELP_WITH_FEES_REFERENCE_URL = `${BASE_ELIGIBILITY_URL}/help-with-fees-reference`;
export const ELIGIBILITY_HWF_ELIGIBLE_REFERENCE_URL = `${BASE_ELIGIBILITY_URL}/hwf-eligible-reference`;
export const ELIGIBILITY_HWF_ELIGIBLE_URL = `${BASE_ELIGIBILITY_URL}/hwf-eligible`;
export const ELIGIBILITY_CLAIMANT_AGE_URL = `${BASE_ELIGIBILITY_URL}/over-18`;
export const ELIGIBILITY_INFORMATION_FEES_URL = `${BASE_ELIGIBILITY_URL}/information-about-help-with-fees`;
export const ELIGIBILITY_APPLY_HELP_FEES_URL = `${BASE_ELIGIBILITY_URL}/apply-for-help-with-fees`;
export const ELIGIBLE_FOR_THIS_SERVICE_URL = `${BASE_ELIGIBILITY_URL}/eligible`;
export const FIRST_CONTACT_SIGNPOSTING_URL = `${BASE_FIRST_CONTACT_URL}/start`;
export const FIRST_CONTACT_CLAIM_REFERENCE_URL = `${BASE_FIRST_CONTACT_URL}/claim-reference`;
export const FIRST_CONTACT_CLAIM_SUMMARY_URL = `${BASE_FIRST_CONTACT_URL}/claim-summary`;
export const CLAIM_CLAIMANT_INDIVIDUAL_DETAILS_URL = `${BASE_CLAIM_URL}/claimant-individual-details`;
export const CLAIM_COMPLETING_CLAIM_URL = `${BASE_CLAIM_URL}/completing-claim`;
export const CLAIMANT_COMPANY_DETAILS_URL = `${BASE_CLAIM_URL}/claimant-company-details`;
export const CLAIMANT_DEFENDANT_EMAIL_URL = `${BASE_CLAIM_URL}/defendant-email`;
export const CLAIMANT_DEFENDANT_MOBILE_URL = `${BASE_CLAIM_URL}/defendant-mobile`;
export const CLAIMANT_DOB_URL = `${BASE_CLAIM_URL}/claimant-dob`;
export const CLAIMANT_INDIVIDUAL_DETAILS_URL = `${BASE_CLAIM_URL}/claimant-individual-details`;
export const CLAIMANT_ORGANISATION_DETAILS_URL = `${BASE_CLAIM_URL}/claimant-organisation-details`;
export const CLAIMANT_PARTY_TYPE_SELECTION_URL = `${BASE_CLAIM_URL}/claimant-party-type-selection`;
export const CLAIMANT_PHONE_NUMBER_URL = `${BASE_CLAIM_URL}/claimant-phone-number`;
export const CLAIMANT_SOLE_TRADER_DETAILS_URL = `${BASE_CLAIM_URL}/claimant-sole-trader-details`;
export const FIRST_CONTACT_ACCESS_DENIED_URL = `${BASE_FIRST_CONTACT_URL}/access-denied`;
export const FIRST_CONTACT_PIN_URL = `${BASE_FIRST_CONTACT_URL}/pin`;
export const CLAIM_RESOLVING_DISPUTE_URL = `${BASE_CLAIM_URL}/resolving-this-dispute`;
export const DQ_CONSIDER_CLAIMANT_DOCUMENTS_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/consider-claimant-documents`;
export const DQ_DEFENDANT_EXPERT_EVIDENCE_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/defendant-expert-evidence`;
export const DQ_DEFENDANT_EXPERT_REPORTS_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/defendant-expert-reports`;
export const DQ_DEFENDANT_WITNESSES_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/defendant-witnesses`;
export const DQ_EXPERT_DETAILS_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/expert-details`;
export const DQ_EXPERT_EXAMINATION_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/expert-examination`;
export const DQ_GIVE_EVIDENCE_YOURSELF_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/give-evidence-yourself`;
export const DQ_REQUEST_EXTRA_4WEEKS_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/request-extra-4-weeks`;
export const DQ_EXPERT_SMALL_CLAIMS_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/expert`;
export const DQ_EXPERT_REPORT_DETAILS_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/expert-report-details`;
export const DQ_SHARE_AN_EXPERT_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/shared-expert`;
export const DQ_TRIED_TO_SETTLE_CLAIM_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/tried-to-settle`;
export const DQ_DEFENDANT_CAN_STILL_EXAMINE_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/defendant-expert-can-still-examine`;
export const DQ_SENT_EXPERT_REPORTS_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/sent-expert-reports`;
export const DQ_OTHER_WITNESSES_AVAILABILITY_DATES_FOR_HEARING_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/availability-dates`;
export const DQ_EXPERT_GUIDANCE_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/expert-guidance`;
export const DQ_PHONE_OR_VIDEO_HEARING_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/phone-or-video-hearing`;
