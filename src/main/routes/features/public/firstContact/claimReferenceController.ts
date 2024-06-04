import {Request, RequestHandler, Response, Router} from 'express';
import {GenericForm} from 'form/models/genericForm';
import {
  FIRST_CONTACT_PIN_URL,
  FIRST_CONTACT_CLAIM_REFERENCE_URL,
} from '../../../../routes/urls';
import {ClaimReference} from '../../../../common/models/firstContact/claimReference';
import { AppSession } from 'common/models/AppRequest';
import { saveFirstContactData } from 'services/firstcontact/firstcontactService';

const claimReferenceController = Router();
const claimReferenceViewPath = 'features/public/firstContact/claim-reference';

claimReferenceController.get(FIRST_CONTACT_CLAIM_REFERENCE_URL, (req: Request, res: Response) => {
  res.render(claimReferenceViewPath, { form: new GenericForm(new ClaimReference(req.body.claimReferenceValue)) });
});

claimReferenceController.post(FIRST_CONTACT_CLAIM_REFERENCE_URL, (async (req: Request, res: Response) => {
  const firstContactClaimReference = new ClaimReference(req.body.claimReferenceValue);
  const form = new GenericForm(firstContactClaimReference);
  await form.validate();
  if (form.hasErrors()) {
    res.render(claimReferenceViewPath, {form});
  } else {
    req.session = saveFirstContactData(req.session as AppSession, { claimReference: req.body.claimReferenceValue });
    res.redirect(FIRST_CONTACT_PIN_URL);
  }
}) as RequestHandler);

export default claimReferenceController;
