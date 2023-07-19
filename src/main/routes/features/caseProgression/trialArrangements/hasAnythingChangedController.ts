import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  DEFENDANT_SUMMARY_URL,
  HAS_ANYTHING_CHANGED_URL,
  HEARING_DURATION_URL,
} from 'routes/urls';
import {getClaimById} from 'modules/utilityService';
import {GenericForm} from 'form/models/genericForm';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getHasAnythingChanged} from 'services/features/caseProgression/trialArrangements/hasAnythingChanged';
import {HasAnythingChangedForm} from 'models/caseProgression/trialArrangements/hasAnythingChangedForm';
import {saveCaseProgression} from 'services/features/caseProgression/caseProgressionService';

const hasAnythingChangedViewPath = 'features/caseProgression/trialArrangements/has-anything-changed';
const hasAnythingChangedController = Router();
const dqPropertyName = 'hasAnythingChanged';

hasAnythingChangedController.get([HAS_ANYTHING_CHANGED_URL], (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req);
    const form = new GenericForm(new HasAnythingChangedForm());
    await renderView(res, claimId, claim, form);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

hasAnythingChangedController.post([HAS_ANYTHING_CHANGED_URL], (async (req, res, next) => {
  try {
    const option = req.body.option;
    const whatSupport = req.body.whatSupport;
    const form = new GenericForm(new HasAnythingChangedForm(option,whatSupport));
    await form.validate();
    const claimId = req.params.id;
    if (form.hasErrors()) {
      const claim: Claim = await getCaseDataFromStore(req.params.id);
      await renderView(res, claimId, claim, form);
    } else {
      await saveCaseProgression(claimId, form.model, dqPropertyName);
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
