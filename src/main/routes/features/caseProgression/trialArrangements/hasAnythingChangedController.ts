import {NextFunction, RequestHandler, Response, Router} from 'express';
import {DEFENDANT_SUMMARY_URL, HAS_ANYTHING_CHANGED_URL, HEARING_DURATION_URL} from 'routes/urls';
import {getClaimById} from 'modules/utilityService';
import {GenericForm} from 'form/models/genericForm';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getHasAnythingChanged} from 'services/features/caseProgression/trialArrangements/hasAnythingChanged';
import {HasAnythingChangedForm} from 'models/caseProgression/trialArrangements/hasAnythingChangedForm';
import {saveCaseProgression} from 'services/features/caseProgression/caseProgressionService';
import {YesNo} from 'form/models/yesNo';

const hasAnythingChangedViewPath = 'features/caseProgression/trialArrangements/has-anything-changed';
const hasAnythingChangedController = Router();
const dqPropertyName = 'hasAnythingChanged';
const parentPropertyName = 'defendantTrialArrangements';

hasAnythingChangedController.get([HAS_ANYTHING_CHANGED_URL], (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req);
    const hasAnythingChanged = claim.caseProgression?.defendantTrialArrangements?.hasAnythingChanged ?? new HasAnythingChangedForm();
    const form = new GenericForm(hasAnythingChanged);
    await renderView(res, claimId, claim, form);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

hasAnythingChangedController.post([HAS_ANYTHING_CHANGED_URL], (async (req, res, next) => {
  try {
    const option = req.body.option;
    const textArea = req.body.textArea;
    const form = new GenericForm(new HasAnythingChangedForm(option,textArea));
    await form.validate();
    const claimId = req.params.id;
    if (form.hasErrors()) {
      const claim: Claim = await getCaseDataFromStore(req.params.id);
      await renderView(res, claimId, claim, form);
    } else {
      if(form.model.option === YesNo.NO){
        form.model.textArea = '';
      }
      await saveCaseProgression(claimId, form.model, dqPropertyName, parentPropertyName);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, HEARING_DURATION_URL));
    }
  } catch (error) {
    next(error);
  }
})as RequestHandler);

async function renderView(res: Response, claimId: string, claim: Claim, form: GenericForm<HasAnythingChangedForm>) {
  const latestUpdatesUrl = constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL);
  res.render(hasAnythingChangedViewPath, {form, hasAnythingChangedContents:getHasAnythingChanged(claimId, claim), latestUpdatesUrl});
}
export default hasAnythingChangedController;
