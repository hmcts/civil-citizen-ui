import * as express from 'express';
import {ELIGIBILITY_HWF_ELIGIBLE_REFERENCE, SIGN_IN_URL} from '../../../urls';

const helpWithFeesCanUseServiceController = express.Router();
const helpWithFeesCanUseServiceViewPath = 'features/public/eligibility/help-with-fees-can-use-service';

helpWithFeesCanUseServiceController.get(ELIGIBILITY_HWF_ELIGIBLE_REFERENCE, async (req:express.Request, res:express.Response) => {
  res.render(helpWithFeesCanUseServiceViewPath,
    {urlNextView: SIGN_IN_URL});
});

export default helpWithFeesCanUseServiceController;
