import {NextFunction, RequestHandler, Response, Router} from 'express';
import {DASHBOARD_CLAIMANT_URL,OLD_DASHBOARD_CLAIMANT_URL} from '../../urls';
import {getDashboardForm} from 'services/dashboard/dashboardService';
import {Claim} from 'models/claim';
import {getClaimById} from 'modules/utilityService';
import {AppRequest} from 'models/AppRequest';
import {ClaimantOrDefendant} from 'models/partyType';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {isDashboardServiceEnabled} from '../../../app/auth/launchdarkly/launchDarklyClient';
import config from 'config';
import { CivilServiceClient } from 'client/civilServiceClient';
import { DashboardNotificationList } from 'common/models/dashboard/dashboardNotificationList';
import { DashboardNotification } from 'common/models/dashboard/dashboardNotification';
import { CaseState } from 'common/form/models/claimDetails';

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
      // const dashboardNotifications = await getNotifications(dashboardId, claim, caseRole, req);
      const dashboardNotifications = new DashboardNotificationList([new DashboardNotification('123', 'Test', 'Test', 'Test', 'Test', 'Test', null)])
      const dashboard = await getDashboardForm(caseRole, claim, dashboardId, req);



      const showTellUsEndedLink = claim.ccdState !== CaseState.PENDING_CASE_ISSUED &&
        claim.ccdState !== CaseState.CASE_ISSUED &&
        claim.ccdState !== CaseState.AWAITING_CASE_DETAILS_NOTIFICATION &&
        claim.ccdState !== CaseState.All_FINAL_ORDERS_ISSUED;

      const showGetDebtRespiteLink = claim.ccdState === CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT ||
        claim.ccdState === CaseState.AWAITING_APPLICANT_INTENTION;


        
      res.render(claimantDashboardViewPath, {
        claim: claim, 
        claimId, 
        dashboardTaskList: dashboard, 
        dashboardNotifications, 
        showTellUsEndedLink,
        showGetDebtRespiteLink,
        lng
      });

    } else {
      res.redirect(constructResponseUrlWithIdParams(claimId, OLD_DASHBOARD_CLAIMANT_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default claimantDashboardController;
