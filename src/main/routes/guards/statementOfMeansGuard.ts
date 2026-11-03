import {NextFunction, Request, Response} from 'express';
import {RESPONSE_TASK_LIST_URL} from '../../routes/urls';
import {getResponseClaimById} from 'modules/draft-store/response/responseDraftStoreService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {isNotPayImmediatelyResponse, isPaymentOptionExisting} from 'common/utils/taskList/tasks/taskListHelpers';
import {AppRequest} from 'common/models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('statementOfMeansGuard');

export const statementOfMeansGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const caseId = getRouteParam(req, 'id');
    const claim = await getResponseClaimById(<AppRequest>req, caseId);
    if (isPaymentOptionExisting(claim) && isNotPayImmediatelyResponse(claim)) {
      next();
    } else {
      logger.info('Redirecting to response task list from ', req.url);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, RESPONSE_TASK_LIST_URL));
    }
  } catch (error) {
    next(error);
  }
};
