import {NextFunction, Request, Response, Router} from 'express';
import {DefendantFinalPaymentDate} from 'form/models/certOfSorC/defendantFinalPaymentDate';
import {
  COSC_FINAL_PAYMENT_DATE_URL,
  GA_DEBT_PAYMENT_EVIDENCE_URL,
  GA_ASK_PROOF_OF_DEBT_PAYMENT_GUIDANCE_URL,
} from 'routes/urls';
import {
  defendantFinalPaymentDateService,
} from 'services/features/generalApplication/certOfSorC/defendantFinalPaymentDateService';
import {GenericForm} from 'form/models/genericForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getCancelUrl} from 'services/features/generalApplication/generalApplicationService';

const paymentDateViewPath = 'features/generalApplication/certOfSorC/final-payment-date';

const defendantPaymentDateController = Router();
const title = 'PAGES.GENERAL_APPLICATION.FINAL_DEFENDANT_PAYMENT_DATE.TITLE';

defendantPaymentDateController
  .get(
    COSC_FINAL_PAYMENT_DATE_URL, async (req: Request, res: Response, next: NextFunction) => {
      try {
        const cancelUrl = await getCancelUrl(req.params.id, null);
        const backLinkUrl = constructResponseUrlWithIdParams(req.params.id, GA_ASK_PROOF_OF_DEBT_PAYMENT_GUIDANCE_URL);
        const defendantFinalPaymentDate = await defendantFinalPaymentDateService.getDefendantResponse(req);
        res.render( paymentDateViewPath, { cancelUrl, backLinkUrl,
          form: new GenericForm(defendantFinalPaymentDate), title,
        });
      } catch (error) {
        next(error);
      }
    })
  .post(
    COSC_FINAL_PAYMENT_DATE_URL, async (req, res, next: NextFunction) => {
      const cancelUrl = await getCancelUrl(req.params.id, null);
      const backLinkUrl = constructResponseUrlWithIdParams(req.params.id, GA_ASK_PROOF_OF_DEBT_PAYMENT_GUIDANCE_URL);
      const defendantPaymentDate = new DefendantFinalPaymentDate(req.body.year, req.body.month, req.body.day);
      const form: GenericForm<DefendantFinalPaymentDate> = new GenericForm<DefendantFinalPaymentDate>(defendantPaymentDate);

      await form.validate();
      if (form.hasErrors()) {
        res.render(paymentDateViewPath, {form, title, cancelUrl, backLinkUrl });
      } else {
        try {
          await defendantFinalPaymentDateService.savePaymentDate(req, defendantPaymentDate);
          res.redirect(constructResponseUrlWithIdParams(req.params.id, GA_DEBT_PAYMENT_EVIDENCE_URL));
        } catch (error) {
          next(error);
        }
      }
    });

export default defendantPaymentDateController;
