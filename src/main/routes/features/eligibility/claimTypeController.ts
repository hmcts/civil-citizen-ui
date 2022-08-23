import * as express from 'express';
import {GenericForm} from '../../../common/form/models/genericForm';
import {
  ELIGIBILITY_CLAIM_TYPE_URL,
  NOT_ELIGIBLE_FOR_THIS_SERVICE_URL,
  ELIGIBILITY_CLAIMANT_ADDRESS_URL,
} from '../../../routes/urls';
import {ClaimType} from '../../../common/models/eligibility/claimType';
import {ClaimTypeOptions} from '../../../common/models/eligibility/claimTypeOptions';
import {constructUrlWithNotEligibleReson} from '../../../common/utils/urlFormatter';
import {NotEligibleReason} from '../../../common/form/models/eligibility/NotEligibleReason';

const claimTypeController = express.Router();
const claimTypeViewPath = 'features/eligibility/claim-type';

claimTypeController.get(ELIGIBILITY_CLAIM_TYPE_URL, (req: express.Request, res: express.Response) => {
  const claimType = req.cookies?.eligibility?.claimType;
  const form = new GenericForm(new ClaimType(claimType));
  res.render(claimTypeViewPath, { form });
});

claimTypeController.post(ELIGIBILITY_CLAIM_TYPE_URL, async (req: express.Request, res: express.Response) => {
  const claimType = new ClaimType(req.body.claimType);
  const form = new GenericForm(ClaimType);
  await form.validate();
  if (form.hasErrors()) {
    res.render(claimTypeViewPath, { form });
  } else {
    const cookie = req.cookies['eligibility'] ? req.cookies['eligibility'] : {};
    cookie.claimType = req.body.claimType;
    res.cookie('eligibility', cookie);
    switch (claimType.option) {
      case ClaimTypeOptions.MORE_THAN_ONE_PERSON_OR_ORGANISATION:
        res.redirect(constructUrlWithNotEligibleReson(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, NotEligibleReason.CLAIM_TYPE_MORE_THAN_ONE));
        break;
      case ClaimTypeOptions.JUST_MYSELF:
        res.redirect(ELIGIBILITY_CLAIMANT_ADDRESS_URL);
        break;
      case ClaimTypeOptions.A_CLIENT:
        res.redirect(constructUrlWithNotEligibleReson(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, NotEligibleReason.CLAIM_TYPE_A_CLIENT));
        break;
    }
  }
},
);

export default claimTypeController;
