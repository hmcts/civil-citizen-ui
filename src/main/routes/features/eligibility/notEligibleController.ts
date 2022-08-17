import * as express from 'express';
import {NOT_ELIGIBLE_FOR_THIS_SERVICE} from '../../urls';
import {convertToNotEligibleReason} from '../../../common/utils/notEligibleReasonConvertor';

const notEligibleController = express.Router();
const notEligibleControllerViewPath = 'features/eligibility/not-eligible';

notEligibleController
  .get(NOT_ELIGIBLE_FOR_THIS_SERVICE, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const reason = convertToNotEligibleReason(req.query.reason as string);
    try {
      res.render(notEligibleControllerViewPath, { reason });
    } catch (error) {
      next(error);
    }
  });

export default notEligibleController;
