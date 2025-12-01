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
import { isCUIReleaseTwoEnabled } from 'app/auth/launchdarkly/launchDarklyClient';

const newResponseDeadlineController = Router();
const newResponseDeadlineViewPath = 'features/response/responseDeadline/new-response-deadline';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('newResponseDeadlineController');

newResponseDeadlineController
  .get(NEW_RESPONSE_DEADLINE_URL, (async (req: AppRequest, res, next: NextFunction) => {
    try {
      const claim = await getClaimWithExtendedResponseDeadline(req);
      const lang = req.query.lang ? req.query.lang : req.cookies.lang;
      const isReleaseTwoEnabled = await isCUIReleaseTwoEnabled();
      res.render(newResponseDeadlineViewPath, {
        claimantName: claim.getClaimantFullName(),
        responseDeadline: formatDateToFullDate(claim.responseDeadline.calculatedResponseDeadline, lang),
        backUrl: constructResponseUrlWithIdParams(req.params.id, AGREED_TO_MORE_TIME_URL),
        isReleaseTwoEnabled,
      });
    } catch (error) {
      logger.error(`Error when GET : new response deadline - ${error.message}`);
      next(error);
    }
  }) as RequestHandler)
  .post(NEW_RESPONSE_DEADLINE_URL, (async (req: AppRequest, res, next: NextFunction) => {
    try {
      await submitExtendedResponseDeadline(req);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, RESPONSE_TASK_LIST_URL));
    } catch (error) {
      logger.error(`Error when POST : new respones deadline - ${error.message}`);
      next(error);
    }
  }) as RequestHandler);

export default newResponseDeadlineController;
