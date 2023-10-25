import {NextFunction, Request, Response, Router} from 'express';
import {
  CITIZEN_FR_AMOUNT_YOU_PAID_URL,
  CITIZEN_FULL_REJECTION_YOU_PAID_LESS_URL,
  RESPONSE_TASK_LIST_URL,
} from '../../../../urls';
import {GenericForm} from '../../../../../common/form/models/genericForm';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import howMuchHaveYouPaidService from '../../../../../services/features/response/admission/howMuchHaveYouPaidService';
import {HowMuchHaveYouPaid} from '../../../../../common/form/models/admission/howMuchHaveYouPaid';
import {toNumberOrUndefined} from '../../../../../common/utils/numberConverter';
import {ResponseType} from '../../../../../common/form/models/responseType';
import {AppRequest} from 'common/models/AppRequest';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';

const howMuchHaveYouPaidPath = 'features/response/admission/how-much-have-you-paid';
const howMuchHaveYouPaidController = Router();
const lastMonth = new Date(Date.now());
lastMonth.setMonth(lastMonth.getMonth() - 1);
let totalClaimAmount: number;

howMuchHaveYouPaidController
  .get(
    CITIZEN_FR_AMOUNT_YOU_PAID_URL, async (req: Request, res: Response, next: NextFunction) => {
      try {
        const howMuchHaveYouPaid: HowMuchHaveYouPaid = await howMuchHaveYouPaidService.getHowMuchHaveYouPaid(generateRedisKey(<AppRequest>req), ResponseType.FULL_DEFENCE);
        totalClaimAmount = howMuchHaveYouPaid.totalClaimAmount;

        res.render(howMuchHaveYouPaidPath, {
          form: new GenericForm(howMuchHaveYouPaid),
          lastMonth: lastMonth,
          totalClaimAmount: totalClaimAmount,
          responseType: ResponseType.FULL_DEFENCE,
        });
      } catch (error) {
        next(error);
      }
    })
  .post(
    CITIZEN_FR_AMOUNT_YOU_PAID_URL, async (req, res, next: NextFunction) => {
      const howMuchHaveYouPaid = howMuchHaveYouPaidService.buildHowMuchHaveYouPaid(toNumberOrUndefined(req.body.amount), totalClaimAmount, req.body.year, req.body.month, req.body.day, req.body.text);
      const form: GenericForm<HowMuchHaveYouPaid> = new GenericForm<HowMuchHaveYouPaid>(howMuchHaveYouPaid);
      const paid = toNumberOrUndefined(req.body.amount);
      await form.validate();

      if (form.hasErrors()) {
        res.render(howMuchHaveYouPaidPath, {
          form: form,
          lastMonth: lastMonth,
          totalClaimAmount: howMuchHaveYouPaid.totalClaimAmount,
          responseType: ResponseType.FULL_DEFENCE,
        });
      } else {
        try {
          await howMuchHaveYouPaidService.saveHowMuchHaveYouPaid(generateRedisKey(<AppRequest>req), howMuchHaveYouPaid, ResponseType.FULL_DEFENCE);
          if (paid < howMuchHaveYouPaid.totalClaimAmount) {
            res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_FULL_REJECTION_YOU_PAID_LESS_URL));
          } else {
            res.redirect(constructResponseUrlWithIdParams(req.params.id, RESPONSE_TASK_LIST_URL));
          }
        } catch (error) {
          next(error);
        }
      }
    });

export default howMuchHaveYouPaidController;
