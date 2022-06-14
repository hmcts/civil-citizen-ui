import express from 'express';
import {PaymentDate} from '../../../../../common/form/models/admission/fullAdmission/paymentOption/paymentDate';
import {CITIZEN_PA_PAYMENT_DATE_URL, CLAIM_TASK_LIST_URL} from '../../../../urls';
import {GenericForm} from '../../../../../common/form/models/genericForm';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import paymentDateService
  from '../../../../../services/features/response/admission/fullAdmission/paymentOption/paymentDateService';
import * as winston from 'winston';
import {ResponseType} from '../../../../../common/form/models/responseType';

const {Logger} = require('@hmcts/nodejs-logging');
let logger = Logger.getLogger('paymentDatePAController');
const paymentDatePath = 'features/response/admission/payment-date';
const paymentDateController = express.Router();
const nextMonth = new Date();
nextMonth.setMonth(nextMonth.getMonth() + 1);

export function setPaymentDatePAControllerLogger(winstonLogger: winston.Logger) {
  logger = winstonLogger;
}

paymentDateController
  .get(
    CITIZEN_PA_PAYMENT_DATE_URL, async (req: express.Request, res: express.Response) => {
      try {
        const paymentDate = await paymentDateService.getPaymentDate(req.params.id, ResponseType.PART_ADMISSION);
        res.render(paymentDatePath, {
          form: new GenericForm(paymentDate), nextMonth: nextMonth,
        });
      } catch (error) {
        logger.error(error);
        res.status(500).send({error: error.message});
      }
    })
  .post(
    CITIZEN_PA_PAYMENT_DATE_URL, async (req, res) => {
      const paymentDate = new PaymentDate(req.body.year, req.body.month, req.body.day);
      const form: GenericForm<PaymentDate> = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();

      if (form.hasErrors()) {
        res.render(paymentDatePath, {
          form: form, nextMonth: nextMonth,
        });
      } else {
        try {
          await paymentDateService.savePaymentDate(req.params.id, paymentDate.date, ResponseType.PART_ADMISSION);
          res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL));
        } catch (error) {
          logger.error(error);
          res.status(500).send({error: error.message});
        }
      }
    });

export default paymentDateController;
