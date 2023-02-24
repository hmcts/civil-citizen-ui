import {NextFunction, Request, Response, Router} from 'express';
import {PaymentDate} from 'form/models/admission/fullAdmission/paymentOption/paymentDate';
import {CCJ_CHECK_AND_SEND_URL, CCJ_PAY_BY_SET_DATE_URL} from 'routes/urls';
import {getClaimantResponse, saveClaimantResponse} from 'services/features/claimantResponse/claimantResponseService';
import {GenericForm} from 'form/models/genericForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const paymentDatePath = 'features/response/admission/payment-date';
const defendantPaymentDateController = Router();
const nextMonth = new Date();
nextMonth.setMonth(nextMonth.getMonth() + 1);

defendantPaymentDateController
  .get(
    CCJ_PAY_BY_SET_DATE_URL, async (req: Request, res: Response, next: NextFunction) => {
      try {
        const claimantResponse = await getClaimantResponse(req.params.id);
        const defendantPaymentDate = claimantResponse.ccjRequest ?
          claimantResponse.ccjRequest.defendantPaymentDate : new PaymentDate();
        res.render(paymentDatePath, {
          form: new GenericForm(defendantPaymentDate), nextMonth, title: 'PAGES.CCJ_DEFENDANT_PAYMENT_DATE.TITLE',
        });
      } catch (error) {
        next(error);
      }
    })
  .post(
    CCJ_PAY_BY_SET_DATE_URL, async (req, res, next: NextFunction) => {
      const claimId = req.params.id;
      const defendantPaymentDate = new PaymentDate(req.body.year, req.body.month, req.body.day);
      const form: GenericForm<PaymentDate> = new GenericForm<PaymentDate>(defendantPaymentDate);
      await form.validate();

      if (form.hasErrors()) {
        res.render(paymentDatePath, {
          form, nextMonth,
          title: 'PAGES.CCJ_DEFENDANT_PAYMENT_DATE.TITLE',
        });
      } else {
        try {
          await saveClaimantResponse(claimId, form.model, 'defendantPaymentDate', 'ccjRequest');
          res.redirect(constructResponseUrlWithIdParams(claimId, CCJ_CHECK_AND_SEND_URL));
        } catch (error) {
          next(error);
        }
      }
    });

export default defendantPaymentDateController;
