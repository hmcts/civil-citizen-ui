import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {BREATHING_SPACE_ENTER_URL, DASHBOARD_CLAIMANT_URL} from '../../urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import {getRouteParam} from 'common/utils/routeParamUtils';

const breathingSpaceEnterViewPath = 'features/dashboard/breathing-space-enter';
const breathingSpaceEntryController = Router();

breathingSpaceEntryController.get(BREATHING_SPACE_ENTER_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = getRouteParam(req, 'id');
    await getClaimById(claimId, req, true);
    res.render(breathingSpaceEnterViewPath, {
      dashboardUrl: constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL),
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default breathingSpaceEntryController;
