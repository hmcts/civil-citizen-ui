import {NextFunction, Request, Response, Router} from 'express';
import {NOT_ELIGIBLE_FOR_THIS_SERVICE_URL} from '../../../urls';
import {convertToNotEligibleReason} from '../../../../common/utils/notEligibleReasonConvertor';

const notEligibleController = Router();
const notEligibleControllerViewPath = 'features/public/eligibility/not-eligible';

notEligibleController
  .get(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, (req: Request, res: Response, next: NextFunction) => {
    try {
      res.render(notEligibleControllerViewPath, { reason: convertToNotEligibleReason(req.query.reason as string), pageTitle: 'PAGES.NOT_ELIGIBLE_FOR_SERVICE.PAGE_TITLE' });
    } catch (error) {
      next(error);
    }
  });

export default notEligibleController;
