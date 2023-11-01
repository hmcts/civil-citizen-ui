import {NextFunction, Request, Response, Router} from 'express';
import {HowMuchDoYouOwe} from '../../../../../common/form/models/admission/partialAdmission/howMuchDoYouOwe';
import {CITIZEN_OWED_AMOUNT_URL, RESPONSE_TASK_LIST_URL} from '../../../../urls';
import {
  getHowMuchDoYouOweForm,
  saveHowMuchDoYouOweData,
} from '../../../../../services/features/response/admission/partialAdmission/howMuchDoYouOweService';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {toNumberOrUndefined} from '../../../../../common/utils/numberConverter';
import {GenericForm} from '../../../../../common/form/models/genericForm';
import {PartAdmitHowMuchHaveYouPaidGuard} from '../../../../../routes/guards/partAdmitHowMuchHaveYouPaidGuard';
import {AppRequest} from 'common/models/AppRequest';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';

const howMuchDoYouOweViewPath = 'features/response/admission/partialAdmission/how-much-do-you-owe';
const howMuchDoYouOweController = Router();

function renderView(form: GenericForm<HowMuchDoYouOwe>, res: Response) {
  res.render(howMuchDoYouOweViewPath, {form: form});
}

howMuchDoYouOweController.get(CITIZEN_OWED_AMOUNT_URL, PartAdmitHowMuchHaveYouPaidGuard.apply(RESPONSE_TASK_LIST_URL), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const howMuchDoYouOweForm = await getHowMuchDoYouOweForm(generateRedisKey(<AppRequest>req));
    renderView(new GenericForm(howMuchDoYouOweForm), res);
  } catch (error) {
    next(error);
  }
});

howMuchDoYouOweController.post(CITIZEN_OWED_AMOUNT_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const redisKey = generateRedisKey(<AppRequest>req);
    const savedValues = await getHowMuchDoYouOweForm(redisKey);
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
});

export default howMuchDoYouOweController;
