import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {HowMuchDoYouOwe} from 'form/models/admission/partialAdmission/howMuchDoYouOwe';
import {CITIZEN_OWED_AMOUNT_URL, RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {
  getHowMuchDoYouOweForm,
  saveHowMuchDoYouOweData,
} from 'services/features/response/admission/partialAdmission/howMuchDoYouOweService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {toNumberOrUndefined} from 'common/utils/numberConverter';
import {GenericForm} from 'form/models/genericForm';
import {PartAdmitHowMuchHaveYouPaidGuard} from 'routes/guards/partAdmitHowMuchHaveYouPaidGuard';
import {AppRequest} from 'common/models/AppRequest';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';

const howMuchDoYouOweViewPath = 'features/response/admission/partialAdmission/how-much-do-you-owe';
const howMuchDoYouOweController = Router();

function renderView(form: GenericForm<HowMuchDoYouOwe>, res: Response) {
  res.render(howMuchDoYouOweViewPath, {form: form});
}

howMuchDoYouOweController.get(CITIZEN_OWED_AMOUNT_URL, PartAdmitHowMuchHaveYouPaidGuard.apply(RESPONSE_TASK_LIST_URL), (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const howMuchDoYouOweForm = await getHowMuchDoYouOweForm(generateRedisKey(<AppRequest>req), lang);
    renderView(new GenericForm(howMuchDoYouOweForm), res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

howMuchDoYouOweController.post(CITIZEN_OWED_AMOUNT_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const redisKey = generateRedisKey(<AppRequest>req);
    const savedValues = await getHowMuchDoYouOweForm(redisKey, lang);
    const howMuchDoYouOwe = new HowMuchDoYouOwe(toNumberOrUndefined(req.body.amount), savedValues.totalAmount);
    const form = new GenericForm(howMuchDoYouOwe);
    await form.validate();
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveHowMuchDoYouOweData(redisKey, form.model);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, RESPONSE_TASK_LIST_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default howMuchDoYouOweController;
