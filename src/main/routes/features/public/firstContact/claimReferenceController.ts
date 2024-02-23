import {Request, Response, Router} from 'express';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {
  FIRST_CONTACT_PIN_URL,
  FIRST_CONTACT_CLAIM_REFERENCE_URL,
} from '../../../../routes/urls';
import {ClaimReference} from '../../../../common/models/firstContact/claimReference';
import { AppSession } from 'common/models/AppRequest';

const claimReferenceController = Router();
const claimReferenceViewPath = 'features/public/firstContact/claim-reference';

claimReferenceController.get(FIRST_CONTACT_CLAIM_REFERENCE_URL, (req: Request, res: Response) => {
  const sessionData = req.session as AppSession;
  const firstContactClaimReference = sessionData.firstContact?.claimReference;
  res.render(claimReferenceViewPath,{form: new GenericForm(new ClaimReference(firstContactClaimReference))});
});

claimReferenceController.post(FIRST_CONTACT_CLAIM_REFERENCE_URL, async (req: Request, res: Response) => {
  const firstContactClaimReference = new ClaimReference(req.body.claimReferenceValue);
  const form = new GenericForm(firstContactClaimReference);
  await form.validate();
  if (form.hasErrors()) {
    res.render(claimReferenceViewPath, {form});
  } else {
    const sessionData = req.session as AppSession;
    sessionData.firstContact = { claimReference: req.body.claimReferenceValue };
    req.session = sessionData;
    res.redirect(FIRST_CONTACT_PIN_URL);
  }
});

export default claimReferenceController;
