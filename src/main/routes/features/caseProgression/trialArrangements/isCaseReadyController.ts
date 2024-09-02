import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  CANCEL_TRIAL_ARRANGEMENTS,
  CP_FINALISE_TRIAL_ARRANGEMENTS_URL,
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
import {
  getIsCaseReadyForm,
  getNameTrialArrangements,
} from 'services/features/caseProgression/trialArrangements/trialArrangementsService';

const isCaseReadyViewPath = 'features/caseProgression/trialArrangements/is-case-ready';
const isCaseReadyController = Router();
const dqPropertyName = 'isCaseReady';

isCaseReadyController.get([IS_CASE_READY_URL], (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const form = new GenericForm(getIsCaseReadyForm(claim));
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
    const claim: Claim = await getClaimById(claimId, req, true);
    if (form.hasErrors()) {
      await renderView(res, claimId, claim, form);
    } else {
      const parentPropertyName = getNameTrialArrangements(claim);
      await saveCaseProgression(req, form.model.option, dqPropertyName, parentPropertyName);

      res.redirect(constructResponseUrlWithIdParams(claimId, HAS_ANYTHING_CHANGED_URL));
    }
  } catch (error) {
    next(error);
  }
})as RequestHandler);

async function renderView(res: Response, claimId: string, claim: Claim, form: GenericForm<IsCaseReadyForm>) {
  const cancelUrl = constructResponseUrlWithIdParams(claimId, CANCEL_TRIAL_ARRANGEMENTS);
  const backLinkUrl = constructResponseUrlWithIdParams(claimId, CP_FINALISE_TRIAL_ARRANGEMENTS_URL);
  res.render(isCaseReadyViewPath, {form, isCaseReadyContents:getIsCaseReady(claimId, claim), cancelUrl, backLinkUrl});
}
export default isCaseReadyController;
