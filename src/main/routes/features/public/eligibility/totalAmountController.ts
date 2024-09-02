import {Request, Response, Router} from 'express';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {
  ELIGIBILITY_CLAIM_VALUE_URL,
  NOT_ELIGIBLE_FOR_THIS_SERVICE_URL,
  ELIGIBILITY_SINGLE_DEFENDANT_URL,
} from '../../../../routes/urls';
import {TotalAmount} from '../../../../common/models/eligibility/totalAmount';
import {TotalAmountOptions} from '../../../../common/models/eligibility/totalAmountOptions';
import {constructUrlWithNotEligibleReason} from '../../../../common/utils/urlFormatter';
import {NotEligibleReason} from '../../../../common/form/models/eligibility/NotEligibleReason';

const totalAmountEligibilityController = Router();
const totalAmountViewPath = 'features/public/eligibility/total-amount';
const pageTitle = 'PAGES.ELIGIBILITY_TOTAL_AMOUNT.TITLE';

totalAmountEligibilityController.get(ELIGIBILITY_CLAIM_VALUE_URL, (req: Request, res: Response) => {
  const totalAmount = req.cookies?.eligibility?.totalAmount;
  res.render(totalAmountViewPath, { form: new GenericForm(new TotalAmount(totalAmount)), pageTitle});
});

totalAmountEligibilityController.post(ELIGIBILITY_CLAIM_VALUE_URL, async (req: Request, res: Response) => {
  const totalAmount = new TotalAmount(req.body.totalAmount);
  const form = new GenericForm(totalAmount);
  await form.validate();
  if (form.hasErrors()) {
    res.render(totalAmountViewPath, { form, pageTitle });
  } else {
    const cookie = req.cookies['eligibility'] ? req.cookies['eligibility'] : {};
    cookie.totalAmount = req.body.totalAmount;
    res.cookie('eligibility', cookie);
    switch (totalAmount.option) {
      case TotalAmountOptions.OVER_25000:
        res.redirect(constructUrlWithNotEligibleReason(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, NotEligibleReason.CLAIM_VALUE_OVER_25000));
        break;
      case TotalAmountOptions.LESS_25000:
        res.redirect(ELIGIBILITY_SINGLE_DEFENDANT_URL);
        break;
      case TotalAmountOptions.UNKNOWN:
        res.redirect(constructUrlWithNotEligibleReason(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, NotEligibleReason.CLAIM_VALUE_NOT_KNOWN));
        break;
    }
  }
},
);

export default totalAmountEligibilityController;
