import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {DASHBOARD_CLAIMANT_URL} from '../../urls';
import {getDashboardForm, getNotifications} from 'services/dashboard/dashboardService';
import {Claim} from 'models/claim';
import {getClaimById} from 'modules/utilityService';

const claimantDashboardViewPath = 'features/dashboard/claim-summary-redesign';
const claimantDashboardController = Router();

claimantDashboardController.get(DASHBOARD_CLAIMANT_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const caseData: Claim = await getClaimById(claimId, req, true);

    const dashboardNotifications = await getNotifications(claimId, caseData, lang);
    const dashboardTaskList = await getDashboardForm(caseData,claimId);
    res.render(claimantDashboardViewPath, {caseData, claimId, dashboardTaskList, dashboardNotifications});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default claimantDashboardController;
