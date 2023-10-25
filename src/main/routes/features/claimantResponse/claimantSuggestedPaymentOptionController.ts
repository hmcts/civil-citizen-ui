import {NextFunction, Request, Response, Router} from 'express';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  CLAIMANT_RESPONSE_PAYMENT_DATE_URL,
  CLAIMANT_RESPONSE_PAYMENT_OPTION_URL,
  CLAIMANT_RESPONSE_PAYMENT_PLAN_URL,
  CLAIMANT_RESPONSE_TASK_LIST_URL,
} from 'routes/urls';
import {GenericForm} from 'common/form/models/genericForm';
import {
  getClaimantResponse,
  saveClaimantResponse,
} from 'services/features/claimantResponse/claimantResponseService';
import {PaymentOption} from 'common/form/models/admission/paymentOption/paymentOption';
import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import { generateRedisKey } from 'modules/draft-store/draftStoreService';
import { AppRequest } from 'common/models/AppRequest';

const claimantSuggestedPaymentOptionViewPath = 'features/response/admission/payment-option';
const claimantSuggestedPaymentOptionController = Router();
const crParentName = 'suggestedPaymentIntention';
const crPropertyName = 'paymentOption';

function renderView(form: GenericForm<PaymentOption>, res: Response): void {
  res.render(claimantSuggestedPaymentOptionViewPath, {form: form, isClaimantResponse : true});
}

claimantSuggestedPaymentOptionController.get(CLAIMANT_RESPONSE_PAYMENT_OPTION_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimantResponse = await getClaimantResponse(generateRedisKey(req as unknown as AppRequest));
    renderView(new GenericForm(new PaymentOption(claimantResponse.suggestedPaymentIntention?.paymentOption)), res);
  } catch (error) {
    next(error);
  }
});

claimantSuggestedPaymentOptionController.post(CLAIMANT_RESPONSE_PAYMENT_OPTION_URL, async (req: Request, res: Response, next) => {
  try {
    const claimId = req.params.id;
    const claimantResponsePaymentOption = new PaymentOption(req.body.paymentType);
    const form = new GenericForm(claimantResponsePaymentOption);
    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveClaimantResponse(generateRedisKey(req as unknown as AppRequest), form.model.paymentType, crPropertyName, crParentName);
      let redirectUrl: string;
      switch (form.model.paymentType) {
        case PaymentOptionType.IMMEDIATELY:
          // TODO : trigger court calculator when it's developed and update redirection url with the result of it
          redirectUrl = CLAIMANT_RESPONSE_TASK_LIST_URL;
          break;
        case PaymentOptionType.INSTALMENTS:
          redirectUrl = CLAIMANT_RESPONSE_PAYMENT_PLAN_URL;
          break;
        case PaymentOptionType.BY_SET_DATE:
          redirectUrl = CLAIMANT_RESPONSE_PAYMENT_DATE_URL;
          break;
        default:
          redirectUrl = CLAIMANT_RESPONSE_TASK_LIST_URL;
          break;
      }
      res.redirect(constructResponseUrlWithIdParams(claimId, redirectUrl));
    }
  } catch (error) {
    next(error);
  }
});

export default claimantSuggestedPaymentOptionController;
