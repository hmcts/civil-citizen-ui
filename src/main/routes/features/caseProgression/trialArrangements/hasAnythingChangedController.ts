import {NextFunction, RequestHandler, Response, Router} from 'express';
import {getClaimById} from 'modules/utilityService';
import {
  CANCEL_TRIAL_ARRANGEMENTS,
  IS_CASE_READY_URL,
  HAS_ANYTHING_CHANGED_URL,
  TRIAL_ARRANGEMENTS_HEARING_DURATION,
} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {Claim} from 'models/claim';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getHasAnythingChanged} from 'services/features/caseProgression/trialArrangements/hasAnythingChanged';
import {HasAnythingChangedForm} from 'models/caseProgression/trialArrangements/hasAnythingChangedForm';
import {saveCaseProgression} from 'services/features/caseProgression/caseProgressionService';
import {YesNo} from 'form/models/yesNo';
import {
  getHasAnythingChangedForm,
  getNameTrialArrangements,
} from 'services/features/caseProgression/trialArrangements/trialArrangementsService';
import {AppRequest} from 'models/AppRequest';

const hasAnythingChangedViewPath = 'features/caseProgression/trialArrangements/has-anything-changed';
const hasAnythingChangedController = Router();
const dqPropertyName = 'hasAnythingChanged';

hasAnythingChangedController.get(HAS_ANYTHING_CHANGED_URL, (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const form = new GenericForm(getHasAnythingChangedForm(claim));
    await renderView(res, claimId, claim, form);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

hasAnythingChangedController.post(HAS_ANYTHING_CHANGED_URL,(async (req, res, next) => {
  try {
    const option = req.body.option;
    const textArea = req.body.textArea;
    const form = new GenericForm(new HasAnythingChangedForm(option,textArea));
    await form.validate();
    const claimId = req.params.id;
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim: Claim = await getCaseDataFromStore(redisKey);
    if (form.hasErrors()) {
      await renderView(res, claimId, claim, form);
    } else {
      if (form.model.option === YesNo.NO) {
        form.model.textArea = '';
      }
      const parentPropertyName = getNameTrialArrangements(claim);
      await saveCaseProgression(req, form.model, dqPropertyName, parentPropertyName);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, TRIAL_ARRANGEMENTS_HEARING_DURATION));
    }
  } catch (error) {
    next(error);
  }
})as RequestHandler);

async function renderView(res: Response, claimId: string, claim: Claim, form: GenericForm<HasAnythingChangedForm>) {
  const backLinkUrl = constructResponseUrlWithIdParams(claimId, IS_CASE_READY_URL);
  const cancelUrl = constructResponseUrlWithIdParams(claimId, CANCEL_TRIAL_ARRANGEMENTS);
  res.render(hasAnythingChangedViewPath, {form, hasAnythingChangedContents:getHasAnythingChanged(claimId, claim), backLinkUrl, cancelUrl});
}
export default hasAnythingChangedController;
