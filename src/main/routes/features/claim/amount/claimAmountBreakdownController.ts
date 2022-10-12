import {Router, Response, Request, NextFunction} from 'express';

import {CLAIM_AMOUNT_URL, CLAIM_INTEREST_URL, NOT_ELIGIBLE_FOR_THIS_SERVICE_URL} from '../../../urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {AmountBreakdown} from '../../../../common/form/models/claim/amount/amountBreakdown';

import {
  getClaimAmountBreakdownForm,
  saveClaimAmountBreakdownForm,
} from '../../../../services/features/claim/amount/claimAmountBreakdownService';
import {AppRequest} from '../../../../common/models/AppRequest';
import {MAX_CLAIM_AMOUNT_TOTAL} from '../../../../common/form/validators/validationConstraints';
import {constructUrlWithNotEligibleReason} from '../../../../common/utils/urlFormatter';
import {NotEligibleReason} from '../../../../common/form/models/eligibility/NotEligibleReason';

const claimAmountBreakdownController = Router();
const viewPath = 'features/claim/amount/claim-amount-breakdown';

function renderView(form: GenericForm<AmountBreakdown>, res: Response) {
  res.render(viewPath, {form});
}

claimAmountBreakdownController.get(CLAIM_AMOUNT_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const userid = req.session?.user?.id;
    const form = new GenericForm<AmountBreakdown>(await getClaimAmountBreakdownForm(userid));
    renderView(form, res);
  } catch (error) {
    next(error);
  }
}).post(CLAIM_AMOUNT_URL, async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const form = new GenericForm(AmountBreakdown.fromObject(req.body));
    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      if (form.model.totalAmount() <= MAX_CLAIM_AMOUNT_TOTAL) {
        await saveAndRedirectToNextPage(<AppRequest>req, res, form.model);
      } else {
        res.redirect(constructUrlWithNotEligibleReason(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, NotEligibleReason.CLAIM_VALUE_OVER_25000));
      }
    }
  } catch (error) {
    next(error);
  }
});

const saveAndRedirectToNextPage = async (req: AppRequest, res: Response, amountBreakdown: AmountBreakdown) => {
  await saveClaimAmountBreakdownForm(req.session?.user?.id, amountBreakdown);
  res.redirect(CLAIM_INTEREST_URL);
};

export default claimAmountBreakdownController;
