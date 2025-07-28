import {NextFunction, RequestHandler, Response, Router} from 'express';
import {CITIZEN_PAYMENT_DATE_URL, CITIZEN_PAYMENT_OPTION_URL, RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {PaymentOption} from 'form/models/admission/paymentOption/paymentOption';
import {
  getPaymentOptionForm,
  savePaymentOptionData,
} from 'services/features/response/admission/paymentOptionService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {ResponseType} from 'form/models/responseType';
import {GenericForm} from 'form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {Claim} from 'models/claim';

const paymentOptionController = Router();
const citizenPaymentOptionViewPath = 'features/response/admission/payment-option';

function renderView(form: GenericForm<PaymentOption>, res: Response, claim?: Claim) {
  res.render(citizenPaymentOptionViewPath, {claim, form, responseType: ResponseType.FULL_ADMISSION});
}

function redirectToNextPage(claimId: string, form: PaymentOption, res: Response) {
  if (form.paymentOptionBySetDateSelected()) {
    res.redirect(constructResponseUrlWithIdParams(claimId, CITIZEN_PAYMENT_DATE_URL));
  } else {
    res.redirect(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
  }
}

paymentOptionController.get(CITIZEN_PAYMENT_OPTION_URL, (async (req, res, next: NextFunction) => {
  try {
    const claim = await getClaimById(req.params.id, req, true);
    const paymentOption = await getPaymentOptionForm(claim, ResponseType.FULL_ADMISSION);
    renderView(new GenericForm(paymentOption), res, claim);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

paymentOptionController.post(CITIZEN_PAYMENT_OPTION_URL, (async (req, res, next: NextFunction) => {
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
}) as RequestHandler);

export default paymentOptionController;
