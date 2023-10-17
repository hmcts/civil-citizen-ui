import {NextFunction, Response, Router} from 'express';
import {CITIZEN_PAYMENT_DATE_URL, CITIZEN_PAYMENT_OPTION_URL, RESPONSE_TASK_LIST_URL} from '../../../../../urls';
import {PaymentOption} from '../../../../../../common/form/models/admission/paymentOption/paymentOption';
import {
  getPaymentOptionForm,
  savePaymentOptionData,
} from '../../../../../../services/features/response/admission/paymentOptionService';
import {constructResponseUrlWithIdParams} from '../../../../../../common/utils/urlFormatter';
import {ResponseType} from '../../../../../../common/form/models/responseType';
import {GenericForm} from '../../../../../../common/form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';

const paymentOptionController = Router();
const citizenPaymentOptionViewPath = 'features/response/admission/payment-option';

function renderView(form: GenericForm<PaymentOption>, res: Response) {
  res.render(citizenPaymentOptionViewPath, {form});
}

function redirectToNextPage(claimId: string, form: PaymentOption, res: Response) {
  if (form.paymentOptionBySetDateSelected()) {
    res.redirect(constructResponseUrlWithIdParams(claimId, CITIZEN_PAYMENT_DATE_URL));
  } else {
    res.redirect(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
  }
}

paymentOptionController.get(CITIZEN_PAYMENT_OPTION_URL, async (req, res, next: NextFunction) => {
  try {
    const paymentOption = await getPaymentOptionForm(generateRedisKey(<AppRequest>req), ResponseType.FULL_ADMISSION);
    renderView(new GenericForm(paymentOption), res);
  } catch (error) {
    next(error);
  }
});

paymentOptionController.post(CITIZEN_PAYMENT_OPTION_URL, async (req, res, next: NextFunction) => {
  const paymentOption = new PaymentOption(req.body.paymentType);
  const form = new GenericForm(paymentOption);
  try {
    await form.validate();
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await savePaymentOptionData(generateRedisKey(<AppRequest>req), paymentOption, ResponseType.FULL_ADMISSION);
      redirectToNextPage(req.params.id, paymentOption, res);
    }
  } catch (error) {
    next(error);
  }
});

export default paymentOptionController;
