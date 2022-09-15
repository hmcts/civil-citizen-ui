import * as express from 'express';
import {
  NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, ELIGIBILITY_CLAIMANT_ADDRESS_URL, ELIGIBILITY_TENANCY_DEPOSIT_URL,
} from '../../../../routes/urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {GenericYesNo} from '../../../../common/form/models/genericYesNo';
import {YesNo} from '../../../../common/form/models/yesNo';
import {constructUrlWithNotEligibleReason} from '../../../../common/utils/urlFormatter';
import {NotEligibleReason} from '../../../../common/form/models/eligibility/NotEligibleReason';

const claimantAddressEligibilityController = express.Router();
const claimantEligibilityViewPath = 'features/public/eligibility/claimant-address-eligibility';

function renderView(genericYesNoForm: GenericForm<GenericYesNo>, res: express.Response): void {
  const form = Object.assign(genericYesNoForm);
  form.option = genericYesNoForm.model.option;
  res.render(claimantEligibilityViewPath, {form});
}

claimantAddressEligibilityController.get(ELIGIBILITY_CLAIMANT_ADDRESS_URL, (req: express.Request, res: express.Response) => {
  const cookie = req.cookies['eligibility'] ? req.cookies['eligibility'] : {};
  const eligibleClaimantAddress = cookie.eligibleClaimantAddress;
  const genericYesNoForm = new GenericForm(new GenericYesNo(eligibleClaimantAddress));
  renderView(genericYesNoForm, res);
});

claimantAddressEligibilityController.post(ELIGIBILITY_CLAIMANT_ADDRESS_URL, async (req: express.Request, res: express.Response) => {
  const genericYesNoForm = new GenericForm(new GenericYesNo(req.body.option));
  await genericYesNoForm.validate();

  if (genericYesNoForm.hasErrors()) {
    renderView(genericYesNoForm, res);
  } else {
    const cookie = req.cookies['eligibility'] ? req.cookies['eligibility'] : {};
    cookie.eligibleClaimantAddress = genericYesNoForm.model.option;
    res.cookie('eligibility', cookie);
    genericYesNoForm.model.option === YesNo.YES
      ? res.redirect(ELIGIBILITY_TENANCY_DEPOSIT_URL)
      : res.redirect(constructUrlWithNotEligibleReason(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, NotEligibleReason.CLAIMANT_ADDRESS));
  }
});

export default claimantAddressEligibilityController;
