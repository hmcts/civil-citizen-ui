import {Response, Router} from 'express';
import {
  ELIGIBILITY_KNOWN_CLAIM_AMOUNT_URL,
  NOT_ELIGIBLE_FOR_THIS_SERVICE_URL,
  ELIGIBILITY_SINGLE_DEFENDANT_URL,
} from '../../../../routes/urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {YesNo} from '../../../../common/form/models/yesNo';
import {constructUrlWithNotEligibleReason} from 'common/utils/urlFormatter';
import {NotEligibleReason} from 'form/models/eligibility/NotEligibleReason';
import {GenericYesNoKnownClaimAmount} from 'form/models/genericYesNoKnownClaimAmount';

const knownClaimAmountController = Router();
const knownAmountEligibilityViewPath = 'features/public/eligibility/known-claim-amount';

function renderView(form: GenericForm<GenericYesNoKnownClaimAmount>, res: Response): void {
  res.render(knownAmountEligibilityViewPath, {form, pageTitle: 'PAGES.ELIGIBILITY_KNOWN_CLAIM_AMOUNT.PAGE_TITLE'});
}

knownClaimAmountController.get(ELIGIBILITY_KNOWN_CLAIM_AMOUNT_URL, (req, res) => {
  const cookie = req.cookies['eligibility'] ? req.cookies['eligibility'] : {};
  const knownClaimAmount = cookie.eligibility?.knownClaimAmount;
  const genericYesNoForm = new GenericForm(new GenericYesNoKnownClaimAmount(knownClaimAmount));
  renderView(genericYesNoForm, res);
});

knownClaimAmountController.post(ELIGIBILITY_KNOWN_CLAIM_AMOUNT_URL, (req, res) => {
  const genericYesNoForm = new GenericForm(new GenericYesNoKnownClaimAmount(req.body.option));
  genericYesNoForm.validateSync();

  if (genericYesNoForm.hasErrors()) {
    renderView(genericYesNoForm, res);
  } else {
    const cookie = req.cookies['eligibility'] ? req.cookies['eligibility'] : {};
    cookie.knownClaimAmount = genericYesNoForm.model.option;
    res.cookie('eligibility', cookie);
    genericYesNoForm.model.option === YesNo.YES
      ? res.redirect(ELIGIBILITY_SINGLE_DEFENDANT_URL)
      : res.redirect(constructUrlWithNotEligibleReason(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, NotEligibleReason.CLAIM_VALUE_NOT_KNOWN));
  }
});

export default knownClaimAmountController;
