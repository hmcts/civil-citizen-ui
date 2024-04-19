import {NextFunction, RequestHandler, Response, Router} from 'express';
import {DASHBOARD_CLAIMANT_URL,OLD_DASHBOARD_CLAIMANT_URL} from '../../urls';
import {getDashboardForm, getNotifications} from 'services/dashboard/dashboardService';
import {Claim} from 'models/claim';
import {getClaimById} from 'modules/utilityService';
import {AppRequest} from 'models/AppRequest';
import {ClaimantOrDefendant} from 'models/partyType';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {isDashboardServiceEnabled} from '../../../app/auth/launchdarkly/launchDarklyClient';
import config from 'config';
import { CivilServiceClient } from 'client/civilServiceClient';
import {isCarmEnabledForCase} from 'common/utils/carmToggleUtils';

const claimantDashboardViewPath = 'features/dashboard/claim-summary-redesign';
const claimantDashboardController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

claimantDashboardController.get(DASHBOARD_CLAIMANT_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId =  req.params.id;
    const isDashboardEnabled = await isDashboardServiceEnabled();
    if (isDashboardEnabled){
      const lng = req.query.lang ? req.query.lang : req.cookies.lang;
      let claim: Claim;
      let caseRole: ClaimantOrDefendant;
      let dashboardId;

      if(claimId == 'draft') {
        caseRole = ClaimantOrDefendant.CLAIMANT;
        const userId = (<AppRequest>req)?.session?.user?.id.toString();
        claim = await getClaimById(userId, req);
        dashboardId = userId;
      } else {
        claim = await civilServiceClient.retrieveClaimDetails(claimId, req);
        caseRole = claim.isClaimant()?ClaimantOrDefendant.CLAIMANT:ClaimantOrDefendant.DEFENDANT;
        dashboardId = claimId;
      }
        const carmEnabled = await isCarmEnabledForCase(claim.submittedDate);
        const dashboardNotifications = await getNotifications(dashboardId, claim, caseRole, req);
        const dashboard = await getDashboardForm(caseRole, claim, dashboardId, req, carmEnabled);
      res.render(claimantDashboardViewPath, {claim:claim, claimId, dashboardTaskList:dashboard, dashboardNotifications, lng});
    } else {
      res.redirect(constructResponseUrlWithIdParams(claimId, OLD_DASHBOARD_CLAIMANT_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default claimantDashboardController;
