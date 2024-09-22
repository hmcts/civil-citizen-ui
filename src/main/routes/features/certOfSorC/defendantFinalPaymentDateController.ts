import {NextFunction, Request, Response, Router} from 'express';
import {DefendantFinalPaymentDate} from 'form/models/certOfSorC/defendantFinalPaymentDate';
import {
  CCJ_CHECK_AND_SEND_URL,
  COSC_FINAL_PAYMENT_DATE_URL,
} from 'routes/urls';
import { saveClaimantResponse} from 'services/features/claimantResponse/claimantResponseService';
import {GenericForm} from 'form/models/genericForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import { generateRedisKey } from 'modules/draft-store/draftStoreService';
import { AppRequest } from 'common/models/AppRequest';

const paymentDatePath = 'features/certOfSorC/final-payment-date';
const defendantPaymentDateController = Router();
const title = 'PAGES.FINAL_DEFENDANT_PAYMENT_DATE.TITLE';

function renderView(form: GenericForm<DefendantFinalPaymentDate>, res: Response): void {
  res.render(paymentDatePath, {form, title, pageTitle: 'PAGES.FINAL_DEFENDANT_PAYMENT_DATE.PAGE_TITLE'});
}

defendantPaymentDateController
  .get(
    COSC_FINAL_PAYMENT_DATE_URL, async (req: Request, res: Response, next: NextFunction) => {
      try {
        //const claimantResponse = await getClaimantResponse(generateRedisKey(req as unknown as AppRequest));
        const defendantPaymentDate = new DefendantFinalPaymentDate();
        renderView(new GenericForm(defendantPaymentDate), res);
      } catch (error) {
        next(error);
      }
    })
  .post(
    COSC_FINAL_PAYMENT_DATE_URL, async (req, res, next: NextFunction) => {
      const claimId = req.params.id;
      const defendantPaymentDate = new DefendantFinalPaymentDate(req.body.year, req.body.month, req.body.day);
      const form: GenericForm<DefendantFinalPaymentDate> = new GenericForm<DefendantFinalPaymentDate>(defendantPaymentDate);
      form.validateSync();

      if (form.hasErrors()) {
        renderView(form, res);
      } else {
        try {
          await saveClaimantResponse(generateRedisKey(req as unknown as AppRequest), form.model, 'defendantFinalPaymentDate', 'ccjRequest');
          res.redirect(constructResponseUrlWithIdParams(claimId, CCJ_CHECK_AND_SEND_URL));
        } catch (error) {
          next(error);
        }
      }
    });

export default defendantPaymentDateController;
