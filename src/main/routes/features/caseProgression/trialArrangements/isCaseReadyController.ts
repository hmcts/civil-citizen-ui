import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  CP_FINALISE_TRIAL_ARRANGEMENTS_URL,
  DEFENDANT_SUMMARY_URL,
  HAS_ANYTHING_CHANGED_URL,
  IS_CASE_READY_URL,
} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {Claim} from 'models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getIsCaseReady} from 'services/features/caseProgression/trialArrangements/isCaseReady';
import {IsCaseReadyForm} from 'models/caseProgression/trialArrangements/isCaseReadyForm';
import {saveCaseProgression} from 'services/features/caseProgression/caseProgressionService';
import {getClaimById} from 'modules/utilityService';

const isCaseReadyViewPath = 'features/caseProgression/trialArrangements/is-case-ready';
const isCaseReadyController = Router();
const dqPropertyName = 'isCaseReady';
const parentPropertyName = 'defendantTrialArrangements';

isCaseReadyController.get([IS_CASE_READY_URL], (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req);
    const isCaseReady = claim.caseProgression?.defendantTrialArrangements?.isCaseReady;
    const form = new GenericForm(new IsCaseReadyForm(isCaseReady));
    await renderView(res, claimId, claim, form);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

isCaseReadyController.post([IS_CASE_READY_URL], (async (req, res, next) => {
  try {
    const option = req.body.option;
    const form = new GenericForm(new IsCaseReadyForm(option));
    await form.validate();
    const claimId = req.params.id;
    if (form.hasErrors()) {
      const claim: Claim = await getClaimById(claimId, req);
      await renderView(res, claimId, claim, form);
    } else {
      await saveCaseProgression(claimId, form.model.option, dqPropertyName, parentPropertyName);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, HAS_ANYTHING_CHANGED_URL));
    }
  } catch (error) {
    next(error);
  }
})as RequestHandler);

async function renderView(res: Response, claimId: string, claim: Claim, form: GenericForm<IsCaseReadyForm>) {
  const latestUpdatesUrl = constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL);
  const eventStartUrl = constructResponseUrlWithIdParams(claimId, CP_FINALISE_TRIAL_ARRANGEMENTS_URL);
  res.render(isCaseReadyViewPath, {form, isCaseReadyContents:getIsCaseReady(claimId, claim), latestUpdatesUrl, eventStartUrl});
}
export default isCaseReadyController;
