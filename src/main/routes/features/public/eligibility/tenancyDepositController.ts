import {Response, Router} from 'express';
import {
  ELIGIBILITY_GOVERNMENT_DEPARTMENT_URL,
  ELIGIBILITY_TENANCY_DEPOSIT_URL,
  NOT_ELIGIBLE_FOR_THIS_SERVICE_URL,
} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';
import {NotEligibleReason} from 'form/models/eligibility/NotEligibleReason';
import {constructUrlWithNotEligibleReason} from 'common/utils/urlFormatter';

const tenancyDepositController = Router();
const tenancyDepositViewPath = 'features/public/eligibility/tenancy-deposit';

function renderView(form: GenericForm<GenericYesNo>, res: Response): void {
  res.render(tenancyDepositViewPath, {form, pageTitle: 'PAGES.TENANCY_DEPOSIT.TITLE'});
}

tenancyDepositController.get(ELIGIBILITY_TENANCY_DEPOSIT_URL, (req, res) => {
  const cookie = req.cookies['eligibility'] ? req.cookies['eligibility'] : {};
  const tenancyDeposit = cookie?.tenancyDeposit;
  const genericYesNoForm = new GenericForm(new GenericYesNo(tenancyDeposit));
  renderView(genericYesNoForm, res);
});

tenancyDepositController.post(ELIGIBILITY_TENANCY_DEPOSIT_URL, (req, res) => {
  const genericYesNoForm = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.TENANCY_DEPOSIT_REQUIRED'));
  genericYesNoForm.validateSync();
  if (genericYesNoForm.hasErrors()) {
    renderView(genericYesNoForm, res);
  } else {
    const cookie = req.cookies['eligibility'] ? req.cookies['eligibility'] : {};
    cookie.tenancyDeposit = genericYesNoForm.model.option;
    res.cookie('eligibility', cookie);
    genericYesNoForm.model.option === YesNo.YES
      ? res.redirect(constructUrlWithNotEligibleReason(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, NotEligibleReason.CLAIM_IS_FOR_TENANCY_DEPOSIT))
      : res.redirect(ELIGIBILITY_GOVERNMENT_DEPARTMENT_URL);
  }
});

export default tenancyDepositController;
