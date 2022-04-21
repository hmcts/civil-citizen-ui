import express from 'express';
import {CITIZEN_AMOUNT_YOU_PAID_URL, CLAIM_TASK_LIST_URL} from '../../../../../routes/urls';
import {GenericForm} from '../../../../../common/form/models/genericForm';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import howMuchHaveYouPaidService from '../../../../../modules/admission/partialAdmission/howMuchHaveYouPaidService';
import * as winston from 'winston';
import {HowMuchHaveYouPaid} from '../../../../../common/form/models/admission/partialAdmission/howMuchHaveYouPaid';


const {Logger} = require('@hmcts/nodejs-logging');
let logger = Logger.getLogger('HowMuchHaveYouPaidController');
const howMuchHaveYouPaidPath = 'features/response/admission/partialAdmission/how-much-have-you-paid';
const howMuchHaveYouPaidController = express.Router();
const nextMonth = new Date();
nextMonth.setMonth(nextMonth.getMonth() + 1);

export function setHowMuchHaveYouPaidControllerLogger(winstonLogger: winston.Logger) {
  logger = winstonLogger;
}

howMuchHaveYouPaidController
  .get(
    CITIZEN_AMOUNT_YOU_PAID_URL, async (req: express.Request, res: express.Response) => {
      try {
        const howMuchHaveYouPaid : HowMuchHaveYouPaid = await howMuchHaveYouPaidService.getHowMuchHaveYouPaid(req.params.id);
        if (howMuchHaveYouPaid) {
          const dateWhenYouPaid = new Date(howMuchHaveYouPaid.date);
          howMuchHaveYouPaid.date = dateWhenYouPaid;
          howMuchHaveYouPaid.year = dateWhenYouPaid.getFullYear();
          howMuchHaveYouPaid.month = dateWhenYouPaid.getMonth() + 1;
          howMuchHaveYouPaid.day = dateWhenYouPaid.getDate();
        }
        res.render(howMuchHaveYouPaidPath, {
          form: new GenericForm(howMuchHaveYouPaid), nextMonth : nextMonth,
        });
      } catch (error) {
        logger.error(error);
        res.status(500).send({error: error.message});
      }
    })
  .post(
    CITIZEN_AMOUNT_YOU_PAID_URL, async (req, res) => {
      const howMuchHaveYouPaid = howMuchHaveYouPaidService.buildHowMuchHaveYouPaid(req.body.amount, req.body.totalAmount, req.body.year, req.body.month, req.body.day, req.body.text);
      const form: GenericForm<HowMuchHaveYouPaid> = new GenericForm<HowMuchHaveYouPaid>(howMuchHaveYouPaid);
      await form.validate();

      if (form.hasErrors()) {
        res.render(howMuchHaveYouPaidPath, {
          form: form, nextMonth : nextMonth,
        });
      } else {
        try {
          await howMuchHaveYouPaidService.saveHowMuchHaveYouPaid(req.params.id, howMuchHaveYouPaid);
          res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL));
        } catch (error) {
          logger.error(error);
          res.status(500).send({error: error.message});
        }
      }
    });

export default howMuchHaveYouPaidController;
