import * as express from 'express';
import {GenericForm} from '../../../common/form/models/genericForm';
import {
  ELIGIBILITY_CLAIM_VALUE_URL,
  ELIGIBILITY_NOT_ELIGIBLE_URL,
  ELIGIBILITY_SINGLE_DEFENDANT_URL,
} from '../../../routes/urls';
import {TotalAmount} from '../../../common/models/eligibility/totalAmount';
import {TotalAmountOptions} from '../../../common/models/eligibility/totalAmountOptions';

const totalAmountController = express.Router();
const totalAmountViewPath = 'features/eligibility/total-amount';

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
        res.redirect(ELIGIBILITY_NOT_ELIGIBLE_URL + '?reason=claim-value-over-25000');
        break;
      case TotalAmountOptions.LESS_25000:
        res.redirect(ELIGIBILITY_SINGLE_DEFENDANT_URL);
        break;
      case TotalAmountOptions.UNKNOW:
        res.redirect(ELIGIBILITY_NOT_ELIGIBLE_URL + '?reason=claim-value-not-known');
        break;
    }
  }
},
);

export default totalAmountController;
