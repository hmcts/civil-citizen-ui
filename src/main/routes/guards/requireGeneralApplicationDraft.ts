import {NextFunction, Request, Response} from 'express';
import {AppRequest} from 'models/AppRequest';
import {getClaimById} from 'modules/utilityService';
import {getDashboardUrlForParty} from 'services/features/generalApplication/generalApplicationService';
import {getRouteParam} from 'common/utils/routeParamUtils';

export const requireGeneralApplicationDraft = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const claimId = getRouteParam(req, 'id');
    const claim = await getClaimById(claimId, req as AppRequest, true);
    if (!claim.generalApplication?.applicationTypes?.length) {
      return res.redirect(getDashboardUrlForParty(claimId, claim));
    }
    next();
  } catch (error) {
    next(error);
  }
};
