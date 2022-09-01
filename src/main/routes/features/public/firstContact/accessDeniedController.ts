import * as express from 'express';
import {
  FIRST_CONTACT_ACCESS_DENIED,
  FIRST_CONTACT_CLAIM_REFERENCE,
} from '../../../../routes/urls';

const accessDeniedController = express.Router();
const accessDeniedControllerViewPath = 'features/public/firstContact/access-denied';

accessDeniedController.get(FIRST_CONTACT_ACCESS_DENIED, (req, res) => {
  res.render(accessDeniedControllerViewPath, {claimReferenceUrl: FIRST_CONTACT_CLAIM_REFERENCE});
});

export default accessDeniedController;
