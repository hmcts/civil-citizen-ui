import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  CITIZEN_PA_PAYMENT_DATE_URL,
  CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL,
  RESPONSE_TASK_LIST_URL,
} from 'routes/urls';
import {PaymentOption} from 'form/models/admission/paymentOption/paymentOption';
import {
  getPaymentOptionForm,
  savePaymentOptionData,
} from 'services/features/response/admission/paymentOptionService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getResponseClaimById} from 'modules/draft-store/response/responseDraftStoreService';
import {Claim} from 'models/claim';
import {ResponseType} from 'form/models/responseType';
import {GenericForm} from 'form/models/genericForm';
import {PartAdmitGuard} from 'routes/guards/partAdmitGuard';
import {AppRequest} from 'common/models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';

const partialAdmissionPaymentOptionController = Router();
const citizenPaymentOptionViewPath = 'features/response/admission/payment-option';

function renderView(form: GenericForm<PaymentOption>, res: Response, amount: number) {
  res.render(citizenPaymentOptionViewPath, {form, amount, responseType: ResponseType.PART_ADMISSION});
}

function redirectToNextPage(claimId: string, form: PaymentOption, res: Response) {
  if (form.paymentOptionBySetDateSelected()) {
    res.redirect(constructResponseUrlWithIdParams(claimId, CITIZEN_PA_PAYMENT_DATE_URL));
  } else {
    res.redirect(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
  }
}

let admittedPaymentAmount: number;

partialAdmissionPaymentOptionController.get(CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL, PartAdmitGuard.apply(RESPONSE_TASK_LIST_URL), (async (req, res, next: NextFunction) => {
  const caseId = getRouteParam(req, 'id');
  try {
    const claim: Claim = await getResponseClaimById(req as unknown as AppRequest, caseId);
    if (!claim.partialAdmissionPaymentAmount() || !claim.isPartialAdmission()) {
      res.redirect(constructResponseUrlWithIdParams(caseId, RESPONSE_TASK_LIST_URL));
    } else {
      const paymentOption = await getPaymentOptionForm(claim, ResponseType.PART_ADMISSION);
      admittedPaymentAmount = claim.partialAdmissionPaymentAmount();
      renderView(new GenericForm(paymentOption), res, admittedPaymentAmount);
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

partialAdmissionPaymentOptionController.post(CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL, (async (req, res, next: NextFunction) => {
  try {
    const claimId = getRouteParam(req, 'id');
    const paymentOption = new PaymentOption(req.body.paymentType);
    const form = new GenericForm(paymentOption);
    await form.validate();
    if (form.hasErrors()) {
      renderView(form, res, admittedPaymentAmount);
    } else {
      await savePaymentOptionData(<AppRequest>req, form.model, ResponseType.PART_ADMISSION);
      redirectToNextPage(claimId, form.model, res);
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default partialAdmissionPaymentOptionController;
