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

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('newResponseDeadlineController');

newResponseDeadlineController
  .get(NEW_RESPONSE_DEADLINE_URL, (async (req: AppRequest, res, next: NextFunction) => {
    try {
      const claimId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const claim = await getClaimWithExtendedResponseDeadline(req);
      const lang = req.query.lang ? req.query.lang : req.cookies.lang;
      res.render(newResponseDeadlineViewPath, {
        responseDeadline: formatDateToFullDate(claim.responseDeadline.calculatedResponseDeadline, lang),
        backUrl: constructResponseUrlWithIdParams(claimId, AGREED_TO_MORE_TIME_URL),
      });
    } catch (error) {
      logger.error(`Error when GET : new response deadline - ${error.message}`);
      next(error);
    }
  }) as RequestHandler)
  .post(NEW_RESPONSE_DEADLINE_URL, (async (req: AppRequest, res, next: NextFunction) => {
    try {
      const claimId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await submitExtendedResponseDeadline(req);
      res.redirect(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    } catch (error) {
      logger.error(`Error when POST : new respones deadline - ${error.message}`);
      next(error);
    }
  }) as RequestHandler);

export default newResponseDeadlineController;
