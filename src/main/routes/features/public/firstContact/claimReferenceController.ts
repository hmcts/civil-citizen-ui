import * as express from 'express';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {
  FIRST_CONTACT_CLAIM_PIN_URL,
  FIRST_CONTACT_CLAIM_REFERENCE_URL,
} from '../../../../routes/urls';
import {ClaimReference} from '../../../../common/models/firstContact/claimReference';

const claimReferenceController = express.Router();
const claimReferenceViewPath = 'features/public/firstContact/claim-reference';

claimReferenceController.get(FIRST_CONTACT_CLAIM_REFERENCE_URL, (req: express.Request, res: express.Response) => {
  const firstContactClaimReference = req.cookies?.firstContact?.claimReference;
  const form = new GenericForm(new ClaimReference(firstContactClaimReference));
  res.render(claimReferenceViewPath,{form});
});

claimReferenceController.post(FIRST_CONTACT_CLAIM_REFERENCE_URL, async (req: express.Request, res: express.Response) => {
  const firstContactClaimReference = new ClaimReference(req.body.claimReferenceValue);
  const form = new GenericForm(firstContactClaimReference);
  await form.validate();
  if (form.hasErrors()) {
    res.render(claimReferenceViewPath, {form});
  } else {
    const cookie = req.cookies['firstContact'] ? req.cookies['firstContact'] : {};
    cookie.claimReference = req.body.claimReferenceValue;
    res.cookie('firstContact', cookie);
    res.redirect(FIRST_CONTACT_CLAIM_PIN_URL);
  }
},
);

export default claimReferenceController;
