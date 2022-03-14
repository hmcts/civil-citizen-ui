export type Urls = `/${string}`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const BASE_CASE_RESPONSE_URL: Urls = '/case/:id/response';
export const CALLBACK_URL: Urls = '/oauth2/callback';
const STATEMENT_OF_MEANS_URL: Urls = `${BASE_CASE_RESPONSE_URL}/statement-of-means`;
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

export const DUMMY_URL = `${BASE_CASE_RESPONSE_URL}/dummy/url `;
export const CITIZEN_DISABILITY_URL: Urls = `${STATEMENT_OF_MEANS_URL}/disability`;
export const CITIZEN_PARTNER_URL: Urls = `${STATEMENT_OF_MEANS_URL}/partner/partner-age`;
export const CITIZEN_PARTENER_PENSION_URL: Urls = `${STATEMENT_OF_MEANS_URL}/partner/partner-pension`;
export const CITIZEN_PARTNER_DISABILITY_URL: Urls = `${STATEMENT_OF_MEANS_URL}/partner/partner-disability`;
export const CITIZEN_DEPENDANTS_URL: Urls = `${STATEMENT_OF_MEANS_URL}/dependants`;
