import * as express from 'express';
import {NOT_ELIGIBLE_FOR_THIS_SERVICE_URL} from '../../../urls';
import {convertToNotEligibleReason} from '../../../../common/utils/notEligibleReasonConvertor';

const notEligibleController = express.Router();
const notEligibleControllerViewPath = 'features/public/eligibility/not-eligible';

notEligibleController
  .get(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const reason = convertToNotEligibleReason(req.query.reason as string);
    try {
      res.render(notEligibleControllerViewPath, { reason });
    } catch (error) {
      next(error);
    }
  });

export default notEligibleController;
