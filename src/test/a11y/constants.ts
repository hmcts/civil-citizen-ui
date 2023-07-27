export const PageUrls = {

  //Page URL's for the CUI Common Pages.
  HOME: '/',
  DASHBOARD: '/dashboard',
  //Page URL's for the CUI Functional Pages.
  DEFENDANT : '/dashboard/:cuiCaseId/defendant',
  TASK_LIST : '/case/:cuiCaseId/response/task-list',

  /**
   * Page URL's for the Case Progression Functional Pages.
   * */

  //Evidence Upload
  CASE_PROGRESSION_TASK_LIST : '/case/:caseProgressionCaseId/defendant',
  UPLOAD_YOUR_DOCUMENTS : '/case/:caseProgressionCaseId/case-progression/upload-your-documents',
  WHAT_TYPE_OF_DOCUMENTS_DO_YOU_WANT_TO_UPLOAD : '/case/:caseProgressionCaseId/case-progression/type-of-documents',
  UPLOAD_DOCUMENTS : '/case/:caseProgressionCaseId/case-progression/upload-documents',

  //Trial Arrangements
  FINALISE_TRIAL_ARRANGEMENTS : '/case/:caseProgressionCaseId/case-progression/finalise-trial-arrangements',
  IS_CASE_READY : '/case/:caseProgressionCaseId/case-progression/is-case-ready',
  HAS_ANYTHING_CHANGED : '/case/:caseProgressionCaseId/case-progression/has-anything-changed',
} as const;
