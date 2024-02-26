import {NextFunction, RequestHandler, Response, Router} from 'express';
import {WhyDoYouDisagree} from 'form/models/admission/partialAdmission/whyDoYouDisagree';
import {
  getWhyDoYouDisagreeForm,
  saveWhyDoYouDisagreeData,
} from 'services/features/response/admission/whyDoYouDisagreeService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {CITIZEN_TIMELINE_URL, CITIZEN_WHY_DO_YOU_DISAGREE_URL, RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {WhyDoYouDisagreeForm} from 'models/whyDoYouDisagreeForm';
import {GenericForm} from 'form/models/genericForm';
import {ResponseType} from 'form/models/responseType';
import {PartAdmitHowMuchHaveYouPaidGuard} from 'routes/guards/partAdmitHowMuchHaveYouPaidGuard';
import {AppRequest} from 'common/models/AppRequest';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';

const whyDoYouDisagreeController = Router();
const whyDoYouDisagreeViewPath = 'features/response/admission/why-do-you-disagree';
let claimAmount: number;

function renderView(form: GenericForm<WhyDoYouDisagree>, _claimAmount: number, res: Response) {
  res.render(whyDoYouDisagreeViewPath, {form, claimAmount: _claimAmount});
}

whyDoYouDisagreeController.get(CITIZEN_WHY_DO_YOU_DISAGREE_URL, PartAdmitHowMuchHaveYouPaidGuard.apply(RESPONSE_TASK_LIST_URL), (async (req, res, next: NextFunction) => {
  try {
    const form = await getWhyDoYouDisagreeForm(generateRedisKey(<AppRequest>req), ResponseType.PART_ADMISSION);
    claimAmount = form.claimAmount;
    renderView(new GenericForm(form.whyDoYouDisagree), claimAmount, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

whyDoYouDisagreeController.post(CITIZEN_WHY_DO_YOU_DISAGREE_URL, (async (req, res, next: NextFunction) => {
  const whyDoYouDisagree = new WhyDoYouDisagree(req.body.text);
  const whyDoYouDisagreeForm = new WhyDoYouDisagreeForm();
  whyDoYouDisagreeForm.claimAmount = claimAmount;
  whyDoYouDisagreeForm.whyDoYouDisagree = whyDoYouDisagree;
  const form = new GenericForm(whyDoYouDisagree);
  await form.validate();
  try {
    if (form.hasErrors() || form.hasNestedErrors()) {
      renderView(form, whyDoYouDisagreeForm.claimAmount, res);
    } else {
      await saveWhyDoYouDisagreeData(generateRedisKey(<AppRequest>req), form.model, ResponseType.PART_ADMISSION);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_TIMELINE_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default whyDoYouDisagreeController;
