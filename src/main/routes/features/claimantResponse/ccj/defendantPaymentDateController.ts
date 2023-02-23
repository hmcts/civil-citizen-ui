import {NextFunction, Request, Response, Router} from 'express';
import {PaymentDate} from 'form/models/admission/fullAdmission/paymentOption/paymentDate';
import {
  CCJ_CHECK_AND_SEND_URL,
  CCJ_DEPENDANT_PAYMENT_DATE_URL,
  CLAIMANT_RESPONSE_PAYMENT_DATE_URL,
  CLAIMANT_RESPONSE_TASK_LIST_URL,
} from 'routes/urls';
import {getClaimantResponse, saveClaimantResponse} from 'services/features/claimantResponse/claimantResponseService';
import {GenericForm} from 'form/models/genericForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const paymentDatePath = 'features/response/admission/payment-date';
const defendantPaymentDateController = Router();
const title = 'PAGES.CCJ_DEFENDANT_PAYMENT_DATE.TITLE';

function renderView(form: GenericForm<PaymentDate | Date>, isCCJRequest: boolean, res: Response): void {
  const insetText = isCCJRequest ? undefined : 'PAGES.CCJ_DEFENDANT_PAYMENT_DATE.INSET';
  res.render(paymentDatePath, {form, title, insetText});
}

defendantPaymentDateController
  .get(
    [CCJ_DEPENDANT_PAYMENT_DATE_URL, CLAIMANT_RESPONSE_PAYMENT_DATE_URL], async (req: Request, res: Response, next: NextFunction) => {
      try {
        const isCCJRequest = req.url === constructResponseUrlWithIdParams(req.params.id, CCJ_DEPENDANT_PAYMENT_DATE_URL);
        const claimantResponse = await getClaimantResponse(req.params.id);
        const defendantPaymentDate = claimantResponse.ccjRequest?.defendantPaymentDate ?? new PaymentDate();
        const claimantSuggestedPaymentDate = claimantResponse.paymentIntention?.paymentDate ?? new PaymentDate();
        const form = new GenericForm(isCCJRequest ? defendantPaymentDate : claimantSuggestedPaymentDate);
        renderView(form, isCCJRequest, res);
      } catch (error) {
        next(error);
      }
    })
  .post(
    [CCJ_DEPENDANT_PAYMENT_DATE_URL, CLAIMANT_RESPONSE_PAYMENT_DATE_URL], async (req, res, next: NextFunction) => {
      const claimId = req.params.id;
      const isCCJRequest = req.url === constructResponseUrlWithIdParams(req.params.id, CCJ_DEPENDANT_PAYMENT_DATE_URL);
      const defendantPaymentDate = new PaymentDate(req.body.year, req.body.month, req.body.day);
      const form: GenericForm<PaymentDate> = new GenericForm<PaymentDate>(defendantPaymentDate);
      await form.validate();

      if (form.hasErrors()) {
        renderView(form, isCCJRequest, res);
      } else {
        try {
          const crParentName = isCCJRequest ? 'ccjRequest' : 'paymentIntention';
          const crPropertyName = isCCJRequest ? 'defendantPaymentDate' : 'paymentDate';
          await saveClaimantResponse(claimId, form.model, crPropertyName, crParentName);
          const redirectUrl = isCCJRequest ? CCJ_CHECK_AND_SEND_URL : CLAIMANT_RESPONSE_TASK_LIST_URL;
          res.redirect(constructResponseUrlWithIdParams(claimId, redirectUrl));
        } catch (error) {
          next(error);
        }
      }
    });

export default defendantPaymentDateController;
