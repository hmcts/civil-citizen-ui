import {NextFunction, Response} from 'express';
import {AppRequest} from 'models/AppRequest';
import {getClaimById} from 'modules/utilityService';
import {APPLICATION_TYPE_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {queryParamNumber} from 'common/utils/requestUtils';

export const SHOW_APPLICATION_TYPE_ERROR_QUERY_PARAM = 'showApplicationTypeError';
export const SHOW_DUPLICATE_APPLICATION_TYPE_ERROR_QUERY_PARAM = 'showDuplicateApplicationTypeError';

export const applicationTypeErrorUrl = (claimId: string, applicationTypeIndex?: number): string => {
  const indexQuery = applicationTypeIndex !== undefined ? `index=${applicationTypeIndex}&` : '';
  return `${constructResponseUrlWithIdParams(claimId, APPLICATION_TYPE_URL)}?${indexQuery}${SHOW_APPLICATION_TYPE_ERROR_QUERY_PARAM}=true`;
};

export const duplicateApplicationTypeErrorUrl = (claimId: string, applicationTypeIndex: number): string => {
  return `${constructResponseUrlWithIdParams(claimId, APPLICATION_TYPE_URL)}?index=${applicationTypeIndex}&${SHOW_DUPLICATE_APPLICATION_TYPE_ERROR_QUERY_PARAM}=true`;
};

export const applicationTypeGuard = async (req: AppRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const claimId = getRouteParam(req, 'id');
    const claim = await getClaimById(claimId, req, true);

    if (claim.generalApplication?.applicationTypeChangeInProgress) {
      const applicationTypeIndex = claim.generalApplication.applicationTypeChangeIndex ?? queryParamNumber(req, 'index');
      res.redirect(applicationTypeErrorUrl(claimId, applicationTypeIndex));
      return;
    }

    if (!claim.generalApplication?.applicationTypes?.length) {
      res.redirect(applicationTypeErrorUrl(claimId));
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};
