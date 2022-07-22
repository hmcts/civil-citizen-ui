import express from 'express';
import {CITIZEN_AMOUNT_YOU_PAID_URL, CLAIM_TASK_LIST_URL} from '../../../../../routes/urls';
import {GenericForm} from '../../../../../common/form/models/genericForm';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import howMuchHaveYouPaidService from '../../../../../services/features/response/admission/howMuchHaveYouPaidService';
import {HowMuchHaveYouPaid} from '../../../../../common/form/models/admission/howMuchHaveYouPaid';
import {toNumberOrUndefined} from '../../../../../common/utils/numberConverter';
import {ResponseType} from '../../../../../common/form/models/responseType';

const howMuchHaveYouPaidPath = 'features/response/admission/how-much-have-you-paid';
const howMuchHaveYouPaidController = express.Router();
const lastMonth = new Date(Date.now());
lastMonth.setMonth(lastMonth.getMonth() - 1);
let totalClaimAmount: number;


howMuchHaveYouPaidController
  .get(
    CITIZEN_AMOUNT_YOU_PAID_URL, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      try {
        const howMuchHaveYouPaid: HowMuchHaveYouPaid = await howMuchHaveYouPaidService.getHowMuchHaveYouPaid(req.params.id, ResponseType.PART_ADMISSION);
        totalClaimAmount = howMuchHaveYouPaid.totalClaimAmount;

        res.render(howMuchHaveYouPaidPath, {
          form: new GenericForm(howMuchHaveYouPaid), lastMonth: lastMonth, totalClaimAmount: totalClaimAmount,
        });
      } catch (error) {
        next(error);
      }
    })
  .post(
    CITIZEN_AMOUNT_YOU_PAID_URL, async (req, res, next: express.NextFunction) => {
      const howMuchHaveYouPaid = howMuchHaveYouPaidService.buildHowMuchHaveYouPaid(toNumberOrUndefined(req.body.amount), totalClaimAmount, req.body.year, req.body.month, req.body.day, req.body.text);
      const form: GenericForm<HowMuchHaveYouPaid> = new GenericForm<HowMuchHaveYouPaid>(howMuchHaveYouPaid);
      await form.validate();

      if (form.hasErrors()) {
        res.render(howMuchHaveYouPaidPath, {
          form: form, lastMonth: lastMonth, totalClaimAmount: howMuchHaveYouPaid.totalClaimAmount,
        });
      } else {
        try {
          await howMuchHaveYouPaidService.saveHowMuchHaveYouPaid(req.params.id, howMuchHaveYouPaid, ResponseType.PART_ADMISSION);
          res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL));
        } catch (error) {
          next(error);
        }
      }
    });

export default howMuchHaveYouPaidController;
