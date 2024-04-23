
export const CIVIL_SERVICE_CASES_URL = '/cases/';
export const CIVIL_SERVICE_FEES_URL = '/fees';
export const CIVIL_SERVICE_DASHBOARD_URL = '/dashboard';
export const CIVIL_SERVICE_ASSIGNMENT_URL = '/assignment';
export const CIVIL_SERVICE_CLAIM_AMOUNT_URL = `${CIVIL_SERVICE_FEES_URL}/claim`;
export const CIVIL_SERVICE_HEARING_URL = `${CIVIL_SERVICE_FEES_URL}/hearing`;
export const CIVIL_SERVICE_FEES_RANGES = `${CIVIL_SERVICE_FEES_URL}/ranges/`;
export const CIVIL_SERVICE_VALIDATE_PIN_URL = `${CIVIL_SERVICE_ASSIGNMENT_URL}/reference/:caseReference`;
export const CIVIL_SERVICE_DOCUMENT_URL = '/case/document/';
export const CIVIL_SERVICE_DOWNLOAD_DOCUMENT_URL = `${CIVIL_SERVICE_DOCUMENT_URL}downloadDocument/:documentId`;
export const CIVIL_SERVICE_UPLOAD_DOCUMENT_URL = `${CIVIL_SERVICE_DOCUMENT_URL}generateAnyDoc`;
export const CIVIL_SERVICE_CLAIMANT = `${CIVIL_SERVICE_CASES_URL}claimant/`;
export const CIVIL_SERVICE_SUBMIT_EVENT = `${CIVIL_SERVICE_CASES_URL}:caseId/citizen/:submitterId/event`;
export const CIVIL_SERVICE_CALCULATE_DEADLINE = `${CIVIL_SERVICE_CASES_URL}response/deadline`;
export const CIVIL_SERVICE_COURT_LOCATIONS = '/locations/courtLocations';
export const ASSIGN_CLAIM_TO_DEFENDANT =`${CIVIL_SERVICE_ASSIGNMENT_URL}/case/:claimId/DEFENDANT`;
export const CIVIL_SERVICE_AGREED_RESPONSE_DEADLINE_DATE =`${CIVIL_SERVICE_CASES_URL}response/agreeddeadline/:claimId`;
export const CIVIL_SERVICE_USER_CASE_ROLE = `${CIVIL_SERVICE_CASES_URL}:claimId/userCaseRoles`;
export const CIVIL_SERVICE_COURT_DECISION =  `${CIVIL_SERVICE_CASES_URL}:claimId/courtDecision`;
export const CIVIL_SERVICE_VALIDATE_OCMC_PIN_URL = `${CIVIL_SERVICE_ASSIGNMENT_URL}/reference/:caseReference/ocmc`;
export const CIVIL_SERVICE_FEES_PAYMENT_URL= `${CIVIL_SERVICE_FEES_URL}/:feeType/case/:claimId/payment`;
export const CIVIL_SERVICE_FEES_PAYMENT_STATUS_URL= `${CIVIL_SERVICE_FEES_URL}/:feeType/case/:claimId/payment/:paymentReference/status`;
export const CIVIL_SERVICE_DASHBOARD_TASKLIST_URL= `${CIVIL_SERVICE_DASHBOARD_URL}/taskList/:ccd-case-identifier/role/:role-type`;
export const CIVIL_SERVICE_NOTIFICATION_LIST_URL= `${CIVIL_SERVICE_DASHBOARD_URL}/notifications/:ccd-case-identifier/role/:role-type`;
export const CIVIL_SERVICE_BASE_DASHBOARD_URL = '/dashboard';
export const CIVIL_SERVICE_CREATE_SCENARIO_DASHBOARD_URL = `${CIVIL_SERVICE_BASE_DASHBOARD_URL}/scenarios/:scenarioRef/:redisKey`;
export const CIVIL_SERVICE_RECORD_NOTIFICATION_CLICK_URL = `${CIVIL_SERVICE_BASE_DASHBOARD_URL}/notifications/:notificationId`;
