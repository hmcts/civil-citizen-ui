import {NextFunction, Response, Router} from 'express';
import {
  CITIZEN_PA_PAYMENT_DATE_URL,
  CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL,
  RESPONSE_TASK_LIST_URL,
} from '../../../../urls';
import {PaymentOption} from '../../../../../common/form/models/admission/paymentOption/paymentOption';
import {
  getPaymentOptionForm,
  savePaymentOptionData,
} from '../../../../../services/features/response/admission/paymentOptionService';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {generateRedisKey, getCaseDataFromStore} from '../../../../../modules/draft-store/draftStoreService';
import {Claim} from '../../../../../common/models/claim';
import {ResponseType} from '../../../../../common/form/models/responseType';
import {GenericForm} from '../../../../../common/form/models/genericForm';
import {PartAdmitGuard} from '../../../../../routes/guards/partAdmitGuard';
import {AppRequest} from 'common/models/AppRequest';

const partialAdmissionPaymentOptionController = Router();
const citizenPaymentOptionViewPath = 'features/response/admission/payment-option';

function renderView(form: GenericForm<PaymentOption>, res: Response, amount: number) {
  res.render(citizenPaymentOptionViewPath, {form, amount});
}

function redirectToNextPage(claimId: string, form: PaymentOption, res: Response) {
  if (form.paymentOptionBySetDateSelected()) {
    res.redirect(constructResponseUrlWithIdParams(claimId, CITIZEN_PA_PAYMENT_DATE_URL));
  } else {
    res.redirect(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
  }
}

let admittedPaymentAmount: number;

partialAdmissionPaymentOptionController.get(CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL, PartAdmitGuard.apply(RESPONSE_TASK_LIST_URL), async (req, res, next: NextFunction) => {
  const claimId = generateRedisKey(<AppRequest>req);
  try {
    const claim: Claim = await getCaseDataFromStore(claimId);
    if (!claim.partialAdmissionPaymentAmount() || !claim.isPartialAdmission()) {
      res.redirect(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    } else {
      const paymentOption = await getPaymentOptionForm(claimId, ResponseType.PART_ADMISSION);
      admittedPaymentAmount = claim.partialAdmissionPaymentAmount();
      renderView(new GenericForm(paymentOption), res, admittedPaymentAmount);
    }
  } catch (error) {
    next(error);
  }
});

partialAdmissionPaymentOptionController.post(CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL, async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const paymentOption = new PaymentOption(req.body.paymentType);
    const form = new GenericForm(paymentOption);
    await form.validate();
    if (form.hasErrors()) {
      renderView(form, res, admittedPaymentAmount);
    } else {
      await savePaymentOptionData(generateRedisKey(<AppRequest>req), form.model, ResponseType.PART_ADMISSION);
      redirectToNextPage(claimId, form.model, res);
    }
  } catch (error) {
    next(error);
  }
});

export default partialAdmissionPaymentOptionController;
