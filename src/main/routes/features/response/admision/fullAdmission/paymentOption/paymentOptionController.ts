import * as express from 'express';
import {CITIZEN_PAYMENT_OPTION_URL} from '../../../../../urls';
import PaymentOption from '../../../../../../common/form/models/admission/fullAdmission/paymentOption/paymentOption';
import PaymentOptionType
  from '../../../../../../common/form/models/admission/fullAdmission/paymentOption/paymentOptionType';
import {validateForm} from 'common/form/validators/formValidator';

const router = express.Router();
const citizenPaymentOptionViewPath = 'features/response/admission/fullAdmission/paymentOption/payment-option';

function renderView(form: PaymentOption, res: express.Response) {
  res.render(citizenPaymentOptionViewPath, {form: form, PaymentOptionType: PaymentOptionType});
}

router.get(CITIZEN_PAYMENT_OPTION_URL, (req, res) => {
  renderView(new PaymentOption(), res);
});

router.post(CITIZEN_PAYMENT_OPTION_URL, async (req, res) => {
  const form = new PaymentOption(req.body.paymentType);
  await validateForm(form);
  if (form.hasErrors()) {
    renderView(form, res);
  }
});

export default router;
