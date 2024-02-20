import {NextFunction, RequestHandler, Response, Router} from 'express';
import {DASHBOARD_CLAIMANT_URL} from '../../urls';
import {getDashboardForm, getNotifications} from 'services/dashboard/dashboardService';
import {Claim} from 'models/claim';
import {getClaimById} from 'modules/utilityService';
import {AppRequest} from 'models/AppRequest';

const claimantDashboardViewPath = 'features/dashboard/claim-summary-redesign';
const claimantDashboardController = Router();

claimantDashboardController.get(DASHBOARD_CLAIMANT_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const caseData: Claim = await getClaimById(claimId, req, true);
    const dashboardNotifications = await getNotifications(claimId, caseData,req);
    const dashboard = await getDashboardForm(caseData,claimId,req);
    res.render(claimantDashboardViewPath, {claim:caseData, claimId, dashboardTaskList:dashboard, dashboardNotifications,lang});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default claimantDashboardController;
