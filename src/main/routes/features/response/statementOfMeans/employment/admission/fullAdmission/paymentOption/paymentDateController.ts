import express from 'express';
import {
  PaymentDate,
} from '../../../../../../../../common/form/models/admission/fullAdmission/paymentOption/paymentDate';
import {CITIZEN_PAYMENT_DATE_URL, CLAIM_TASK_LIST_URL} from '../../../../../../../../routes/urls';
import {GenericForm} from '../../../../../../../../common/form/models/genericForm';
import {constructResponseUrlWithIdParams} from '../../../../../../../../common/utils/urlFormatter';
import paymentDateService
  from '../../../../../../../../modules/admission/fullAdmission/paymentOption/paymentDateService';
import * as winston from 'winston';


const {Logger} = require('@hmcts/nodejs-logging');
let logger = Logger.getLogger('paymentDateController');
const paymentDatePath = 'features/response/admission/fullAdmission/paymentOption/payment-date';
const paymentDateController = express.Router();

export function setPaymentDateControllerLogger(winstonLogger: winston.LoggerInstance) {
  logger = winstonLogger;
}

paymentDateController
  .get(
    CITIZEN_PAYMENT_DATE_URL, async (req: express.Request, res: express.Response) => {
      try {
        const paymentDate = new PaymentDate();
        const date: Date = await paymentDateService.getPaymentDate(req.params.id);
        if (date) {
          const dateOfPayment = new Date(date);
          paymentDate.date = dateOfPayment;
          paymentDate.year = dateOfPayment.getFullYear();
          paymentDate.month = dateOfPayment.getMonth() + 1;
          paymentDate.day = dateOfPayment.getDate();
        }
        res.render(paymentDatePath, {
          form: new GenericForm(paymentDate),
        });
      } catch (error) {
        logger.error(error);
        res.status(500).send({error: error.message});
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
          await paymentDateService.savePaymentDate(req.params.id, paymentDate.date);
          res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL));
        } catch (error) {
          logger.error(error);
          res.status(500).send({error: error.message});
        }
      }
    });

export default paymentDateController;
