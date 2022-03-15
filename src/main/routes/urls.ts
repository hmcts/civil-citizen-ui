export type Urls = `/${string}`;

const BASE_CASE_RESPONSE_URL: Urls = '/case/:id/response';
const STATEMENT_OF_MEANS_URL: Urls = `${BASE_CASE_RESPONSE_URL}/statement-of-means`;
export const CALLBACK_URL: Urls = '/oauth2/callback';
export const SIGN_IN_URL: Urls = '/login';
export const SIGN_OUT_URL: Urls = '/logout';
export const CASES_URL: Urls = '/cases';
export const DASHBOARD_URL: Urls = '/dashboard';
export const CITIZEN_PHONE_NUMBER_URL: Urls = `${BASE_CASE_RESPONSE_URL}/your-phone`;
export const ROOT_URL: Urls = '/';
export const HOME_URL: Urls = '/home';
export const DOB_URL: Urls = `${BASE_CASE_RESPONSE_URL}/your-dob`;
export const AGE_ELIGIBILITY_URL: Urls = `${BASE_CASE_RESPONSE_URL}/eligibility/under-18`;
export const UNAUTHORISED_URL: Urls = '/unauthorised';
export const CLAIM_DETAILS_URL: Urls = `${BASE_CASE_RESPONSE_URL}/claim-details`;
export const CITIZEN_DETAILS_URL: Urls = `${BASE_CASE_RESPONSE_URL}/your-details`;
export const POSTCODE_LOOKUP_URL: Urls = '/postcode-lookup';
export const CITIZEN_RESPONSE_TYPE: Urls = `${BASE_CASE_RESPONSE_URL}/citizen-response-type`;
export const CITIZEN_DISABILITY_URL: Urls = `${STATEMENT_OF_MEANS_URL}/disability`;
export const CITIZEN_SEVERELY_DISABLED_URL: Urls = `${STATEMENT_OF_MEANS_URL}/severe-disability`;
export const CITIZEN_RESIDENCE_URL: Urls = `${STATEMENT_OF_MEANS_URL}/residence`;
export const FINANCIAL_DETAILS_URL: Urls = `${BASE_CASE_RESPONSE_URL}/financial-details`;
export const CITIZEN_BANK_ACCOUNT_URL: Urls = `${STATEMENT_OF_MEANS_URL}/bank-accounts`;
export const CLAIM_TASK_LIST: Urls = `${BASE_CASE_RESPONSE_URL}/claim-task-list`;


