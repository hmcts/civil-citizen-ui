import * as express from 'express';
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

const totalAmountController = express.Router();
const totalAmountViewPath = 'features/public/eligibility/total-amount';

totalAmountController.get(ELIGIBILITY_CLAIM_VALUE_URL, (req: express.Request, res: express.Response) => {
  const totalAmount = req.cookies?.eligibility?.totalAmount;
  const form = new GenericForm(new TotalAmount(totalAmount));
  res.render(totalAmountViewPath, { form });
});

totalAmountController.post(ELIGIBILITY_CLAIM_VALUE_URL, async (req: express.Request, res: express.Response) => {
  const totalAmount = new TotalAmount(req.body.totalAmount);
  const form = new GenericForm(totalAmount);
  await form.validate();
  if (form.hasErrors()) {
    res.render(totalAmountViewPath, { form });
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

export default totalAmountController;
