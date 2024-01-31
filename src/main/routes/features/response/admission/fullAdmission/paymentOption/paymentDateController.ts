import {NextFunction, Request, Response, Router} from 'express';
import {PaymentDate} from '../../../../../../common/form/models/admission/fullAdmission/paymentOption/paymentDate';
import {CITIZEN_PAYMENT_DATE_URL, RESPONSE_TASK_LIST_URL} from '../../../../../urls';
import {GenericForm} from '../../../../../../common/form/models/genericForm';
import {constructResponseUrlWithIdParams} from '../../../../../../common/utils/urlFormatter';
import {
  paymentDateService,
} from '../../../../../../services/features/response/admission/fullAdmission/paymentOption/paymentDateService';
import {ResponseType} from '../../../../../../common/form/models/responseType';
import {AppRequest} from 'common/models/AppRequest';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';

const paymentDatePath = 'features/response/admission/payment-date';
const paymentDateController = Router();
const title = 'PAGES.ADMISSION_PAYMENT_DATE.TITLE';

paymentDateController
  .get(
    CITIZEN_PAYMENT_DATE_URL, async (req: Request, res: Response, next: NextFunction) => {
      try {
        const paymentDate = await paymentDateService.getPaymentDate(generateRedisKey(<AppRequest>req), ResponseType.FULL_ADMISSION);
        res.render(paymentDatePath, {
          form: new GenericForm(paymentDate), title,
        });
      } catch (error) {
        next(error);
      }
    })
  .post(
    CITIZEN_PAYMENT_DATE_URL, async (req, res, next: NextFunction) => {
      const paymentDate = new PaymentDate(req.body.year, req.body.month, req.body.day);
      const form: GenericForm<PaymentDate> = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();

      if (form.hasErrors()) {
        res.render(paymentDatePath, {form, title});
      } else {
        try {
          await paymentDateService.savePaymentDate(generateRedisKey(<AppRequest>req), paymentDate.date, ResponseType.FULL_ADMISSION);
          res.redirect(constructResponseUrlWithIdParams(req.params.id, RESPONSE_TASK_LIST_URL));
        } catch (error) {
          next(error);
        }
      }
    });

export default paymentDateController;
