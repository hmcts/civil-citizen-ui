const BASE_CASE_RESPONSE_URL = '/case/:id/response';
const STATEMENT_OF_MEANS_URL = `${BASE_CASE_RESPONSE_URL}/statement-of-means`;
export const CALLBACK_URL = '/oauth2/callback';
export const SIGN_IN_URL = '/login';
export const SIGN_OUT_URL = '/logout';
export const CASES_URL = '/cases';
export const DASHBOARD_URL = '/dashboard';
export const CITIZEN_PHONE_NUMBER_URL = `${BASE_CASE_RESPONSE_URL}/your-phone`;
export const ROOT_URL = '/';
export const HOME_URL = '/home';
export const DOB_URL = `${BASE_CASE_RESPONSE_URL}/your-dob`;
export const AGE_ELIGIBILITY_URL = `${BASE_CASE_RESPONSE_URL}/eligibility/under-18`;
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
export const WHO_EMPLOYS_YOU_URL = `${CITIZEN_EMPLOYMENT_URL}/employers`;
export const UNEMPLOYED_URL = `${STATEMENT_OF_MEANS_URL}/unemployment`;
export const SELF_EMPLOYED_URL = `${CITIZEN_EMPLOYMENT_URL}/self-employment`;
export const ON_TAX_PAYMENTS_URL = `${SELF_EMPLOYED_URL}/on-tax-payments`;
export const FINANCIAL_DETAILS_URL = `${STATEMENT_OF_MEANS_URL}/intro`;
export const CLAIM_TASK_LIST_URL = `${BASE_CASE_RESPONSE_URL}/claim-task-list`;
export const CITIZEN_PAYMENT_OPTION_URL = `${BASE_CASE_RESPONSE_URL}/full-admission/payment-option`;
export const CITIZEN_PAYMENT_DATE_URL = `${BASE_CASE_RESPONSE_URL}/full-admission/payment-date`;
export const CITIZEN_DEPENDANTS_EDUCATION_URL = `${STATEMENT_OF_MEANS_URL}/dependants/education`;
export const CHILDREN_DISABILITY_URL = `${CITIZEN_DEPENDANTS_URL}/children-disability`;




