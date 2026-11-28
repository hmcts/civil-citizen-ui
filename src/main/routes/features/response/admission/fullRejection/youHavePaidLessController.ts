import {NextFunction, RequestHandler, Router} from 'express';
import {CITIZEN_FULL_REJECTION_YOU_PAID_LESS_URL, RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getResponseClaimById} from 'modules/draft-store/response/responseDraftStoreService';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {AppRequest} from 'common/models/AppRequest';

const youHavePaidLessController = Router();
const youHavePaidLessViewPath = 'features/response/admission/fullRejection/you-have-paid-less';

youHavePaidLessController.get(CITIZEN_FULL_REJECTION_YOU_PAID_LESS_URL, (async (req, res, next: NextFunction) => {
  try {
    const caseId = getRouteParam(req, 'id');
    const claim = await getResponseClaimById(<AppRequest>req, caseId);
    res.render(youHavePaidLessViewPath, {claimantName: claim.getClaimantFullName()});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

youHavePaidLessController.post(CITIZEN_FULL_REJECTION_YOU_PAID_LESS_URL, (req, res) => {
  const caseId = getRouteParam(req, 'id');
  res.redirect(constructResponseUrlWithIdParams(caseId, RESPONSE_TASK_LIST_URL));
});

export default youHavePaidLessController;
