import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  BREATHING_SPACE_INFO_URL, DASHBOARD_CLAIMANT_URL, QM_START_URL,
} from '../../urls';
import {getBSGuidanceContent, getSupportLinks} from 'services/dashboard/breathingSpaceGuidanceContentBuilder';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Claim} from 'models/claim';
import {getClaimById} from 'modules/utilityService';
import {isQueryManagementEnabled} from '../../../app/auth/launchdarkly/launchDarklyClient';

const viewBreathingSpaceInfo = 'features/dashboard/breathing-space-info';
const viewBreathingSpaceInformationController = Router();

async function renderView(req: Request, res: Response, claim: Claim, claimId: string) {
  const lng = req.query.lang ? req.query.lang : req.cookies.lang;
  const isQMLipEnabled = await  isQueryManagementEnabled(claim.submittedDate);
  const contentList = getBSGuidanceContent(lng, constructResponseUrlWithIdParams(claimId, QM_START_URL)+'?linkFrom=start', isQMLipEnabled);
  const [iWantToTitle, iWantToLinks] = getSupportLinks(lng);

  res.render(viewBreathingSpaceInfo, {
    contentList,
    iWantToTitle,
    iWantToLinks,
    dashboardUrl: constructResponseUrlWithIdParams(claimId,  DASHBOARD_CLAIMANT_URL),
  });
}
viewBreathingSpaceInformationController.get(BREATHING_SPACE_INFO_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim: Claim = await getClaimById(claimId, req, true);
    await renderView(req, res, claim, claimId);
  } catch (error) {
    next(error);
  }
})as RequestHandler);

export default viewBreathingSpaceInformationController;
