import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {PaymentDate} from 'form/models/admission/fullAdmission/paymentOption/paymentDate';
import {
  CLAIMANT_RESPONSE_PAYMENT_DATE_URL,
} from 'routes/urls';
import {getClaimantResponse, saveClaimantResponse} from 'services/features/claimantResponse/claimantResponseService';
import {GenericForm} from 'form/models/genericForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'models/AppRequest';
import {getDecisionOnClaimantProposedPlan} from 'services/features/claimantResponse/getDecisionOnClaimantProposedPlan';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';

const paymentDatePath = 'features/response/admission/payment-date';
const claimantSuggestedPaymentDateController = Router();
const crParentName = 'suggestedPaymentIntention';
const crPropertyName ='paymentDate';
const title = 'PAGES.CCJ_DEFENDANT_PAYMENT_DATE.TITLE';
const insetText = 'PAGES.CCJ_DEFENDANT_PAYMENT_DATE.INSET';

function renderView(form: GenericForm<PaymentDate | Date>, res: Response): void {
  res.render(paymentDatePath, {form, title, insetText});
}

claimantSuggestedPaymentDateController.get(CLAIMANT_RESPONSE_PAYMENT_DATE_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimantResponse = await getClaimantResponse(generateRedisKey(req as unknown as AppRequest));
    const claimantSuggestedPaymentDate = claimantResponse.suggestedPaymentIntention?.paymentDate ?? new PaymentDate();
    renderView(new GenericForm(claimantSuggestedPaymentDate), res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

claimantSuggestedPaymentDateController.post(CLAIMANT_RESPONSE_PAYMENT_DATE_URL, (async (req, res, next: NextFunction) => {
  const claimId = req.params.id;
  const claimantSuggestedPaymentDate = new PaymentDate(req.body.year, req.body.month, req.body.day);
  const form: GenericForm<PaymentDate> = new GenericForm<PaymentDate>(claimantSuggestedPaymentDate);
  form.validateSync();
  if (form.hasErrors()) {
    renderView(form, res);
  } else {
    try {
      await saveClaimantResponse(generateRedisKey(req as unknown as AppRequest), form.model, crPropertyName, crParentName);
      const redirectUrl = await getDecisionOnClaimantProposedPlan(<AppRequest> req, claimId);
      res.redirect(constructResponseUrlWithIdParams(claimId, redirectUrl));
    } catch (error) {
      next(error);
    }
  }
})as RequestHandler);

export default claimantSuggestedPaymentDateController;
