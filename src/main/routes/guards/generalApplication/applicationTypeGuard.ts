import {NextFunction, Response} from 'express';
import {AppRequest} from 'models/AppRequest';
import {getClaimById} from 'modules/utilityService';
import {APPLICATION_TYPE_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getRouteParam} from 'common/utils/routeParamUtils';

export const SHOW_APPLICATION_TYPE_ERROR_QUERY_PARAM = 'showApplicationTypeError';

export const applicationTypeErrorUrl = (claimId: string): string => {
  return `${constructResponseUrlWithIdParams(claimId, APPLICATION_TYPE_URL)}?${SHOW_APPLICATION_TYPE_ERROR_QUERY_PARAM}=true`;
};

export const applicationTypeGuard = async (req: AppRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const claimId = getRouteParam(req, 'id');
    const claim = await getClaimById(claimId, req, true);

    if (!claim.generalApplication?.applicationTypes?.length) {
      res.redirect(applicationTypeErrorUrl(claimId));
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};
