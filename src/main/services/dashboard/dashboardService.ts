import {
  getDashboardFromCache,
  getNotificationFromCache,
  saveDashboardToCache, saveNotificationToCache,
} from 'modules/draft-store/getDashboardCache';
import {Claim} from 'models/claim';
import {Dashboard} from 'models/dashboard/dashboard';
import {ClaimantOrDefendant} from 'models/partyType';
import {DashboardNotificationList} from 'models/dashboard/dashboardNotificationList';
import {getDashboardById, getNotificationById} from 'modules/utilityService';
import {AppRequest} from 'models/AppRequest';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('dashboardCache');

export const getDashboardForm = async (claim: Claim,claimId: string,req: AppRequest):Promise<Dashboard> => {
  try {
    const caseRole = claim.isClaimant() ? ClaimantOrDefendant.CLAIMANT : ClaimantOrDefendant.DEFENDANT;
    let dashboard: Dashboard = await getDashboardFromCache(caseRole, claimId);
    if (!dashboard) {
      dashboard = await getDashboardById(claimId,caseRole,req);
      await saveDashboardToCache(dashboard, caseRole, claimId);
    }
    return dashboard;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const getNotifications = async (claimId: string, claim: Claim,req: AppRequest):Promise<DashboardNotificationList> => {
  try {
    const caseRole = claim.isClaimant()?ClaimantOrDefendant.CLAIMANT:ClaimantOrDefendant.DEFENDANT;
    let dashboardNotificationsList: DashboardNotificationList = await getNotificationFromCache(caseRole, claimId);

    if (!dashboardNotificationsList){
      dashboardNotificationsList = await getNotificationById(claimId,caseRole,req);
      await saveNotificationToCache(dashboardNotificationsList,caseRole, claimId);
    }
    return dashboardNotificationsList;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
