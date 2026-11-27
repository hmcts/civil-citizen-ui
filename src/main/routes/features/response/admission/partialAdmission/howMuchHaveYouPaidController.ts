import {NextFunction, Request, Response, Router} from 'express';
import {CITIZEN_AMOUNT_YOU_PAID_URL, RESPONSE_TASK_LIST_URL} from '../../../../../routes/urls';
import {GenericForm} from '../../../../../common/form/models/genericForm';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import howMuchHaveYouPaidService from '../../../../../services/features/response/admission/howMuchHaveYouPaidService';
import {HowMuchHaveYouPaid} from '../../../../../common/form/models/admission/howMuchHaveYouPaid';
import {toNumberOrUndefined} from '../../../../../common/utils/numberConverter';
import {ResponseType} from '../../../../../common/form/models/responseType';
import {PartAdmitHowMuchHaveYouPaidGuard} from '../../../../../routes/guards/partAdmitHowMuchHaveYouPaidGuard';
import {AppRequest} from 'common/models/AppRequest';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {getRouteParam} from 'common/utils/routeParamUtils';

const howMuchHaveYouPaidPath = 'features/response/admission/how-much-have-you-paid';
const howMuchHaveYouPaidController = Router();

const getLastMonth = (): Date => {
  const lastMonth = new Date(Date.now());
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  return lastMonth;
};
howMuchHaveYouPaidController
  .get(
    CITIZEN_AMOUNT_YOU_PAID_URL, PartAdmitHowMuchHaveYouPaidGuard.apply(RESPONSE_TASK_LIST_URL), async (req: Request, res: Response, next: NextFunction) => {
      try {
        const howMuchHaveYouPaid: HowMuchHaveYouPaid = await howMuchHaveYouPaidService.getHowMuchHaveYouPaid(generateRedisKey(req as unknown as AppRequest), ResponseType.PART_ADMISSION);

        res.render(howMuchHaveYouPaidPath, {
          form: new GenericForm(howMuchHaveYouPaid), lastMonth: getLastMonth(), totalClaimAmount: howMuchHaveYouPaid.totalClaimAmount,
        });
      } catch (error) {
        next(error);
      }
    })
  .post(
    CITIZEN_AMOUNT_YOU_PAID_URL, async (req, res, next: NextFunction) => {
      try {
        const redisKey = generateRedisKey(req as unknown as AppRequest);
        // Always read the claim amount from this user's own draft claim - never cache it at module level,
        // as module state is shared between all users on the same node process.
        const claim = await getCaseDataFromStore(redisKey);
        const howMuchHaveYouPaid = howMuchHaveYouPaidService.buildHowMuchHaveYouPaid(toNumberOrUndefined(req.body.amount), claim?.totalClaimAmount, req.body.year, req.body.month, req.body.day, req.body.text);
        const form: GenericForm<HowMuchHaveYouPaid> = new GenericForm<HowMuchHaveYouPaid>(howMuchHaveYouPaid);
        await form.validate();

        if (form.hasErrors()) {
          res.render(howMuchHaveYouPaidPath, {
            form: form, lastMonth: getLastMonth(), totalClaimAmount: howMuchHaveYouPaid.totalClaimAmount,
          });
        } else {
          await howMuchHaveYouPaidService.saveHowMuchHaveYouPaid(redisKey, howMuchHaveYouPaid, ResponseType.PART_ADMISSION);
          const claimId = getRouteParam(req, 'id');
          res.redirect(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
        }
      } catch (error) {
        next(error);
      }
    });

export default howMuchHaveYouPaidController;
