import {NextFunction, Request, Response, Router} from 'express';
import {DefendantFinalPaymentDate} from 'form/models/certOfSorC/defendantFinalPaymentDate';
import {
  COSC_FINAL_PAYMENT_DATE_URL,
} from 'routes/urls';
import { saveFinalPaymentDateResponse} from 'services/features/certOfSorC/defendantFinalPaymentDateService';
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
          console.log('Defendant final payment date:' + defendantPaymentDate.date.toDateString());
          await saveFinalPaymentDateResponse(generateRedisKey(req as unknown as AppRequest), form.model, 'defendantFinalPaymentDate', 'ccjRequest');
          //ToDo: Replace for the next screen
          res.redirect(constructResponseUrlWithIdParams(claimId, COSC_FINAL_PAYMENT_DATE_URL));
        } catch (error) {
          next(error);
        }
      }
    });

export default defendantPaymentDateController;
