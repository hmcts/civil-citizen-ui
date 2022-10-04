import * as express from 'express';
import {
  FIRST_CONTACT_ACCESS_DENIED_URL,
  FIRST_CONTACT_CLAIM_REFERENCE_URL,
} from '../../../../routes/urls';

const accessDeniedController = express.Router();

accessDeniedController.get(FIRST_CONTACT_ACCESS_DENIED_URL, (req, res) => {
  res.render('features/public/firstContact/access-denied', {claimReferenceUrl: FIRST_CONTACT_CLAIM_REFERENCE_URL});
});

export default accessDeniedController;
