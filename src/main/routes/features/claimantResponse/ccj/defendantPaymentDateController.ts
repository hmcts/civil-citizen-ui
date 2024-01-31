import {NextFunction, Request, Response, Router} from 'express';
import {PaymentDate} from 'form/models/admission/fullAdmission/paymentOption/paymentDate';
import {
  CCJ_CHECK_AND_SEND_URL,
  CCJ_DEFENDANT_PAYMENT_DATE_URL,
} from 'routes/urls';
import {getClaimantResponse, saveClaimantResponse} from 'services/features/claimantResponse/claimantResponseService';
import {GenericForm} from 'form/models/genericForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import { generateRedisKey } from 'modules/draft-store/draftStoreService';
import { AppRequest } from 'common/models/AppRequest';

const paymentDatePath = 'features/response/admission/payment-date';
const defendantPaymentDateController = Router();
const title = 'PAGES.CCJ_DEFENDANT_PAYMENT_DATE.TITLE';

function renderView(form: GenericForm<PaymentDate>, res: Response): void {
  res.render(paymentDatePath, {form, title});
}

defendantPaymentDateController
  .get(
    CCJ_DEFENDANT_PAYMENT_DATE_URL, async (req: Request, res: Response, next: NextFunction) => {
      try {
        const claimantResponse = await getClaimantResponse(generateRedisKey(req as unknown as AppRequest));
        const defendantPaymentDate = claimantResponse.ccjRequest?.defendantPaymentDate ?? new PaymentDate();
        renderView(new GenericForm(defendantPaymentDate), res);
      } catch (error) {
        next(error);
      }
    })
  .post(
    CCJ_DEFENDANT_PAYMENT_DATE_URL, async (req, res, next: NextFunction) => {
      const claimId = req.params.id;
      const defendantPaymentDate = new PaymentDate(req.body.year, req.body.month, req.body.day);
      const form: GenericForm<PaymentDate> = new GenericForm<PaymentDate>(defendantPaymentDate);
      form.validateSync();

      if (form.hasErrors()) {
        renderView(form, res);
      } else {
        try {
          await saveClaimantResponse(generateRedisKey(req as unknown as AppRequest), form.model, 'defendantPaymentDate', 'ccjRequest');
          res.redirect(constructResponseUrlWithIdParams(claimId, CCJ_CHECK_AND_SEND_URL));
        } catch (error) {
          next(error);
        }
      }
    });

export default defendantPaymentDateController;
