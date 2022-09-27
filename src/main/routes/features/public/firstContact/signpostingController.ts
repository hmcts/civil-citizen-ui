import * as express from 'express';
import {
  FIRST_CONTACT_SIGNPOSTING_URL,
  FIRST_CONTACT_CLAIM_REFERENCE_URL,
} from '../../../urls';

const signpostingController = express.Router();

signpostingController.get(FIRST_CONTACT_SIGNPOSTING_URL, (req: express.Request, res: express.Response) => {
  res.render('features/public/firstContact/signposting', {claimReferenceUrl: FIRST_CONTACT_CLAIM_REFERENCE_URL});
});

export default signpostingController;
