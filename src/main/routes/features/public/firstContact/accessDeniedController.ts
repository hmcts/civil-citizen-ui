import * as express from 'express';
import {
  FIRST_CONTACT_ACCESS_DENIED_URL,
  FIRST_CONTACT_CLAIM_REFERENCE_URL,
} from '../../../../routes/urls';

const accessDeniedController = express.Router();
const accessDeniedControllerViewPath = 'features/public/firstContact/access-denied';

accessDeniedController.get(FIRST_CONTACT_ACCESS_DENIED_URL, (req, res) => {
  res.render(accessDeniedControllerViewPath, {claimReferenceUrl: FIRST_CONTACT_CLAIM_REFERENCE_URL});
});

export default accessDeniedController;
