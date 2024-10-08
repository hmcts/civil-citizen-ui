import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  CLAIMANT_RESPONSE_PAYMENT_DATE_URL,
  CLAIMANT_RESPONSE_PAYMENT_OPTION_URL,
  CLAIMANT_RESPONSE_PAYMENT_PLAN_URL,
  CLAIMANT_RESPONSE_TASK_LIST_URL,
} from 'routes/urls';
import {GenericForm} from 'common/form/models/genericForm';
import {
  saveClaimantResponse,
} from 'services/features/claimantResponse/claimantResponseService';
import {PaymentOption} from 'common/form/models/admission/paymentOption/paymentOption';
import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {getDecisionOnClaimantProposedPlan} from 'services/features/claimantResponse/getDecisionOnClaimantProposedPlan';
import {AppRequest} from 'models/AppRequest';
import {clearClaimantSuggestion} from 'routes/features/claimantResponse/clearClaimantSuggestionService';

const claimantSuggestedPaymentOptionViewPath = 'features/response/admission/payment-option';
const claimantSuggestedPaymentOptionController = Router();
const crParentName = 'suggestedPaymentIntention';
const crPropertyName = 'paymentOption';

function renderView(form: GenericForm<PaymentOption>, res: Response): void {
  res.render(claimantSuggestedPaymentOptionViewPath, {form: form, isClaimantResponse: true});
}

claimantSuggestedPaymentOptionController.get(CLAIMANT_RESPONSE_PAYMENT_OPTION_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const redisKey = generateRedisKey(req as unknown as AppRequest);
    const claim = await getCaseDataFromStore(redisKey, true);
    const updatedClaim = await clearClaimantSuggestion(redisKey, claim);
    renderView(new GenericForm(new PaymentOption(updatedClaim.getSuggestedPaymentIntentionOptionFromClaimant())), res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

claimantSuggestedPaymentOptionController.post(CLAIMANT_RESPONSE_PAYMENT_OPTION_URL, (async (req: Request, res: Response, next) => {
  try {
    const claimId = req.params.id;
    const claimantResponsePaymentOption = new PaymentOption(req.body.paymentType);
    const form = new GenericForm(claimantResponsePaymentOption);
    form.validateSync();
    if (form.hasErrors()) {
      const errorMsgToUpdate = form.errors.find(e => e.constraints && e.constraints.isIn);
      if (errorMsgToUpdate) {
        errorMsgToUpdate.constraints.isIn = 'ERRORS.VALID_PAYMENT_OPTION_VARIATION1';
      }
      renderView(form, res);
    } else {
      await saveClaimantResponse(generateRedisKey(req as unknown as AppRequest), form.model.paymentType, crPropertyName, crParentName);
      let redirectUrl: string;
      switch (form.model.paymentType) {
        case PaymentOptionType.IMMEDIATELY:
          redirectUrl = await getDecisionOnClaimantProposedPlan(<AppRequest>req, claimId);
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
}) as RequestHandler);

export default claimantSuggestedPaymentOptionController;
