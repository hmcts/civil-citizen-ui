import {Request, RequestHandler, Response, Router} from 'express';
import {GenericForm} from 'form/models/genericForm';
import {
  FIRST_CONTACT_PIN_URL,
  FIRST_CONTACT_CLAIM_REFERENCE_URL,
} from 'routes/urls';
import {ClaimReference} from 'models/firstContact/claimReference';

const claimReferenceController = Router();
const claimReferenceViewPath = 'features/public/firstContact/claim-reference';

claimReferenceController.get(FIRST_CONTACT_CLAIM_REFERENCE_URL,( (req: Request, res: Response) => {
  const firstContactClaimReference = req.cookies?.firstContact?.claimReference;
  res.render(claimReferenceViewPath,{form: new GenericForm(new ClaimReference(firstContactClaimReference))});
}) as RequestHandler);

claimReferenceController.post(FIRST_CONTACT_CLAIM_REFERENCE_URL, (async (req: Request, res: Response) => {
  const firstContactClaimReference = new ClaimReference(req.body.claimReferenceValue);
  const form = new GenericForm(firstContactClaimReference);
  await form.validate();
  if (form.hasErrors()) {
    res.render(claimReferenceViewPath, {form});
  } else {
    const cookie = req.cookies['firstContact'] ? req.cookies['firstContact'] : {};
    cookie.claimReference = req.body.claimReferenceValue;
    res.cookie('firstContact', cookie);
    res.redirect(FIRST_CONTACT_PIN_URL);
  }
}) as RequestHandler);

export default claimReferenceController;
