const BASE_CASE_URL = '/case/:id';
export const BASE_CLAIM_URL = '/claim';
export const BASE_ELIGIBILITY_URL = '/eligibility';
export const BASE_FIRST_CONTACT_URL = '/first-contact';
export const BASE_GENERAL_APPLICATION_URL = `${BASE_CASE_URL}/general-application`;
const BASE_COSC_URL = `${BASE_GENERAL_APPLICATION_URL}/cosc`;
export const APPLICATION_TYPE_URL = `${BASE_GENERAL_APPLICATION_URL}/application-type`;
export const GA_CLAIM_APPLICATION_COST_URL = `${BASE_GENERAL_APPLICATION_URL}/claim-application-cost`;
export const PAYING_FOR_APPLICATION_URL = `${BASE_GENERAL_APPLICATION_URL}/paying-for-application`;
export const ORDER_JUDGE_URL = `${BASE_GENERAL_APPLICATION_URL}/order-judge`;
const BASE_CASE_RESPONSE_URL = `${BASE_CASE_URL}/response`;
const BASE_CASE_PAID_IN_FULL_URL = `${BASE_CASE_URL}/paid-in-full`;
const BASE_JUDGMENT_ONLINE_URL = `${BASE_CASE_URL}/judgment-online`;
export const BASE_CASE_PROGRESSION_URL = `${BASE_CASE_URL}/case-progression`;
export const BASE_CLAIMANT_RESPONSE_URL = `${BASE_CASE_URL}/claimant-response`;
const BASE_CCJ_URL = `${BASE_CASE_URL}/ccj`;
const BASE_SETTLEMENT_AGREEMENT_URL = `${BASE_CASE_URL}/settlement-agreement`;
export const STATEMENT_OF_MEANS_URL = `${BASE_CASE_RESPONSE_URL}/statement-of-means`;
const MEDIATION_URL = `${BASE_CASE_URL}/mediation`;
const DIRECTIONS_QUESTIONNAIRE_URL = `${BASE_CASE_URL}/directions-questionnaire`;
const FULL_REJECTION_URL = `${BASE_CASE_RESPONSE_URL}/full-rejection`;
const PARTIAL_ADMISSION_URL = `${BASE_CASE_RESPONSE_URL}/partial-admission`;
const FULL_ADMISSION_URL = `${BASE_CASE_RESPONSE_URL}/full-admission`;
export const BASE_GENERAL_APPLICATION_RESPONSE_URL = `${BASE_CASE_RESPONSE_URL}/general-application/:appId`;
export const DATE_PAID_URL = `${BASE_CASE_PAID_IN_FULL_URL}/date-paid`;
export const DATE_PAID_CONFIRMATION_URL = `${BASE_CASE_PAID_IN_FULL_URL}/confirmation`;
export const CALLBACK_URL = '/oauth2/callback';
export const ASSIGN_CLAIM_URL='/assignclaim';
export const COOKIES_URL = '/cookies';
export const SIGN_IN_URL = '/login';
export const SIGN_OUT_URL = '/logout';
export const DASHBOARD_URL = '/dashboard';
export const DASHBOARD_CLAIMANT_URL = `${DASHBOARD_URL}/:id/claimantNewDesign`;
export const OLD_DASHBOARD_CLAIMANT_URL = `${DASHBOARD_URL}/:id/claimant`;
export const CITIZEN_PHONE_NUMBER_URL = `${BASE_CASE_RESPONSE_URL}/your-phone`;
export const ROOT_URL = '/';
export const HOME_URL = '/home';
export const ACCESSIBILITY_STATEMENT_URL = '/accessibility-statement';
export const CONTACT_US_URL = '/contact-us';
export const TERMS_AND_CONDITIONS_URL = '/terms-and-conditions';
export const PRIVACY_POLICY_URL = '/privacy-policy';
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
export const CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL = `${BASE_CLAIMANT_RESPONSE_URL}/defendants-response`;
export const ON_TAX_PAYMENTS_URL = `${CITIZEN_SELF_EMPLOYED_URL}/on-tax-payments`;
export const FINANCIAL_DETAILS_URL = `${STATEMENT_OF_MEANS_URL}/intro`;
export const RESPONSE_TASK_LIST_URL = `${BASE_CASE_RESPONSE_URL}/task-list`;
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
export const MEDIATION_CONTACT_PERSON_CONFIRMATION_URL = `${MEDIATION_URL}/mediation-contact-person`;
export const MEDIATION_ALTERNATIVE_CONTACT_PERSON_URL = `${MEDIATION_URL}/alternative-contact-person`;
export const MEDIATION_ALTERNATIVE_EMAIL_URL = `${MEDIATION_URL}/alternative-email`;
export const MEDIATION_ALTERNATIVE_PHONE_URL = `${MEDIATION_URL}/alternative-phone`;
export const MEDIATION_CLAIMANT_PHONE_URL = `${MEDIATION_URL}/claimant-phone`;
export const MEDIATION_NEXT_3_MONTHS_URL = `${MEDIATION_URL}/next-three-months`;
export const DONT_WANT_FREE_MEDIATION_URL = `${MEDIATION_URL}/i-dont-want-free-mediation`;
export const CAN_WE_USE_URL = `${MEDIATION_URL}/can-we-use`;
export const CAN_WE_USE_COMPANY_URL = `${MEDIATION_URL}/can-we-use-company`;
export const CITIZEN_FREE_TELEPHONE_MEDIATION_URL = `${MEDIATION_URL}/free-telephone-mediation`;
export const TELEPHONE_MEDIATION_URL = `${MEDIATION_URL}/telephone-mediation`;
export const AVAILABILITY_FOR_MEDIATION = `${BASE_CASE_RESPONSE_URL}/availability-for-mediation`;
export const MAKE_CLAIM = '/make-claim';
export const MEDIATION_DATES_CONFIRMATION_URL = `${MEDIATION_URL}/dates-confirmation`;
export const MEDIATION_EMAIL_CONFIRMATION_URL = `${MEDIATION_URL}/email-confirmation`;
export const MEDIATION_PHONE_CONFIRMATION_URL = `${MEDIATION_URL}/phone-confirmation`;
export const MEDIATION_UNAVAILABLE_SELECT_DATES_URL = `${MEDIATION_URL}/unavailable-dates`;
export const CITIZEN_REJECT_ALL_CLAIM_URL = `${BASE_CASE_RESPONSE_URL}/reject-all-of-claim`;
export const CITIZEN_CONTACT_THEM_URL = `${DASHBOARD_URL}/:id/contact-them`;
export const RESPONSE_CHECK_ANSWERS_URL = `${BASE_CASE_RESPONSE_URL}/check-and-send`;
export const RESPONSE_YOUR_DEFENCE_URL = `${BASE_CASE_RESPONSE_URL}/your-defence`;
export const CITIZEN_FULL_REJECTION_YOU_PAID_LESS_URL = `${FULL_REJECTION_URL}/you-have-paid-less`;
export const CITIZEN_WHY_DO_YOU_DISAGREE_FULL_REJECTION_URL = `${FULL_REJECTION_URL}/why-do-you-disagree`;
export const RESPONSE_INCOMPLETE_SUBMISSION_URL = `${BASE_CASE_RESPONSE_URL}/incomplete-submission`;
export const CITIZEN_FR_AMOUNT_YOU_PAID_URL = `${FULL_REJECTION_URL}/how-much-have-you-paid`;
export const DEFENDANT_SUMMARY_URL = `${DASHBOARD_URL}/:id/defendant`;
export const DEFENDANT_DOCUMENTS_URL = `${DEFENDANT_SUMMARY_URL}#documents`;
export const BILINGUAL_LANGUAGE_PREFERENCE_URL = `${BASE_CASE_RESPONSE_URL}/bilingual-language-preference`;
export const CLAIM_BILINGUAL_LANGUAGE_PREFERENCE_URL = `${BASE_CLAIM_URL}/bilingual-language-preference`;
export const EXPERT_GUIDANCE_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/expert-guidance`;
export const PERMISSION_FOR_EXPERT_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/permission-for-expert`;
export const SUPPORT_REQUIRED_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/support-required`;
export const CASE_TIMELINE_DOCUMENTS_URL = `${BASE_CASE_URL}/documents/timeline/:documentId`;
export const CASE_DOCUMENT_DOWNLOAD_URL = `${BASE_CASE_URL}/documents/:documentId`;
export const CASE_DOCUMENT_VIEW_URL = `${BASE_CASE_URL}/view-documents/:documentId`;
export const VULNERABILITY_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/vulnerability`;
export const UNDERSTANDING_RESPONSE_OPTIONS_URL = `${BASE_CASE_RESPONSE_URL}/understanding-your-options`;
export const RESPONSE_DEADLINE_OPTIONS_URL = `${BASE_CASE_RESPONSE_URL}/response-deadline-options`;
export const AGREED_TO_MORE_TIME_URL = `${BASE_CASE_RESPONSE_URL}/agreed-to-more-time`;
export const REQUEST_MORE_TIME_URL = `${BASE_CASE_RESPONSE_URL}/request-more-time`;
export const NEW_RESPONSE_DEADLINE_URL = `${BASE_CASE_RESPONSE_URL}/new-response-deadline`;
export const DETERMINATION_WITHOUT_HEARING_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/determination-without-hearing`;
export const ELIGIBILITY_CLAIM_VALUE_URL = `${BASE_ELIGIBILITY_URL}/claim-value`;
export const ELIGIBILITY_KNOWN_CLAIM_AMOUNT_URL = `${BASE_ELIGIBILITY_URL}/known-claim-amount`;
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
export const FIRST_CONTACT_ACCESS_DENIED_URL = `${BASE_FIRST_CONTACT_URL}/access-denied`;
export const FIRST_CONTACT_PIN_URL = `${BASE_FIRST_CONTACT_URL}/pin`;
export const DQ_CONSIDER_CLAIMANT_DOCUMENTS_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/consider-claimant-documents`;
export const DQ_COURT_LOCATION_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/court-location`;
export const DQ_DEFENDANT_EXPERT_EVIDENCE_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/expert-evidence`;
export const DQ_DEFENDANT_WITNESSES_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/other-witnesses`;
export const DQ_CONFIRM_YOUR_DETAILS_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/confirm-your-details`;
export const DQ_EXPERT_DETAILS_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/expert-details`;
export const DQ_EXPERT_EXAMINATION_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/expert-examination`;
export const DQ_GIVE_EVIDENCE_YOURSELF_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/give-evidence-yourself`;
export const DQ_REQUEST_EXTRA_4WEEKS_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/request-extra-4-weeks`;
export const DQ_EXPERT_SMALL_CLAIMS_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/expert`;
export const DQ_EXPERT_REPORT_DETAILS_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/expert-report-details`;
export const DQ_SHARE_AN_EXPERT_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/shared-expert`;
export const DQ_TRIED_TO_SETTLE_CLAIM_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/tried-to-settle`;
export const DQ_EXPERT_CAN_STILL_EXAMINE_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/expert-can-still-examine`;
export const DQ_SENT_EXPERT_REPORTS_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/sent-expert-reports`;
export const DQ_AVAILABILITY_DATES_FOR_HEARING_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/availability-dates`;
export const DQ_EXPERT_GUIDANCE_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/expert-guidance`;
export const DQ_WELSH_LANGUAGE_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/welsh-language`;
export const DQ_UNAVAILABLE_FOR_HEARING_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/unavailable-for-hearing`;
export const DQ_PHONE_OR_VIDEO_HEARING_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/phone-or-video-hearing`;
export const DQ_NEXT_12MONTHS_CAN_NOT_HEARING_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/cant-attend-hearing-in-next-12-months`;
export const CLAIM_EVIDENCE_URL = `${BASE_CLAIM_URL}/evidence`;
export const CLAIM_FEE_URL = `${BASE_CLAIM_URL}/:id/pay-fees`;
export const CLAIM_FEE_BREAKUP = `${BASE_CLAIM_URL}/:id/fee`;
export const CLAIM_AMOUNT_URL = `${BASE_CLAIM_URL}/amount`;
export const CLAIM_HELP_WITH_FEES_URL = `${BASE_CLAIM_URL}/help-with-fees`;
export const CLAIM_HELP_WITH_FEES_REFERENCE_URL = `${BASE_CLAIM_URL}/help-with-fees-reference`;
export const CLAIM_TOTAL_URL = `${BASE_CLAIM_URL}/total`;
export const CLAIM_INTEREST_URL = `${BASE_CLAIM_URL}/interest`;
export const CLAIM_INTEREST_TYPE_URL = `${BASE_CLAIM_URL}/interest-type`;
export const CLAIM_INTEREST_RATE_URL = `${BASE_CLAIM_URL}/interest-rate`;
export const CLAIM_INTEREST_TOTAL_URL = `${BASE_CLAIM_URL}/interest-total`;
export const CLAIM_INTEREST_DATE_URL = `${BASE_CLAIM_URL}/interest-date`;
export const CLAIM_INTEREST_START_DATE_URL = `${BASE_CLAIM_URL}/interest-start-date`;
export const CLAIM_INTEREST_END_DATE_URL = `${BASE_CLAIM_URL}/interest-end-date`;
export const CLAIM_INTEREST_CONTINUE_CLAIMING_URL = `${BASE_CLAIM_URL}/interest-continue-claiming`;
export const CLAIM_INTEREST_HOW_MUCH_URL = `${BASE_CLAIM_URL}/interest-how-much`;
export const CLAIM_CHECK_ANSWERS_URL = `${BASE_CLAIM_URL}/check-and-send`;
export const TESTING_SUPPORT_URL = '/testing-support/create-draft-claim';
export const CLAIM_FEE_CHANGE_URL = `${BASE_CLAIM_URL}/:id/fee-change`;
export const CLAIM_CONFIRMATION_URL = `${BASE_CLAIM_URL}/:id/confirmation`;
export const CLAIM_INCOMPLETE_SUBMISSION_URL = `${BASE_CLAIM_URL}/incomplete-submission`;
export const CLAIM_REASON_URL = `${BASE_CLAIM_URL}/reason`;
export const CLAIM_TIMELINE_URL = `${BASE_CLAIM_URL}/timeline`;
export const CLAIM_COMPLETING_CLAIM_URL = `${BASE_CLAIM_URL}/completing-claim`;
export const CLAIM_DEFENDANT_COMPANY_DETAILS_URL = `${BASE_CLAIM_URL}/defendant-company-details`;
export const CLAIM_DEFENDANT_EMAIL_URL = `${BASE_CLAIM_URL}/defendant-email`;
export const CLAIM_DEFENDANT_INDIVIDUAL_DETAILS_URL = `${BASE_CLAIM_URL}/defendant-individual-details`;
export const CLAIM_DEFENDANT_ORGANISATION_DETAILS_URL = `${BASE_CLAIM_URL}/defendant-organisation-details`;
export const CLAIM_DEFENDANT_PARTY_TYPE_URL = `${BASE_CLAIM_URL}/defendant-party-type-selection`;
export const CLAIM_DEFENDANT_PHONE_NUMBER_URL = `${BASE_CLAIM_URL}/defendant-mobile`;
export const CLAIM_DEFENDANT_SOLE_TRADER_DETAILS_URL = `${BASE_CLAIM_URL}/defendant-sole-trader-details`;
export const CLAIM_RESOLVING_DISPUTE_URL = `${BASE_CLAIM_URL}/resolving-this-dispute`;
export const CLAIMANT_INDIVIDUAL_DETAILS_URL = `${BASE_CLAIM_URL}/claimant-individual-details`;
export const CLAIMANT_COMPANY_DETAILS_URL = `${BASE_CLAIM_URL}/claimant-company-details`;
export const CLAIMANT_DOB_URL = `${BASE_CLAIM_URL}/claimant-dob`;
export const CLAIMANT_ORGANISATION_DETAILS_URL = `${BASE_CLAIM_URL}/claimant-organisation-details`;
export const CLAIMANT_TASK_LIST_URL = `${BASE_CLAIM_URL}/task-list`;
export const CLAIMANT_PARTY_TYPE_SELECTION_URL = `${BASE_CLAIM_URL}/claimant-party-type-selection`;
export const CLAIMANT_PHONE_NUMBER_URL = `${BASE_CLAIM_URL}/claimant-phone`;
export const CLAIMANT_SOLE_TRADER_DETAILS_URL = `${BASE_CLAIM_URL}/claimant-sole-trader-details`;
export const CLAIMANT_INTEREST_RATE_URL = `${BASE_CLAIM_URL}/interest-rate`;
export const CLAIMANT_INTEREST_DATE_URL = `${BASE_CLAIM_URL}/interest-date`;
export const DELAYED_FLIGHT_URL = `${BASE_CLAIM_URL}/delayed-flight`;
export const FLIGHT_DETAILS_URL = `${BASE_CLAIM_URL}/flight-details`;
export const CLAIMANT_RESPONSE_ACCEPT_REPAYMENT_PLAN_URL = `${BASE_CLAIMANT_RESPONSE_URL}/accept-payment-method`;
export const CLAIMANT_RESPONSE_SETTLE_CLAIM_URL = `${BASE_CLAIMANT_RESPONSE_URL}/settle-claim`;
export const CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL = `${BASE_CLAIMANT_RESPONSE_URL}/settle-admitted`;
export const CLAIMANT_RESPONSE_REJECTION_REASON_URL = `${BASE_CLAIMANT_RESPONSE_URL}/rejection-reason`;
export const CLAIMANT_RESPONSE_INTENTION_TO_PROCEED_URL = `${BASE_CLAIMANT_RESPONSE_URL}/intention-to-proceed`;
export const CLAIMANT_RESPONSE_PART_PAYMENT_RECEIVED_URL = `${BASE_CLAIMANT_RESPONSE_URL}/part-payment-received`;
export const CLAIMANT_RESPONSE_CHOOSE_HOW_TO_PROCEED_URL = `${BASE_CLAIMANT_RESPONSE_URL}/choose-how-to-proceed`;
export const CLAIMANT_SIGN_SETTLEMENT_AGREEMENT = `${BASE_CLAIMANT_RESPONSE_URL}/sign-settlement-agreement`;
export const CLAIMANT_RESPONSE_REPAYMENT_PLAN_ACCEPTED_URL = `${BASE_CLAIMANT_RESPONSE_URL}/counter-offer-accepted`;
export const CLAIMANT_RESPONSE_COURT_OFFERED_INSTALMENTS_URL = `${BASE_CLAIMANT_RESPONSE_URL}/court-offered-instalments`;
export const CLAIMANT_RESPONSE_TASK_LIST_URL = `${BASE_CLAIMANT_RESPONSE_URL}/task-list`;
export const CLAIMANT_RESPONSE_COURT_OFFERED_SET_DATE_URL = `${BASE_CLAIMANT_RESPONSE_URL}/court-offered-set-date`;
export const CLAIMANT_RESPONSE_CONFIRMATION_URL = `${BASE_CLAIMANT_RESPONSE_URL}/confirmation`;
export const CLAIMANT_RESPONSE_CHECK_ANSWERS_URL = `${BASE_CLAIMANT_RESPONSE_URL}/check-and-send`;
export const CLAIMANT_RESPONSE_PAYMENT_OPTION_URL = `${BASE_CLAIMANT_RESPONSE_URL}/payment-option`;
export const CLAIMANT_RESPONSE_PAYMENT_DATE_URL = `${BASE_CLAIMANT_RESPONSE_URL}/payment-date`;
export const CLAIMANT_RESPONSE_PAYMENT_PLAN_URL = `${BASE_CLAIMANT_RESPONSE_URL}/payment-plan`;
export const CLAIMANT_RESPONSE_INCOMPLETE_SUBMISSION_URL = `${BASE_CLAIMANT_RESPONSE_URL}/incomplete-submission`;
export const CCJ_CHECK_AND_SEND_URL = `${BASE_CCJ_URL}/check-and-send`;
export const CCJ_DEFENDANT_DOB_URL = `${BASE_CCJ_URL}/date-of-birth`;
export const CCJ_PAID_AMOUNT_URL = `${BASE_CCJ_URL}/paid-amount`;
export const CCJ_REPAYMENT_PLAN_INSTALMENTS_URL = `${BASE_CCJ_URL}/repayment-plan`;
export const CCJ_PAYMENT_OPTIONS_URL = `${BASE_CCJ_URL}/payment-options`;
export const CCJ_CONFIRMATION_URL = `${BASE_CCJ_URL}/confirmation-ccj`;
export const CCJ_PAID_AMOUNT_SUMMARY_URL = `${BASE_CCJ_URL}/paid-amount-summary`;
export const CCJ_DEFENDANT_PAYMENT_DATE_URL = `${BASE_CCJ_URL}/pay-by-set-date`;
export const CCJ_REPAYMENT_PLAN_CLAIMANT_URL = `${BASE_CCJ_URL}/repayment-plan-summary/CLAIMANT`;
export const CCJ_REPAYMENT_PLAN_DEFENDANT_URL = `${BASE_CCJ_URL}/repayment-plan-summary/DEFENDANT`;
export const CCJ_EXTENDED_PAID_AMOUNT_URL = `${BASE_CLAIMANT_RESPONSE_URL}/county-court-judgement/paid-amount`;
export const CCJ_EXTENDED_PAID_AMOUNT_SUMMARY_URL = `${BASE_CLAIMANT_RESPONSE_URL}/county-court-judgement/paid-amount-summary`;
export const CP_UPLOAD_DOCUMENTS_URL = `${BASE_CASE_PROGRESSION_URL}/upload-documents`;
export const CP_EVIDENCE_UPLOAD_CANCEL = `${BASE_CASE_PROGRESSION_URL}/cancel-document-upload`;
export const TYPES_OF_DOCUMENTS_URL = `${BASE_CASE_PROGRESSION_URL}/type-of-documents`;
export const UPLOAD_YOUR_DOCUMENTS_URL = `${BASE_CASE_PROGRESSION_URL}/upload-your-documents`;
export const CP_CHECK_ANSWERS_URL = `${BASE_CASE_PROGRESSION_URL}/check-and-send`;
export const CP_EVIDENCE_UPLOAD_SUBMISSION_URL = `${BASE_CASE_PROGRESSION_URL}/documents-uploaded`;
export const DEFENDANT_SUMMARY_TAB_URL = `${DASHBOARD_URL}/:id/defendant#:tab`;
export const DEFENDANT_SIGN_SETTLEMENT_AGREEMENT = `${BASE_SETTLEMENT_AGREEMENT_URL}/sign-settlement-agreement`;
export const DEFENDANT_SIGN_SETTLEMENT_AGREEMENT_CONFIRMATION = `${BASE_SETTLEMENT_AGREEMENT_URL}/confirmation`;
export const CP_FINALISE_TRIAL_ARRANGEMENTS_URL = `${BASE_CASE_PROGRESSION_URL}/finalise-trial-arrangements`;
export const IS_CASE_READY_URL = `${CP_FINALISE_TRIAL_ARRANGEMENTS_URL}/is-case-ready`;
export const INFORM_OTHER_PARTIES_URL = `${BASE_GENERAL_APPLICATION_URL}/inform-other-parties`;
export const TRIAL_ARRANGEMENTS_HEARING_DURATION= `${CP_FINALISE_TRIAL_ARRANGEMENTS_URL}/hearing-duration-other-info`;
export const TRIAL_ARRANGEMENTS_CHECK_YOUR_ANSWERS= `${CP_FINALISE_TRIAL_ARRANGEMENTS_URL}/check-trial-arrangements`;
export const HAS_ANYTHING_CHANGED_URL = `${CP_FINALISE_TRIAL_ARRANGEMENTS_URL}/has-anything-changed`;
export const CP_FINALISE_TRIAL_ARRANGEMENTS_CONFIRMATION_URL = `${CP_FINALISE_TRIAL_ARRANGEMENTS_URL}/confirmation`;
export const MAKE_APPLICATION_TO_COURT = 'https://www.gov.uk/government/publications/form-n244-application-notice';
export const CANCEL_TRIAL_ARRANGEMENTS= `${CP_FINALISE_TRIAL_ARRANGEMENTS_URL}/cancel`;
export const PAY_HEARING_FEE_URL = `${BASE_CASE_PROGRESSION_URL}/pay-hearing-fee`;
export const HEARING_FEE_APPLY_HELP_FEE_SELECTION = `${PAY_HEARING_FEE_URL}/apply-help-fee-selection`;
export const HEARING_FEE_CANCEL_JOURNEY = `${PAY_HEARING_FEE_URL}/cancel`;
export const HEARING_FEE_PAYMENT_CREATION = `${BASE_CASE_PROGRESSION_URL}/payment-creation`;
export const APPLY_HELP_WITH_FEES = `${BASE_CASE_PROGRESSION_URL}/apply-help-with-fees`;
export const APPLY_HELP_WITH_FEES_START = `${APPLY_HELP_WITH_FEES}/start`;
export const APPLY_HELP_WITH_FEES_REFERENCE = `${APPLY_HELP_WITH_FEES}/reference-number`;
export const HEARING_FEE_CONFIRMATION_URL = `${PAY_HEARING_FEE_URL}/confirmation`;
export const HEARING_FEE_MAKE_PAYMENT_AGAIN_URL = `${BASE_CASE_PROGRESSION_URL}/make-payment-again`;
export const HEARING_FEE_PAYMENT_CONFIRMATION_URL='/hearing-payment-confirmation/:id';
export const HEARING_FEE_PAYMENT_CONFIRMATION_URL_WITH_UNIQUE_ID='/hearing-payment-confirmation/:id/:uniqueId/confirmation';
export const PAY_HEARING_FEE_SUCCESSFUL_URL = `${BASE_CASE_PROGRESSION_URL}/payment-successful`;
export const HELP_WITH_FEES_ELIGIBILITY = 'https://www.gov.uk/get-help-with-court-fees#eligibility';
export const CLAIM_FEE_PAYMENT_CONFIRMATION_URL='/claim-issued-payment-confirmation/:id';
export const CLAIM_FEE_PAYMENT_CONFIRMATION_URL_WITH_UNIQUE_ID='/claim-issued-payment-confirmation/:id/:uniqueId/confirmation';
export const CLAIM_FEE_MAKE_PAYMENT_AGAIN_URL = `${BASE_CASE_URL}/make-payment-again`;
export const PAY_CLAIM_FEE_SUCCESSFUL_URL = `${BASE_CASE_URL}/payment-successful`;
export const PAY_CLAIM_FEE_UNSUCCESSFUL_URL = `${BASE_CASE_URL}/payment-unsuccessful`;
export const PAY_HEARING_FEE_UNSUCCESSFUL_URL = `${BASE_CASE_PROGRESSION_URL}/payment-unsuccessful`;
export const GENERIC_HELP_FEES_URL = 'https://www.gov.uk/get-help-with-court-fees';
export const START_MEDIATION_UPLOAD_FILES = `${MEDIATION_URL}/start-upload-documents`;
export const MEDIATION_TYPE_OF_DOCUMENTS = `${MEDIATION_URL}/type-of-documents`;
export const MEDIATION_UPLOAD_DOCUMENTS = `${MEDIATION_URL}/upload-documents`;
export const MEDIATION_UPLOAD_DOCUMENTS_CHECK_AND_SEND = `${MEDIATION_URL}/check-and-send`;
export const MEDIATION_UPLOAD_DOCUMENTS_CONFIRMATION = `${MEDIATION_URL}/confirmation`;
export const DASHBOARD_NOTIFICATION_REDIRECT = '/notification/:notificationId/redirect/:locationName/:id';
export const MEDIATION_SERVICE_EXTERNAL = 'https://www.gov.uk/guidance/small-claims-mediation-service';
export const BUNDLES_URL = `${BASE_CASE_URL}/bundle-overview`;
export const VIEW_MEDIATION_SETTLEMENT_AGREEMENT_DOCUMENT = `${MEDIATION_URL}/view-mediation-settlement-agreement-document`;
export const VIEW_DEFENDANT_INFO = `${DASHBOARD_URL}/:id/information-defendant`;
export const VIEW_CLAIMANT_INFO = `${DASHBOARD_URL}/:id/information-claimant`;
export const DASHBOARD_NOTIFICATION_REDIRECT_DOCUMENT = '/notification/:notificationId/redirectDocument/:locationName/:id/:documentId';
export const CANCEL_URL = `${BASE_CASE_URL}/:propertyName/cancel`;
export const BACK_URL = '/back';
export const EVIDENCE_UPLOAD_DOCUMENTS_URL = `${BASE_CASE_URL}/evidence-upload-documents`;
export const VIEW_THE_HEARING_URL = `${BASE_CASE_URL}/view-the-hearing`;
export const VIEW_ORDERS_AND_NOTICES_URL = `${BASE_CASE_URL}/view-orders-and-notices`;
export const VIEW_RESPONSE_TO_CLAIM = `${BASE_CASE_URL}/view-response-to-claim`;
export const VIEW_MEDIATION_DOCUMENTS = `${MEDIATION_URL}/view-mediation-documents`;
export const GA_HEARING_SUPPORT_URL = `${BASE_GENERAL_APPLICATION_URL}/hearing-support`;
export const GA_AGREEMENT_FROM_OTHER_PARTY_URL = `${BASE_GENERAL_APPLICATION_URL}/agreement-from-other-party`;
export const GA_PAYMENT_SUCCESSFUL_URL = `${BASE_GENERAL_APPLICATION_URL}/:appId/payment-successful`;
export const GA_AGREE_TO_ORDER_URL = `${BASE_GENERAL_APPLICATION_RESPONSE_URL}/agree-to-order`;
export const GA_PAYMENT_UNSUCCESSFUL_URL = `${BASE_GENERAL_APPLICATION_URL}/:appId/payment-unsuccessful`;
export const GA_APPLICATION_COSTS_URL = `${BASE_GENERAL_APPLICATION_URL}/application-costs`;
export const GA_REQUESTING_REASON_URL = `${BASE_GENERAL_APPLICATION_URL}/requesting-reason`;
export const GA_ADD_ANOTHER_APPLICATION_URL = `${BASE_GENERAL_APPLICATION_URL}/add-another-application`;
export const REQUEST_FOR_RECONSIDERATION_URL = `${BASE_CASE_PROGRESSION_URL}/request-for-reconsideration`;
export const REQUEST_FOR_RECONSIDERATION_CYA_URL = `${REQUEST_FOR_RECONSIDERATION_URL}/check-your-answers`;
export const REQUEST_FOR_RECONSIDERATION_CONFIRMATION_URL = `${REQUEST_FOR_RECONSIDERATION_URL}/confirmation`;
export const REQUEST_FOR_RECONSIDERATION_CANCEL_URL = `${REQUEST_FOR_RECONSIDERATION_URL}/:propertyName/cancel`;
export const REQUEST_FOR_RECONSIDERATION_COMMENTS_URL = `${BASE_CASE_PROGRESSION_URL}/comments-for-reconsideration`;
export const REQUEST_FOR_RECONSIDERATION_COMMENTS_CYA_URL = `${REQUEST_FOR_RECONSIDERATION_COMMENTS_URL}/check-your-answers`;
export const REQUEST_FOR_RECONSIDERATION_COMMENTS_CONFIRMATION_URL = `${REQUEST_FOR_RECONSIDERATION_COMMENTS_URL}/confirmation`;
export const GA_UPLOAD_N245_FORM_URL = `${BASE_GENERAL_APPLICATION_URL}/upload-n245-form`;
export const GA_UNAVAILABLE_HEARING_DATES_URL = `${BASE_GENERAL_APPLICATION_URL}/unavailable-dates`;
export const GA_HEARING_ARRANGEMENT_URL = `${BASE_GENERAL_APPLICATION_URL}/hearing-arrangement`;
export const GA_HEARING_CONTACT_DETAILS_URL = `${BASE_GENERAL_APPLICATION_URL}/hearing-contact-details`;
export const GA_CHECK_ANSWERS_URL = `${BASE_GENERAL_APPLICATION_URL}/check-and-send`;
export const GA_RESPONDENT_INFORMATION_URL = `${BASE_GENERAL_APPLICATION_RESPONSE_URL}/respondent-information`;
export const GA_RESPONDENT_AGREEMENT_URL = `${BASE_GENERAL_APPLICATION_RESPONSE_URL}/respondent-agreement`;
export const GA_HEARING_ARRANGEMENTS_GUIDANCE_URL =`${BASE_GENERAL_APPLICATION_URL}/hearing-arrangements-guidance`;
export const GA_WANT_TO_UPLOAD_DOCUMENTS_URL = `${BASE_GENERAL_APPLICATION_URL}/want-to-upload-documents`;
export const GA_UPLOAD_DOCUMENTS_URL = `${BASE_GENERAL_APPLICATION_URL}/upload-documents`;
export const GA_ACCEPT_DEFENDANT_OFFER_URL = `${BASE_GENERAL_APPLICATION_RESPONSE_URL}/accept-defendant-offer`;
export const GA_HEARING_ARRANGEMENTS_GUIDANCE =`${BASE_GENERAL_APPLICATION_URL}/hearing-arrangements-guidance`;
export const GA_WANT_TO_UPLOAD_DOCUMENTS = `${BASE_GENERAL_APPLICATION_URL}/want-to-upload-documents`;
export const GA_UPLOAD_DOCUMENTS = `${BASE_GENERAL_APPLICATION_URL}/upload-documents`;
export const GA_APPLICATION_SUMMARY_URL = `${BASE_GENERAL_APPLICATION_URL}/summary`;
export const GA_APPLICATION_RESPONSE_SUMMARY_URL = `${BASE_CASE_RESPONSE_URL}/general-application/summary`;
export const VIEW_THE_JUDGMENT_URL = `${BASE_CASE_URL}/view-the-judgment`;
export const GA_RESPONSE_CONFIRMATION_URL = `${BASE_GENERAL_APPLICATION_RESPONSE_URL}/confirmation`;
export const CONFIRM_YOU_HAVE_BEEN_PAID_URL = `${BASE_JUDGMENT_ONLINE_URL}/confirm-you-have-been-paid`;
export const CONFIRM_YOU_HAVE_BEEN_PAID_CONFIRMATION_URL = `${BASE_JUDGMENT_ONLINE_URL}/confirm-you-have-been-paid/confirmation`;
export const GENERAL_APPLICATION_CONFIRM_URL = `${BASE_GENERAL_APPLICATION_URL}/submit-general-application-confirmation`;
export const GA_RESPONSE_CHECK_ANSWERS_URL = `${BASE_GENERAL_APPLICATION_RESPONSE_URL}/check-and-send`;
export const GA_RESPONSE_HEARING_ARRANGEMENT_URL = `${BASE_GENERAL_APPLICATION_RESPONSE_URL}/hearing-arrangement`;
export const GA_RESPONSE_HEARING_CONTACT_DETAILS_URL = `${BASE_GENERAL_APPLICATION_RESPONSE_URL}/hearing-contact-details`;
export const GA_RESPONSE_HEARING_SUPPORT_URL = `${BASE_GENERAL_APPLICATION_RESPONSE_URL}/hearing-support`;
export const GA_RESPONSE_UNAVAILABLE_HEARING_DATES_URL = `${BASE_GENERAL_APPLICATION_RESPONSE_URL}/unavailable-dates`;
export const GA_APPLY_HELP_WITH_FEE_SELECTION = `${BASE_GENERAL_APPLICATION_URL}/:appId/apply-help-fee-selection`;
export const GA_APPLY_HELP_WITH_OUT_APPID_FEE_SELECTION = `${BASE_GENERAL_APPLICATION_URL}/apply-help-fee-selection`;
export const GA_APPLY_HELP_WITH_FEES_START = `${BASE_GENERAL_APPLICATION_URL}/:appId/apply-help-with-fees/start`;
export const GA_APPLY_HELP_WITH_FEE_REFERENCE = `${BASE_GENERAL_APPLICATION_URL}/:appId/apply-help-with-fees/reference-number`;
export const GA_APPLY_HELP_WITH_FEES = `${BASE_GENERAL_APPLICATION_URL}/:appId/apply-help-with-fees`;
export const GA_APPLICATION_FEE_CONFIRMATION_URL = `${BASE_GENERAL_APPLICATION_URL}/:appId/pay-application-fee/confirmation`;
export const GA_VIEW_APPLICATION_URL = `${BASE_GENERAL_APPLICATION_URL}/:appId/view-application`;
export const BREATHING_SPACE_INFO_URL = `${DASHBOARD_URL}/:id/breathing-space-info`;
export const APPLICATION_FEE_PAYMENT_CONFIRMATION_URL='/general-application/payment-confirmation/:id/gaid/:appId';
export const APPLICATION_FEE_PAYMENT_CONFIRMATION_URL_WITH_UNIQUE_ID='/general-application/payment-confirmation/:id/gaid/:appId/:uniqueId/confirmation';
export const DQ_DISCLOSURE_OF_DOCUMENTS_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/disclosure-of-documents`;
export const DQ_MULTITRACK_DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/disclosure-non-electronic-documents`;
export const DQ_MULTITRACK_DISCLOSURE_OF_ELECTRONIC_DOCUMENTS_ISSUES_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/disclosure-of-electronic-documents-issues`;
export const DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/documents-to-be-considered`;
export const DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_DETAILS_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/documents-to-be-considered-details`;
export const DQ_MULTITRACK_AGREEMENT_REACHED_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/agreement-reached`;
export const SUBJECT_TO_FRC_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/subject-to-frc`;
export const FRC_BAND_AGREED_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/frc-band-agreed`;
export const ASSIGN_FRC_BAND_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/assign-complexity-band`;
export const REASON_FOR_FRC_BAND_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/reason-for-complexity-band`;
export const WHY_NOT_SUBJECT_TO_FRC_URL = `${DIRECTIONS_QUESTIONNAIRE_URL}/why-not-subject-to-frc`;
export const GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL = `${BASE_GENERAL_APPLICATION_URL}/:appId/upload-additional-documents`;
export const GA_UPLOAD_ADDITIONAL_DOCUMENTS_CYA_URL = `${BASE_GENERAL_APPLICATION_URL}/:appId/upload-additional-documents/check-and-send`;
export const GA_UPLOAD_ADDITIONAL_DOCUMENTS_SUBMITTED_URL = `${BASE_GENERAL_APPLICATION_URL}/:appId/upload-additional-documents/submitted`;
export const GA_PAY_ADDITIONAL_FEE_URL = `${BASE_GENERAL_APPLICATION_URL}/:appId/pay-additional-fee`;
export const GA_APPLY_HELP_ADDITIONAL_FEE_SELECTION_URL = `${BASE_GENERAL_APPLICATION_URL}/:appId/apply-help-additional-fee-selection`;
export const GA_RESPONSE_VIEW_APPLICATION_URL = `${BASE_GENERAL_APPLICATION_RESPONSE_URL}/view-application`;
export const GA_RESPONDENT_HEARING_PREFERENCE_URL = `${BASE_GENERAL_APPLICATION_RESPONSE_URL}/hearing-preference`;
export const GA_RESPONDENT_WANT_TO_UPLOAD_DOCUMENT_URL = `${BASE_GENERAL_APPLICATION_RESPONSE_URL}/want-to-upload-document`;
export const GA_RESPONDENT_UPLOAD_DOCUMENT_URL = `${BASE_GENERAL_APPLICATION_RESPONSE_URL}/upload-documents`;
export const GA_APPLICATION_SUBMITTED_URL = `${BASE_GENERAL_APPLICATION_URL}/application-submitted`;
export const GA_RESPOND_ADDITIONAL_INFO_URL = `${BASE_GENERAL_APPLICATION_URL}/:appId/respond-addln-info`;
export const GA_PROVIDE_MORE_INFORMATION_URL = `${BASE_GENERAL_APPLICATION_URL}/:appId/provide-more-information`;
export const GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_URL = `${BASE_GENERAL_APPLICATION_URL}/:appId/upload-documents-for-addln-info`;
export const GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_CYA_URL = `${BASE_GENERAL_APPLICATION_URL}/:appId/upload-documents-for-addln-info/check-and-send`;
export const GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_CONFIRMATION_URL = `${BASE_GENERAL_APPLICATION_URL}/:appId/upload-documents-for-addln-info/confirmation`;
export const GA_UPLOAD_DOCUMENT_DIRECTIONS_ORDER_URL = `${BASE_GENERAL_APPLICATION_URL}/:appId/upload-documents-directions-order`;
export const GA_UPLOAD_DOCUMENT_DIRECTIONS_ORDER_CYA_URL = `${BASE_GENERAL_APPLICATION_URL}/:appId/upload-documents-directions-order/check-and-send`;
export const GA_UPLOAD_DOCUMENT_DIRECTIONS_ORDER_CONFIRMATION_URL = `${BASE_GENERAL_APPLICATION_URL}/:appId/upload-documents-directions-order/confirmation`;
export const GA_MAKE_WITH_NOTICE_DOCUMENT_VIEW_URL = `${BASE_CASE_URL}/view-documents/:documentId`;
export const GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_URL = `${BASE_GENERAL_APPLICATION_URL}/:appId/upload-written-representation-docs`;
export const GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_CYA_URL = `${BASE_GENERAL_APPLICATION_URL}/:appId/upload-written-representation-docs/check-and-send`;
export const GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_SUBMITTED_URL = `${BASE_GENERAL_APPLICATION_URL}/:appId/upload-written-representation-docs/submitted`;
export const GA_DEBT_PAYMENT_EVIDENCE_COSC_URL = `${BASE_COSC_URL}/debt-payment-evidence`;
export const GA_CHECK_YOUR_ANSWERS_COSC_URL = `${BASE_COSC_URL}/check-your-answers`;
export const TEST_SUPPORT_TOGGLE_FLAG_ENDPOINT = '/testing-support/toggleFlag/:key/:value';
export const GA_ASK_PROOF_OF_DEBT_PAYMENT_GUIDANCE_URL =`${BASE_COSC_URL}/ask-proof-of-debt-payment-guidance`;
export const GA_UPLOAD_DOCUMENTS_COSC_URL =`${BASE_COSC_URL}/upload-documents`;
export const COSC_FINAL_PAYMENT_DATE_URL = `${BASE_COSC_URL}/final-payment-date`;
export const GA_COSC_CONFIRM_URL = `${BASE_COSC_URL}/submit-general-application-confirmation`;
export const GA_SUBMIT_OFFLINE = `${BASE_CASE_URL}/submit-application-offline`;
export const CONTACT_CNBC_URL = '/contact-cnbc';
export const CONTACT_MEDIATION_URL = '/contact-mediation';
export const GA_UNAVAILABILITY_CONFIRMATION_URL = `${BASE_GENERAL_APPLICATION_URL}/unavailability-confirmation`;
export const GA_UNAVAILABILITY_RESPONSE_CONFIRMATION_URL = `${BASE_GENERAL_APPLICATION_RESPONSE_URL}/unavailability-confirmation`;
export const GA_PAYMENT_SUCCESSFUL_COSC_URL = `${BASE_COSC_URL}/:appId/payment-successful`;
export const GA_PAYMENT_UNSUCCESSFUL_COSC_URL = `${BASE_COSC_URL}/:appId/payment-unsuccessful`;

export const QM_BASE = `${BASE_CASE_URL}/qm`;
export const QM_START_URL = `${QM_BASE}/start`;
export const QM_WHAT_DO_YOU_WANT_TO_DO_URL = `${QM_BASE}/what-you-want-to-do/:qmType`;
export const QM_FOLLOW_UP_URL = `${QM_BASE}/follow-up`;
export const QM_INFORMATION_URL = `${QM_BASE}/information/:qmType/:qmQualifyOption`;
export const QM_VIEW_QUERY_URL = `${QM_BASE}/view-query`;
export const QM_CYA = `${QM_BASE}/create-query-cya`;
export const QM_FOLLOW_UP_CYA = `${QM_BASE}/:queryId/follow-up-query-cya`;
export const QM_SHARE_QUERY_CONFIRMATION = `${QM_BASE}/share-query`;
export const QUERY_MANAGEMENT_CREATE_QUERY = `${QM_BASE}/create-query`;
export const QM_CONFIRMATION_URL = `${QM_BASE}/confirmation`;
export const QM_FOLLOW_UP_MESSAGE = `${QM_BASE}/:queryId/follow-up-message`;
export const QM_QUERY_DETAILS_URL = `${QM_BASE}/view-query/:queryId/query-details`;
