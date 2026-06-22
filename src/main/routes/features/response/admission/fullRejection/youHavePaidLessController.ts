import {NextFunction, RequestHandler, Router} from 'express';
import {CITIZEN_FULL_REJECTION_YOU_PAID_LESS_URL, RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';

const youHavePaidLessController = Router();
const youHavePaidLessViewPath = 'features/response/admission/fullRejection/you-have-paid-less';

youHavePaidLessController.get(CITIZEN_FULL_REJECTION_YOU_PAID_LESS_URL, (async (req, res, next: NextFunction) => {
  try {
    const claim = await getCaseDataFromStore(generateRedisKey(<AppRequest>req));
    res.render(youHavePaidLessViewPath, {claimantName: claim.getClaimantFullName()});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

youHavePaidLessController.post(CITIZEN_FULL_REJECTION_YOU_PAID_LESS_URL, (req, res) => {
  const claimId = getRouteParam(req, 'id');
  res.redirect(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
});

export default youHavePaidLessController;
