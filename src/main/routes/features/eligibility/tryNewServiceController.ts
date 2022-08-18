import * as express from 'express';
import {ELIGIBILITY_URL, ELIGIBILITY_CLAIM_VALUE_URL} from '../../urls';

const tryNewServiceController = express.Router();
const tryNewServiceViewPath = 'features/eligibility/try-new-service';

tryNewServiceController.get(ELIGIBILITY_URL, async (_req, res, next: express.NextFunction) => {
  try {
    res.render(tryNewServiceViewPath);
  } catch (error) {
    next(error);
  }
});

tryNewServiceController.post(ELIGIBILITY_URL, async (req, res, next: express.NextFunction) => {
  try {
    res.redirect(ELIGIBILITY_CLAIM_VALUE_URL);
  } catch (error) {
    next(error);
  }
});

export default tryNewServiceController;
