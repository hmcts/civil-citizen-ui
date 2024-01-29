import {NextFunction, Request, Response, Router} from 'express';

import {CLAIM_AMOUNT_URL, CLAIM_INTEREST_URL, NOT_ELIGIBLE_FOR_THIS_SERVICE_URL} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {AmountBreakdown} from 'form/models/claim/amount/amountBreakdown';

import {
  getClaimAmountBreakdownForm,
  saveClaimAmountBreakdownForm,
} from 'services/features/claim/amount/claimAmountBreakdownService';
import {AppRequest} from 'models/AppRequest';
import {constructUrlWithNotEligibleReason} from 'common/utils/urlFormatter';
import {NotEligibleReason} from 'form/models/eligibility/NotEligibleReason';
import {ClaimAmountRow} from 'form/models/claim/amount/claimAmountRow';

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
    const action = req.body.action;
    console.log(action);
    const form = new GenericForm(AmountBreakdown.fromObject(req.body));
    if (action === 'add_another-claimAmount') {
      const form2 = new GenericForm(AmountBreakdown.fromObject(req.body));
      form2.model.claimAmountRows.push(new ClaimAmountRow());
      renderView(form2, res);
    } else {
      form.validateSync();
      if (form.hasErrors()) {
        renderView(form, res);
      } else {
        if (form.model.isValidTotal()) {
          await saveAndRedirectToNextPage(<AppRequest>req, res, form.model);
        } else {
          res.redirect(constructUrlWithNotEligibleReason(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, NotEligibleReason.CLAIM_VALUE_OVER_25000));
        }
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
