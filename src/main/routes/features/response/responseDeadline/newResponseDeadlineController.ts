import {NextFunction, RequestHandler, Router} from 'express';
import {
  AGREED_TO_MORE_TIME_URL,
  RESPONSE_TASK_LIST_URL,
  NEW_RESPONSE_DEADLINE_URL,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  getClaimWithExtendedResponseDeadline,
  submitExtendedResponseDeadline,
} from 'services/features/response/responseDeadline/extendResponseDeadlineService';

const newResponseDeadlineController = Router();
const newResponseDeadlineViewPath = 'features/response/responseDeadline/new-response-deadline';

newResponseDeadlineController
  .get(NEW_RESPONSE_DEADLINE_URL, (async (req: AppRequest, res, next: NextFunction) => {
    try {
      const claim = await getClaimWithExtendedResponseDeadline(req);
      const lang = req.query.lang ? req.query.lang : req.cookies.lang;
      res.render(newResponseDeadlineViewPath, {
        claimantName: claim.getClaimantFullName(),
        responseDeadline: formatDateToFullDate(claim.responseDeadline.calculatedResponseDeadline, lang),
        backUrl: constructResponseUrlWithIdParams(req.params.id, AGREED_TO_MORE_TIME_URL),
      });
    } catch (error) {
      next(error);
    }
  }) as RequestHandler)
  .post(NEW_RESPONSE_DEADLINE_URL, (async (req: AppRequest, res, next: NextFunction) => {
    try {
      await submitExtendedResponseDeadline(req);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, RESPONSE_TASK_LIST_URL));
    } catch (error) {
      next(error);
    }
  }) as RequestHandler);

export default newResponseDeadlineController;
