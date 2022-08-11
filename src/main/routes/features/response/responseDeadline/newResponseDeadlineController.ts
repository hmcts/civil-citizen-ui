import * as express from 'express';
import {
  AGREED_T0_MORE_TIME_URL, CLAIM_TASK_LIST_URL,
  NEW_RESPONSE_DEADLINE_URL,
} from '../../../urls';
import {AppRequest} from '../../../../common/models/AppRequest';
import {formatDateToFullDate} from '../../../../common/utils/dateUtils';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {
  getClaimWithExtendedResponseDeadline,
  submitExtendedResponseDeadline,
} from '../../../../services/features/response/responseDeadline/extendResponseDeadlineService';

const newResponseDeadlineController = express.Router();
const newResponseDeadlineViewPath = 'features/response/responseDeadline/new-response-deadline';

newResponseDeadlineController
  .get(NEW_RESPONSE_DEADLINE_URL, async function (req: AppRequest, res, next: express.NextFunction) {
    try {
      const claim = await getClaimWithExtendedResponseDeadline(req.params.id, req);
      res.render(newResponseDeadlineViewPath, {
        claimantName: claim.getClaimantName(),
        responseDeadline: formatDateToFullDate(claim.respondentSolicitor1AgreedDeadlineExtension),
        backUrl: constructResponseUrlWithIdParams(req.params.id, AGREED_T0_MORE_TIME_URL),
      });
    } catch (error) {
      next(error);
    }
  })
  .post(NEW_RESPONSE_DEADLINE_URL, async (req: AppRequest, res, next: express.NextFunction) => {
    try {
      await submitExtendedResponseDeadline(req.params.id, req);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL));
    } catch (error) {
      next(error);
    }
  });

export default newResponseDeadlineController;
