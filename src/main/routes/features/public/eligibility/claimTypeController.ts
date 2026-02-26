import {Request, Response, Router} from 'express';
import {GenericForm} from 'form/models/genericForm';
import {
  ELIGIBILITY_CLAIM_TYPE_URL,
  NOT_ELIGIBLE_FOR_THIS_SERVICE_URL,
  ELIGIBILITY_CLAIMANT_ADDRESS_URL,
} from 'routes/urls';
import {ClaimType} from 'models/eligibility/claimType';
import {ClaimTypeOptions} from 'models/eligibility/claimTypeOptions';
import {constructUrlWithNotEligibleReason} from 'common/utils/urlFormatter';
import {NotEligibleReason} from 'form/models/eligibility/NotEligibleReason';

const claimTypeController = Router();
const claimTypeViewPath = 'features/public/eligibility/claim-type';

claimTypeController.get(ELIGIBILITY_CLAIM_TYPE_URL, (req: Request, res: Response) => {
  const claimType = req.cookies?.eligibility?.claimType;
  const form = new GenericForm(new ClaimType(claimType));
  res.render(claimTypeViewPath, { form, pageTitle: 'PAGES.ELIGIBILITY_CLAIM_TYPE.TITLE'});
});

claimTypeController.post(ELIGIBILITY_CLAIM_TYPE_URL, async (req: Request, res: Response) => {
  const claimType = new ClaimType(req.body.claimType, 'ERRORS.CLAIM_TYPE_REQUIRED');
  const form = new GenericForm(claimType);
  await form.validate();
  if (form.hasErrors()) {
    res.render(claimTypeViewPath, { form });
  } else {
    const cookie = req.cookies['eligibility'] ? req.cookies['eligibility'] : {};
    cookie.claimType = req.body.claimType;
    res.cookie('eligibility', cookie);
    switch (claimType.option) {
      case ClaimTypeOptions.MORE_THAN_ONE_PERSON_OR_ORGANISATION:
        res.redirect(constructUrlWithNotEligibleReason(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, NotEligibleReason.MULTIPLE_CLAIMANTS));
        break;
      case ClaimTypeOptions.JUST_MYSELF:
        res.redirect(ELIGIBILITY_CLAIMANT_ADDRESS_URL);
        break;
      case ClaimTypeOptions.A_CLIENT:
        res.redirect(constructUrlWithNotEligibleReason(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, NotEligibleReason.CLAIM_ON_BEHALF));
        break;
    }
  }
},
);

export default claimTypeController;
