import {NextFunction, RequestHandler, Response, Router} from 'express';
import {DASHBOARD_CLAIMANT_URL} from '../../urls';
import {getDashboardForm, getNotifications} from 'services/dashboard/dashboardService';
import {Claim} from 'models/claim';
import {getClaimById} from 'modules/utilityService';
import {AppRequest} from 'models/AppRequest';
import {ClaimantOrDefendant} from 'models/partyType';

const claimantDashboardViewPath = 'features/dashboard/claim-summary-redesign';
const claimantDashboardController = Router();

claimantDashboardController.get(DASHBOARD_CLAIMANT_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId =  req.params.id;
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    let caseData: Claim;
    let caseRole: ClaimantOrDefendant;
    let dashboardId;
    if(claimId == 'draft') {
      caseRole = ClaimantOrDefendant.CLAIMANT;
      const userId = (<AppRequest>req)?.session?.user?.id.toString();
      caseData = await getClaimById(userId, req);
      dashboardId = userId;
    } else {
      caseData = await getClaimById(claimId, req, true);
      caseRole = caseData.isClaimant()?ClaimantOrDefendant.CLAIMANT:ClaimantOrDefendant.DEFENDANT;
      dashboardId = claimId;
    }

    const dashboardNotifications = await getNotifications(dashboardId, caseRole, req);
    const dashboard = await getDashboardForm(caseRole, dashboardId, req);
    res.render(claimantDashboardViewPath, {claim:caseData, claimId, dashboardTaskList:dashboard, dashboardNotifications, lng});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default claimantDashboardController;
