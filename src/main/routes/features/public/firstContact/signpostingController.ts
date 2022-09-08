import * as express from 'express';
import {
  FIRST_CONTACT_SIGNPOSTING_URL,
  FIRST_CONTACT_CLAIM_REFERENCE_URL,
} from '../../../urls';

const signpostingController = express.Router();
const signpostingViewPath = 'features/public/firstContact/signposting';

signpostingController.get(FIRST_CONTACT_SIGNPOSTING_URL, (req: express.Request, res: express.Response) => {
  res.render(signpostingViewPath, {claimReferenceUrl: FIRST_CONTACT_CLAIM_REFERENCE_URL});
});

export default signpostingController;
