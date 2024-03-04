import {NextFunction, RequestHandler, Response, Router} from 'express';
import {DASHBOARD_CLAIMANT_URL} from '../../urls';
import {getDashboardForm, getNotifications} from 'services/dashboard/dashboardService';
import {Claim} from 'models/claim';
import {getClaimById} from 'modules/utilityService';
import {AppRequest} from 'models/AppRequest';
import {ClaimantOrDefendant} from 'models/partyType';
import {isDashboardServiceEnabled} from '../../../app/auth/launchdarkly/launchDarklyClient';

const claimantDashboardViewPath = 'features/dashboard/claim-summary-redesign';
const claimantDashboardController = Router();

claimantDashboardController.get(DASHBOARD_CLAIMANT_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId =  req.params.id;
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    let claim: Claim;
    let caseRole: ClaimantOrDefendant;
    let dashboardId;
    let dashboardNotifications;
    let dashboard;
    const isDashboardService = await isDashboardServiceEnabled();
    if(claimId == 'draft') {
      caseRole = ClaimantOrDefendant.CLAIMANT;
      const userId = (<AppRequest>req)?.session?.user?.id.toString();
      claim = await getClaimById(userId, req);
      dashboardId = userId;
    } else {
      claim = await getClaimById(claimId, req, true);
      caseRole = claim.isClaimant()?ClaimantOrDefendant.CLAIMANT:ClaimantOrDefendant.DEFENDANT;
      dashboardId = claimId;
    }
    if (isDashboardService) {
      dashboardNotifications = await getNotifications(dashboardId, claim, caseRole, req);
      dashboard = await getDashboardForm(caseRole, claim, dashboardId, req);
    }else{
      //TODO master content
    }
    res.render(claimantDashboardViewPath, {claim:claim, claimId, dashboardTaskList:dashboard, dashboardNotifications, lng});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default claimantDashboardController;
