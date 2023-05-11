export const PageUrls = {

  //Page URL's for the CUI Common Pages.
  HOME: '/',
  DASHBOARD: '/dashboard',
  //Page URL's for the CUI Functional Pages.
  DEFENDANT : '/dashboard/:cuiCaseId/defendant',
  TASK_LIST : '/case/:cuiCaseId/response/task-list',
  //Page URL's for the Case Progression Functional Pages.
} as const;
