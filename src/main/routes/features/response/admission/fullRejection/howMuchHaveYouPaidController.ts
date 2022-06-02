import express from 'express';
import {CITIZEN_FR_AMOUNT_YOU_PAID_URL, CLAIM_TASK_LIST_URL} from '../../../../../routes/urls';
import {GenericForm} from '../../../../../common/form/models/genericForm';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import howMuchHaveYouPaidService from '../../../../../services/features/response/admission/howMuchHaveYouPaidService';
import * as winston from 'winston';
import {HowMuchHaveYouPaid} from 'common/form/models/admission/howMuchHaveYouPaid';
import {toNumberOrUndefined} from '../../../../../common/utils/numberConverter';
import {ResponseType} from 'common/form/models/responseType';

const {Logger} = require('@hmcts/nodejs-logging');
let logger = Logger.getLogger('HowMuchHaveYouPaidController');
const howMuchHaveYouPaidPath = 'features/response/admission/how-much-have-you-paid';
const howMuchHaveYouPaidController = express.Router();
const lastMonth = new Date(Date.now());
lastMonth.setMonth(lastMonth.getMonth() - 1);
let totalClaimAmount: number;

export function setHowMuchHaveYouPaidControllerLogger(winstonLogger: winston.Logger) {
  logger = winstonLogger;
}

howMuchHaveYouPaidController
  .get(
    CITIZEN_FR_AMOUNT_YOU_PAID_URL, async (req: express.Request, res: express.Response) => {
      try {
        const howMuchHaveYouPaid: HowMuchHaveYouPaid = await howMuchHaveYouPaidService.getHowMuchHaveYouPaid(req.params.id, ResponseType.FULL_DEFENCE);
        totalClaimAmount = howMuchHaveYouPaid.totalClaimAmount;

        res.render(howMuchHaveYouPaidPath, {
          form: new GenericForm(howMuchHaveYouPaid), lastMonth: lastMonth, totalClaimAmount: totalClaimAmount,
        });
      } catch (error) {
        logger.error(error);
        res.status(500).send({error: error.message});
      }
    })
  .post(
    CITIZEN_FR_AMOUNT_YOU_PAID_URL, async (req, res) => {
      const howMuchHaveYouPaid = howMuchHaveYouPaidService.buildHowMuchHaveYouPaid(toNumberOrUndefined(req.body.amount), totalClaimAmount, req.body.year, req.body.month, req.body.day, req.body.text);
      const form: GenericForm<HowMuchHaveYouPaid> = new GenericForm<HowMuchHaveYouPaid>(howMuchHaveYouPaid);
      await form.validate();

      if (form.hasErrors()) {
        res.render(howMuchHaveYouPaidPath, {
          form: form, lastMonth: lastMonth, totalClaimAmount: howMuchHaveYouPaid.totalClaimAmount,
        });
      } else {
        try {
          await howMuchHaveYouPaidService.saveHowMuchHaveYouPaid(req.params.id, howMuchHaveYouPaid, ResponseType.FULL_DEFENCE);
          res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL));
        } catch (error) {
          logger.error(error);
          res.status(500).send({error: error.message});
        }
      }
    });

export default howMuchHaveYouPaidController;
