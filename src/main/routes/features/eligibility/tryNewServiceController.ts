import * as express from 'express';
import {ELIGIBILITY_URL, ELIGIBILITY_CLAIM_VALUE_URL} from '../../urls';

const tryNewServiceController = express.Router();
const tryNewServiceViewPath = 'features/eligibility/try-new-service';

tryNewServiceController.get(ELIGIBILITY_URL, async (_req, res) => {
  res.render(tryNewServiceViewPath);
});

tryNewServiceController.post(ELIGIBILITY_URL, async (req, res) => {
  res.redirect(ELIGIBILITY_CLAIM_VALUE_URL);
});

export default tryNewServiceController;
