export type Urls = `/${string}`;

export const BASE_CASE_RESPONSE_URL: Urls = '/case/:id/response';
export const CALLBACK_URL: Urls= '/oauth2/callback';
export const SIGN_IN_URL: Urls = '/login';
export const SIGN_OUT_URL: Urls = '/logout';
export const DASHBOARD_URL: Urls = '/dashboard';
export const CASES_URL: Urls = '/cases';
export const CITIZEN_PHONE_NUMBER_URL: Urls = `${BASE_CASE_RESPONSE_URL}/your-phone`;
export const ROOT_URL: Urls = '/';
export const HOME_URL: Urls = '/home';
export const DOB_URL: Urls = `${BASE_CASE_RESPONSE_URL}/your-dob`;
export const AGE_ELIGIBILITY_URL: Urls = `${BASE_CASE_RESPONSE_URL}/eligibility/under-18`;
export const UNAUTHORISED_URL: Urls = '/unauthorised';
export const CLAIM_DETAILS_URL: Urls = `${BASE_CASE_RESPONSE_URL}/claim-details`;
export const CITIZEN_DETAILS_URL: Urls = `${BASE_CASE_RESPONSE_URL}/your-details`;
export const CONFIRM_CITIZEN_DETAILS_URL: Urls = '/confirm-your-details';
export const RESPONSE_TYPE_URL: Urls = `${BASE_CASE_RESPONSE_URL}/response-type`;


