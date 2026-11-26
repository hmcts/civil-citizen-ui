import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  CITIZEN_FR_AMOUNT_YOU_PAID_URL,
  CITIZEN_FULL_REJECTION_YOU_PAID_LESS_URL,
  RESPONSE_TASK_LIST_URL,
} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import howMuchHaveYouPaidService from '../../../../../services/features/response/admission/howMuchHaveYouPaidService';
import {HowMuchHaveYouPaid} from 'form/models/admission/howMuchHaveYouPaid';
import {toNumberOrUndefined} from 'common/utils/numberConverter';
import {ResponseType} from 'form/models/responseType';
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
    CITIZEN_FR_AMOUNT_YOU_PAID_URL, (async (req: Request, res: Response, next: NextFunction) => {
      try {
        const howMuchHaveYouPaid: HowMuchHaveYouPaid = await howMuchHaveYouPaidService.getHowMuchHaveYouPaid(generateRedisKey(<AppRequest>req), ResponseType.FULL_DEFENCE);

        res.render(howMuchHaveYouPaidPath, {
          form: new GenericForm(howMuchHaveYouPaid),
          lastMonth: getLastMonth(),
          totalClaimAmount: howMuchHaveYouPaid.totalClaimAmount,
          responseType: ResponseType.FULL_DEFENCE,
        });
      } catch (error) {
        next(error);
      }
    }) as RequestHandler)
  .post(
    CITIZEN_FR_AMOUNT_YOU_PAID_URL, (async (req, res, next: NextFunction) => {
      try {
        const redisKey = generateRedisKey(<AppRequest>req);
        // Always read the claim amount from this user's own draft claim - never cache it at module level,
        // as module state is shared between all users on the same node process.
        const claim = await getCaseDataFromStore(redisKey);
        const howMuchHaveYouPaid = howMuchHaveYouPaidService.buildHowMuchHaveYouPaid(toNumberOrUndefined(req.body.amount), claim?.totalClaimAmount, req.body.year, req.body.month, req.body.day, req.body.text);
        const form: GenericForm<HowMuchHaveYouPaid> = new GenericForm<HowMuchHaveYouPaid>(howMuchHaveYouPaid);
        const paid = toNumberOrUndefined(req.body.amount);
        await form.validate();

        if (form.hasErrors()) {
          res.render(howMuchHaveYouPaidPath, {
            form: form,
            lastMonth: getLastMonth(),
            totalClaimAmount: howMuchHaveYouPaid.totalClaimAmount,
            responseType: ResponseType.FULL_DEFENCE,
          });
        } else {
          await howMuchHaveYouPaidService.saveHowMuchHaveYouPaid(redisKey, howMuchHaveYouPaid, ResponseType.FULL_DEFENCE);
          const claimId = getRouteParam(req, 'id');
          if (paid < howMuchHaveYouPaid.totalClaimAmount) {
            res.redirect(constructResponseUrlWithIdParams(claimId, CITIZEN_FULL_REJECTION_YOU_PAID_LESS_URL));
          } else {
            res.redirect(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
          }
        }
      } catch (error) {
        next(error);
      }
    }) as RequestHandler);

export default howMuchHaveYouPaidController;
