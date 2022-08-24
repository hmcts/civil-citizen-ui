import * as express from 'express';
import {
  ELIGIBILITY_GOVERNMENT_DEPARTMENT_URL,
  ELIGIBILITY_TENANCY_DEPOSIT_URL,
  NOT_ELIGIBLE_FOR_THIS_SERVICE_URL,
} from '../../../../routes/urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {GenericYesNo} from '../../../../common/form/models/genericYesNo';
import {YesNo} from '../../../../common/form/models/yesNo';
import {NotEligibleReason} from '../../../../common/form/models/eligibility/NotEligibleReason';
import {constructUrlWithNotEligibleReson} from '../../../../common/utils/urlFormatter';

const tenancyDepositController = express.Router();
const tenancyDepositViewPath = 'features/public/eligibility/tenancy-deposit';

function renderView(genericYesNoForm: GenericForm<GenericYesNo>, res: express.Response): void {
  const form = Object.assign(genericYesNoForm);
  form.option = genericYesNoForm.model.option;
  res.render(tenancyDepositViewPath, {form});
}

tenancyDepositController.get(ELIGIBILITY_TENANCY_DEPOSIT_URL, (req, res) => {
  const cookie = req.cookies['eligibility'] ? req.cookies['eligibility'] : {};
  const tenancyDeposit = cookie?.tenancyDeposit;
  const genericYesNoForm = new GenericForm(new GenericYesNo(tenancyDeposit));
  renderView(genericYesNoForm, res);
});

tenancyDepositController.post(ELIGIBILITY_TENANCY_DEPOSIT_URL, (req, res) => {
  const genericYesNoForm = new GenericForm(new GenericYesNo(req.body.option));
  genericYesNoForm.validateSync();
  if (genericYesNoForm.hasErrors()) {
    renderView(genericYesNoForm, res);
  } else {
    const cookie = req.cookies['eligibility'] ? req.cookies['eligibility'] : {};
    cookie.tenancyDeposit = genericYesNoForm.model.option;
    res.cookie('eligibility', cookie);
    genericYesNoForm.model.option === YesNo.YES
      ? res.redirect(constructUrlWithNotEligibleReson(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, NotEligibleReason.CLAIM_IS_FOR_TENANCY_DEPOSIT))
      : res.redirect(ELIGIBILITY_GOVERNMENT_DEPARTMENT_URL);
  }
});

export default tenancyDepositController;