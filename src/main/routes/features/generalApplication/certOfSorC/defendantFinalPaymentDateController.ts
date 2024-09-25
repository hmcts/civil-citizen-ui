import {NextFunction, Request, Response, Router} from 'express';
import {DefendantFinalPaymentDate} from 'form/models/certOfSorC/defendantFinalPaymentDate';
import {
  APPLICATION_TYPE_URL,
  COSC_FINAL_PAYMENT_DATE_URL,
  GA_DEBT_PAYMENT_EVIDENCE_COSC_URL,
} from 'routes/urls';
import {
  defendantFinalPaymentDateService,
} from 'services/features/generalApplication/certOfSorC/defendantFinalPaymentDateService';
import {GenericForm} from 'form/models/genericForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import { generateRedisKey } from 'modules/draft-store/draftStoreService';
import { AppRequest } from 'models/AppRequest';
import {getCancelUrl} from 'services/features/generalApplication/generalApplicationService';

const paymentDateViewPath = 'features/generalApplication/certOfSorC/final-payment-date';

const defendantPaymentDateController = Router();
const title = 'PAGES.GENERAL_APPLICATION.FINAL_DEFENDANT_PAYMENT_DATE.TITLE';

defendantPaymentDateController
  .get(
    COSC_FINAL_PAYMENT_DATE_URL, async (req: Request, res: Response, next: NextFunction) => {
      try {
        const claimId = req.params.id;
        const cancelUrl = await getCancelUrl(claimId, null);
        const backLinkUrl = constructResponseUrlWithIdParams(req.params.id, APPLICATION_TYPE_URL);
        const redisKey = generateRedisKey(<AppRequest>req);
        const defendantFinalPaymentDate = await defendantFinalPaymentDateService.getDefendantResponse(redisKey);
        res.render( paymentDateViewPath, {  cancelUrl, backLinkUrl,
          form: new GenericForm(defendantFinalPaymentDate), title,
        });
      } catch (error) {
        next(error);
      }
    })
  .post(
    COSC_FINAL_PAYMENT_DATE_URL, async (req, res, next: NextFunction) => {
      const claimId = req.params.id;
      const redisKey = generateRedisKey(<AppRequest>req);
      const defendantPaymentDate = new DefendantFinalPaymentDate(req.body.year, req.body.month, req.body.day);
      const form: GenericForm<DefendantFinalPaymentDate> = new GenericForm<DefendantFinalPaymentDate>(defendantPaymentDate);
      await form.validate();

      if (form.hasErrors()) {
        res.render(paymentDateViewPath, {form, title});
      } else {
        try {
          await defendantFinalPaymentDateService.savePaymentDate(redisKey, defendantPaymentDate);
          res.redirect(constructResponseUrlWithIdParams(claimId, GA_DEBT_PAYMENT_EVIDENCE_COSC_URL));
        } catch (error) {
          next(error);
        }
      }
    });

export default defendantPaymentDateController;
