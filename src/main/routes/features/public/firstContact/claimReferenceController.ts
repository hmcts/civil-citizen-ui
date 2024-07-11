import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {GenericForm} from 'form/models/genericForm';
import {
  FIRST_CONTACT_PIN_URL,
  FIRST_CONTACT_CLAIM_REFERENCE_URL,
  DASHBOARD_URL,
} from '../../../../routes/urls';
import {ClaimReference} from '../../../../common/models/firstContact/claimReference';
import { AppSession } from 'common/models/AppRequest';
import { saveFirstContactData } from 'services/firstcontact/firstcontactService';
import {CivilServiceClient} from 'client/civilServiceClient';
import config from 'config';

const claimReferenceController = Router();
const claimReferenceViewPath = 'features/public/firstContact/claim-reference';
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const ocmcBaseUrl = config.get<string>('services.cmc.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

claimReferenceController.get(FIRST_CONTACT_CLAIM_REFERENCE_URL, (req: Request, res: Response) => {
  res.render(claimReferenceViewPath, { form: new GenericForm(new ClaimReference(req.body.claimReferenceValue)) });
});

claimReferenceController.post(FIRST_CONTACT_CLAIM_REFERENCE_URL, (async (req: Request, res: Response, next: NextFunction) => {
  const firstContactClaimReference = new ClaimReference(req.body.claimReferenceValue);
  const form = new GenericForm(firstContactClaimReference);
  await form.validate();
  if (form.hasErrors()) {
    res.render(claimReferenceViewPath, {form});
  } else {
    try {
      req.session = saveFirstContactData(req.session as AppSession, {claimReference: req.body.claimReferenceValue});
      if (req.body.claimReferenceValue?.includes('MC') && await civilServiceClient.isOcmcDefendantLinked(req.body.claimReferenceValue)) {
        res.redirect(ocmcBaseUrl + DASHBOARD_URL);
      } else if (await civilServiceClient.isDefendantLinked(req.body.claimReferenceValue)) {
        res.redirect(DASHBOARD_URL);
      } else {
        res.redirect(FIRST_CONTACT_PIN_URL);
      }
    } catch (error) {
      next(error);
    }
  }
}) as RequestHandler);

export default claimReferenceController;
