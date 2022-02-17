export type Urls = `/${string}`;

export const CALLBACK_URL: Urls= '/oauth2/callback';
export const SIGN_IN_URL: Urls = '/login';
export const SIGN_OUT_URL: Urls = '/logout';
export const DASHBOARD_URL: Urls = '/dashboard';
export const CASES_URL: Urls = '/cases';
export const CITIZEN_PHONE_NUMBER_URL: Urls = '/citizen-phone';
export const ROOT_URL: Urls = '/home';
export const UNAUTHORISED_URL: Urls = '/unauthorised';
export const CLAIM_DETAILS_URL: Urls = '/case/:id/response/claim-details';
export const CITIZEN_DETAILS_URL: Urls = '/case/:id/response/your-details';
export const CONFIRM_CITIZEN_DETAILS_URL: Urls = '/confirm-your-details';

