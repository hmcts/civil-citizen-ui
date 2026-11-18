import {NextFunction, Request, Response} from 'express';
import {getResponseClaimById} from '../../modules/draft-store/response/responseDraftStoreService';
import {constructResponseUrlWithIdParams} from '../../common/utils/urlFormatter';
import {RESPONSE_TASK_LIST_URL} from '../urls';
import {AppRequest} from 'common/models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';

export const languagePreferenceGuard = (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    try {
      const caseId = getRouteParam(req, 'id');
      const claim = await getResponseClaimById(<AppRequest>req, caseId);
      if (claim.claimBilingualLanguagePreference) {
        res.redirect(constructResponseUrlWithIdParams(req.params.id, RESPONSE_TASK_LIST_URL));
      } else {
        next();
      }
    } catch (error) {
      next(error);
    }
  })();
};
