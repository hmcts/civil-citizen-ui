import express from 'express';
import {
  PaymentDate,
} from '../../../../../../../../common/form/models/admission/fullAdmission/paymentOption/paymentDate';
import {CITIZEN_PAYMENT_DATE_URL, CLAIM_TASK_LIST_URL} from '../../../../../../../../routes/urls';
import {GenericForm} from '../../../../../../../../common/form/models/genericForm';
import {constructResponseUrlWithIdParams} from '../../../../../../../../common/utils/urlFormatter';
import paymentDateService
  from '../../../../../../../../modules/admission/fullAdmission/paymentOption/paymentDateService';


const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('paymentDateController');
const paymentDatePath = 'features/response/admission/fullAdmission/paymentOption/payment-date';
const paymentDateController = express.Router();

paymentDateController
  .get(
    CITIZEN_PAYMENT_DATE_URL, async (req: express.Request, res: express.Response) => {
      try {
        const paymentDate: PaymentDate = await paymentDateService.getPaymentDate(req.params.id);
        res.render(paymentDatePath, {
          form: new GenericForm(paymentDate),
        });
      } catch (error) {
        logger.error(error);
        res.status(500).send({errorMessage: error.message, errorStack: error.stack});
      }
    })
  .post(
    CITIZEN_PAYMENT_DATE_URL, async (req, res) => {
      const paymentDate = paymentDateService.buildPaymentDate(req.body.year, req.body.month, req.body.day);
      const form: GenericForm<PaymentDate> = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();

      if (form.hasErrors()) {
        res.render(paymentDatePath, {
          form: form,
        });
      } else {
        try {
          await paymentDateService.savePaymentDate(req.params.id, paymentDate);
          res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL));
        } catch (error) {
          logger.error(error);
          res.status(500).send({errorMessage: error.message, errorStack: error.stack});
        }
      }
    });

export default paymentDateController;
