import {
  getDashboardFromCache,
  getNotificationFromCache,
  saveDashboardToCache, saveNotificationToCache,
} from 'modules/draft-store/getDashboardCache';
import {Dashboard} from 'models/dashboard/dashboard';
import {ClaimantOrDefendant} from 'models/partyType';
import {DashboardNotificationList} from 'models/dashboard/dashboardNotificationList';
import {getDashboardById, getNotificationById} from 'modules/utilityService';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('dashboardCache');

export const getDashboardForm = async (caseRole: ClaimantOrDefendant, claim: Claim, claimId: string, req: AppRequest): Promise<Dashboard> => {
  try {
    let dashboard: Dashboard = await getDashboardFromCache(caseRole, claimId);
    if (!dashboard) {
      dashboard = await getDashboardById(claimId, claim, caseRole, req);
      await saveDashboardToCache(dashboard, caseRole, claimId);
    }
    return dashboard;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const getNotifications = async (claimId: string, claim: Claim, caseRole: ClaimantOrDefendant, req: AppRequest): Promise<DashboardNotificationList> => {
  try {
    let dashboardNotificationsList: DashboardNotificationList = await getNotificationFromCache(caseRole, claimId);

    if (!dashboardNotificationsList){
      dashboardNotificationsList = await getNotificationById(claimId, claim, caseRole, req);
      await saveNotificationToCache(dashboardNotificationsList, caseRole, claimId);
    }
    return dashboardNotificationsList;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
