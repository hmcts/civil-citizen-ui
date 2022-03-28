import * as express from 'express';
import {CITIZEN_PAYMENT_OPTION_URL} from '../../../../../urls';
import PaymentOption from '../../../../../../common/form/models/admission/fullAdmission/paymentOption/paymentOption';
import PaymentOptionType
  from '../../../../../../common/form/models/admission/fullAdmission/paymentOption/paymentOptionType';

const router = express.Router();
const citizenPaymentOptionViewPath = 'features/response/admission/fullAdmission/paymentOption/payment-option';

function renderView(form: PaymentOption, req: express.Response) {
  req.render(citizenPaymentOptionViewPath, {form: form, PaymentOptionType: PaymentOptionType});
}

router.get(CITIZEN_PAYMENT_OPTION_URL, (req, res) => {
  renderView(new PaymentOption(), res);
});

export default router;
