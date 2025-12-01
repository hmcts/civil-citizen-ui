export const GA_SERVICE_CASES_URL = '/cases/';
export const GA_GET_APPLICATION_URL= `${GA_SERVICE_CASES_URL}:caseId`;
export const GA_SERVICE_CASE_URL = '/cases/:caseId';
export const GA_SERVICE_SUBMIT_EVENT = `${GA_SERVICE_CASES_URL}:caseId/ga/citizen/:submitterId/event`;
export const GA_FEES_PAYMENT_URL= '/fees/case/:claimId/ga/payment';
export const GA_FEES_PAYMENT_STATUS_URL= '/fees/case/:claimId/ga/payment/:paymentReference/status';
export const GA_BY_CASE_URL = '${GA_SERVICE_CASES_URL}:id/ga/applications';
