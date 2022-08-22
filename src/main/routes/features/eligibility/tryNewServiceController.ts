import * as express from 'express';
import {BASE_ELIGIBILITY_URL, ELIGIBILITY_CLAIM_VALUE_URL} from '../../urls';

const tryNewServiceController = express.Router();
const tryNewServiceViewPath = 'features/eligibility/try-new-service';

tryNewServiceController.get(BASE_ELIGIBILITY_URL, async (req:express.Request, res:express.Response) => {
  res.render(tryNewServiceViewPath,
    {urlNextView: ELIGIBILITY_CLAIM_VALUE_URL});
});

export default tryNewServiceController;
