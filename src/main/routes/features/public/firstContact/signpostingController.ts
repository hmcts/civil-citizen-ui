import {Request, Response, Router} from 'express';
import {
  FIRST_CONTACT_SIGNPOSTING_URL,
  FIRST_CONTACT_CLAIM_REFERENCE_URL,
} from '../../../urls';

const signpostingController = Router();

signpostingController.get(FIRST_CONTACT_SIGNPOSTING_URL, (req: Request, res: Response) => {
  res.render('features/public/firstContact/signposting', {claimReferenceUrl: FIRST_CONTACT_CLAIM_REFERENCE_URL});
});

export default signpostingController;
