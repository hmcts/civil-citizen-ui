import {
  getDashboardFromCache,
  getNotificationFromCache,
  saveDashboardToCache,
} from 'modules/draft-store/getDashboardCache';
import {Claim} from 'models/claim';
import {Dashboard} from 'models/dashboard/dashboard';
import {ClaimantOrDefendant} from 'models/partyType';
import {DashboardNotificationList} from 'models/dashboard/dashboardNotificationList';
import {DashboardNotification} from 'models/dashboard/dashboardNotification';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('dashboardCache');
//const success = 'Success';
export const getDashboardForm = async (claim: Claim,claimId: string):Promise<Dashboard> => {
  try {
    const caseRole = claim.isClaimant()?ClaimantOrDefendant.CLAIMANT:ClaimantOrDefendant.DEFENDANT;
    const cachedDashboard:Dashboard = await getDashboardFromCache(caseRole,claimId);
    if(cachedDashboard?.items?.length && !claim.hasCaseProgressionHearingDocuments()) {
      return cachedDashboard;
    }
    const dashboard:Dashboard = generateNewDashboard(claim);
    await saveDashboard(dashboard,claim, claimId);
    return dashboard;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveDashboard = async (dashboard:Dashboard, claim:Claim, claimId:string) =>{
  try {
    const caseRole = claim.isClaimant()?ClaimantOrDefendant.CLAIMANT:ClaimantOrDefendant.DEFENDANT;
    await saveDashboardToCache(dashboard,caseRole,claimId);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const getNotifications = async (claimId: string, claim: Claim, lng: string) => {
  try {
    const caseRole = claim.isClaimant()?ClaimantOrDefendant.CLAIMANT:ClaimantOrDefendant.DEFENDANT;
    const cachedDashboardNotifications: DashboardNotificationList = await getNotificationFromCache(caseRole, claimId);
    const dashboardNotificationsList: DashboardNotification[]  = cachedDashboardNotifications.items;
    return dashboardNotificationsList;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const generateNewDashboard = (claim: Claim): Dashboard => {
  //TODO read the dashboard from the draft
  //const newDashboard: Dashboard = new Dashboard();
  if ((!claim.isLRClaimant() && claim.isClaimant()) || (!claim.isClaimant() && !claim.isLRDefendant())) {
    //TODO read the dashboard from the draft
    if (claim.isFastTrackClaim) {
      //TODO move the bussiness logic to civil service
      //hearings.tasks.push((new TaskItem(t('PAGES.DASHBOARD.HEARINGS.ADD_TRIAL'), '#', TaskStatus.NOT_AVAILABLE_YET, false, TaskStatusColor[TaskStatus.NOT_AVAILABLE_YET])));
    }
    if (!claim.isLRClaimant() && claim.isClaimant()) {
      //TODO move the bussiness logic to civil service
      //hearings.tasks.push((checkHearingPaymentStatus(claim)));
    }
    //TODO move the bussiness logic to civil service
    //hearings.tasks.push((new TaskItem(t('PAGES.DASHBOARD.HEARINGS.VIEW_BUNDLE'), '#', TaskStatus.NOT_AVAILABLE_YET, false, TaskStatusColor[TaskStatus.NOT_AVAILABLE_YET])));
    // const noticeAndOrders = new TaskListBuilder(t('PAGES.DASHBOARD.ORDERS_NOTICE.TITLE'))
    //   .addTask(new TaskItem(t('PAGES.DASHBOARD.ORDERS_NOTICE.VIEW'), '#', TaskStatus.NOT_AVAILABLE_YET, false, TaskStatusColor[TaskStatus.NOT_AVAILABLE_YET]))
    //   .build();
  }
  return new Dashboard([]);
};

// const checkHearingPaymentStatus = (claim: Claim): TaskItem => {
//   //TODO move the bussiness logic to civil service
//   // const hearingFeeActionable = claim?.caseProgressionHearing?.hearingFeeInformation?.hearingFee != null;
//   // const hearingDueDate =  new Date(claim?.caseProgressionHearing?.hearingFeeInformation?.hearingDueDate);
//   // const hearingFeeHelpText = t('PAGES.DASHBOARD.HEARINGS.PAY_FEE_DEADLINE', {hearingDueDate: formatStringDateDMY(hearingDueDate)});
//   //
//   // if (claim.caseProgression?.hearing?.paymentInformation?.status === success || claim.caseProgressionHearing?.hearingFeePaymentDetails?.status === PaymentStatus.SUCCESS) {
//   //   return  new TaskItem(t('PAGES.DASHBOARD.HEARINGS.PAY_FEE'), '#', TaskStatus.DONE_NO_URL, false, TaskStatusColor[TaskStatus.DONE]);
//   // } else if (claim.caseProgression?.helpFeeReferenceNumberForm?.referenceNumber){
//   //   const taskStatus = TaskStatus.IN_PROGRESS;
//   //   return new TaskItem(t('PAGES.DASHBOARD.HEARINGS.PAY_FEE'), '#', taskStatus, false, TaskStatusColor[taskStatus], hearingFeeHelpText);
//   // } else if (hearingFeeActionable) {
//   //   const hearingFeeUrl = PAY_HEARING_FEE_URL.replace(':id', claim.id);
//   //   const hearingFeeTaskStatus = TaskStatus.ACTION_NEEDED;
//   //   return new TaskItem(t('PAGES.DASHBOARD.HEARINGS.PAY_FEE'), hearingFeeUrl, hearingFeeTaskStatus, false, TaskStatusColor[hearingFeeTaskStatus], hearingFeeHelpText);
//   // }
//   // return new TaskItem(t('PAGES.DASHBOARD.HEARINGS.PAY_FEE'), '#', TaskStatus.NOT_AVAILABLE_YET, false, TaskStatusColor[TaskStatus.NOT_AVAILABLE_YET]);
// };
