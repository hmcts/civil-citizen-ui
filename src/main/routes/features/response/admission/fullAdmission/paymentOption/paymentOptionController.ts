import * as express from 'express';
import {CITIZEN_PAYMENT_DATE_URL, CITIZEN_PAYMENT_OPTION_URL, CLAIM_TASK_LIST_URL} from '../../../../../urls';
import PaymentOption from '../../../../../../common/form/models/admission/paymentOption/paymentOption';
import PaymentOptionType
  from '../../../../../../common/form/models/admission/paymentOption/paymentOptionType';
import {
  getPaymentOptionForm,
  savePaymentOptionData,
} from '../../../../../../services/features/response/admission/paymentOptionService';
import {constructResponseUrlWithIdParams} from '../../../../../../common/utils/urlFormatter';
import {ResponseType} from '../../../../../../common/form/models/responseType';
import {GenericForm} from '../../../../../../common/form/models/genericForm';

const paymentOptionController = express.Router();
const citizenPaymentOptionViewPath = 'features/response/admission/payment-option';

function renderView(form: GenericForm<PaymentOption>, res: express.Response) {
  res.render(citizenPaymentOptionViewPath, {form: form, PaymentOptionType: PaymentOptionType});
}

function redirectToNextPage(claimId: string, form: PaymentOption, res: express.Response) {
  if (form.paymentOptionBySetDateSelected()) {
    res.redirect(constructResponseUrlWithIdParams(claimId, CITIZEN_PAYMENT_DATE_URL));
  } else {
    res.redirect(constructResponseUrlWithIdParams(claimId, CLAIM_TASK_LIST_URL));
  }
}

paymentOptionController.get(CITIZEN_PAYMENT_OPTION_URL, async (req, res, next: express.NextFunction) => {
  try {
    const paymentOption = await getPaymentOptionForm(req.params.id, ResponseType.FULL_ADMISSION);
    renderView(new GenericForm(paymentOption), res);
  } catch (error) {
    next(error);
  }
});

paymentOptionController.post(CITIZEN_PAYMENT_OPTION_URL, async (req, res, next: express.NextFunction) => {
  const paymentOption = new PaymentOption(req.body.paymentType);
  const form = new GenericForm(paymentOption);
  try {
    await form.validate();
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await savePaymentOptionData(req.params.id, paymentOption, ResponseType.FULL_ADMISSION);
      redirectToNextPage(req.params.id, paymentOption, res);
    }
  } catch (error) {
    next(error);
  }
});

export default paymentOptionController;
