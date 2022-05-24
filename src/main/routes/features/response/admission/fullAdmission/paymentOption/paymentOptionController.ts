import * as express from 'express';
import {
  CITIZEN_PAYMENT_DATE_URL,
  CITIZEN_PAYMENT_OPTION_URL,
  CITIZEN_REPAYMENT_PLAN,
  CLAIM_TASK_LIST_URL,
} from '../../../../../urls';
import PaymentOption from '../../../../../../common/form/models/admission/fullAdmission/paymentOption/paymentOption';
import PaymentOptionType
  from '../../../../../../common/form/models/admission/fullAdmission/paymentOption/paymentOptionType';
import {validateForm} from '../../../../../../common/form/validators/formValidator';
import {
  getPaymentOptionForm,
  savePaymentOptionData,
} from '../../../../../../modules/admission/fullAdmission/paymentOption/paymentOptionService';
import {constructResponseUrlWithIdParams} from '../../../../../../common/utils/urlFormatter';

const paymentOptionController = express.Router();
const citizenPaymentOptionViewPath = 'features/response/admission/fullAdmission/paymentOption/payment-option';

function renderView(form: PaymentOption, res: express.Response) {
  res.render(citizenPaymentOptionViewPath, {form: form, PaymentOptionType: PaymentOptionType});
}

function redirectToNextPage(claimId: string, form: PaymentOption, res: express.Response) {
  if (form.paymentOptionBySetDateSelected()) {
    res.redirect(constructResponseUrlWithIdParams(claimId, CITIZEN_PAYMENT_DATE_URL));
  } else if (form.paymentOptionByInstallmentsSelected()) {
    res.redirect(constructResponseUrlWithIdParams(claimId, CITIZEN_REPAYMENT_PLAN));
  } else {
    res.redirect(constructResponseUrlWithIdParams(claimId, CLAIM_TASK_LIST_URL));
  }
}

paymentOptionController.get(CITIZEN_PAYMENT_OPTION_URL, async (req, res) => {
  try {
    const form = await getPaymentOptionForm(req.params.id);
    renderView(form, res);
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

paymentOptionController.post(CITIZEN_PAYMENT_OPTION_URL, async (req, res) => {
  const form = new PaymentOption(req.body.paymentType);
  try {
    await validateForm(form);
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await savePaymentOptionData(req.params.id, form);
      redirectToNextPage(req.params.id, form, res);
    }
  } catch (error) {
    res.status(500).send({error: error.message});
  }

});

export default paymentOptionController;
