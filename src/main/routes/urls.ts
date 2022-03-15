export type Urls = `/${string}`;

const BASE_CASE_RESPONSE_URL: Urls = '/case/:id/response';
const STATEMENT_OF_MEANS_URL: Urls = `${BASE_CASE_RESPONSE_URL}/statement-of-means`;
export const CALLBACK_URL: Urls = '/oauth2/callback';
export const SIGN_IN_URL: Urls = '/login';
export const SIGN_OUT_URL: Urls = '/logout';
export const CASES_URL: Urls = '/cases';
export const DASHBOARD_URL: Urls = '/dashboard';
export const CITIZEN_PHONE_NUMBER_URL: Urls = '/citizen-phone';
export const ROOT_URL: Urls = '/';
export const HOME_URL: Urls = '/home';
export const DOB_URL: Urls = '/your-dob';
export const AGE_ELIGIBILITY_URL: Urls = '/eligibility/under-18';
export const UNAUTHORISED_URL: Urls = '/unauthorised';
export const CLAIM_DETAILS_URL: Urls = '/case/:id/response/claim-details';
export const CITIZEN_DETAILS_URL: Urls = '/case/:id/response/your-details';
export const POSTCODE_LOOKUP_URL: Urls = '/postcode-lookup';
export const CITIZEN_RESPONSE_TYPE: Urls = '/citizen-response-type';
export const CITIZEN_DISABILITY_URL: Urls = `${STATEMENT_OF_MEANS_URL}/disability`;
export const CITIZEN_SEVERELY_DISABLED_URL: Urls = `${STATEMENT_OF_MEANS_URL}/are-you-severely-disabled`;
export const CITIZEN_WHERE_LIVE_URL: Urls = `${STATEMENT_OF_MEANS_URL}/where-do-you-live`;
export const CITIZEN_RESIDENCE_URL: Urls = `${STATEMENT_OF_MEANS_URL}/residence`;
export const DO_YOU_LIVE_WITH_PARTNER_URL: Urls = `${STATEMENT_OF_MEANS_URL}/partner/partner`;

