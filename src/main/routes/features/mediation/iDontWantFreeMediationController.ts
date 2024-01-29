import {NextFunction, Request, Response, Router} from 'express';
import {NoMediationReason} from 'form/models/mediation/noMediationReason';
import {GenericForm} from 'form/models/genericForm';
import {Mediation} from 'models/mediation/mediation';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getMediation, saveMediation} from 'services/features/response/mediation/mediationService';
import {CLAIMANT_RESPONSE_TASK_LIST_URL, DONT_WANT_FREE_MEDIATION_URL, RESPONSE_TASK_LIST_URL} from '../../urls';
import {NoMediationReasonOptions} from 'form/models/mediation/noMediationReasonOptions';
import {Claim} from 'common/models/claim';
import {getCaseDataFromStore, generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';

const iDontWantFreeMediationViewPath = 'features/mediation/i-dont-want-free-mediation';
const iDontWantFreeMediationController = Router();

function renderView(form: GenericForm<NoMediationReason>, redirectUrl: string, res: Response): void {
  res.render(iDontWantFreeMediationViewPath, {form, redirectUrl, NoMediationReasonOptions: NoMediationReasonOptions});
}

iDontWantFreeMediationController.get(DONT_WANT_FREE_MEDIATION_URL, async (req, res, next: NextFunction) => {
  try {
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim: Claim = await getCaseDataFromStore(redisKey);
    const redirectUrl = constructResponseUrlWithIdParams(req.params.id, claim.isClaimantIntentionPending() ? CLAIMANT_RESPONSE_TASK_LIST_URL : RESPONSE_TASK_LIST_URL);
    const mediation: Mediation = await getMediation(redisKey);
    renderView(new GenericForm(mediation?.noMediationReason), redirectUrl, res);
  } catch (error) {
    next(error);
  }
});

iDontWantFreeMediationController.post(DONT_WANT_FREE_MEDIATION_URL,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const redisKey = generateRedisKey(<AppRequest>req);
      const claim: Claim = await getCaseDataFromStore(redisKey);
      const redirectUrl = constructResponseUrlWithIdParams(req.params.id, claim.isClaimantIntentionPending() ? CLAIMANT_RESPONSE_TASK_LIST_URL : RESPONSE_TASK_LIST_URL);
      const noMediationReasonForm = new GenericForm(new NoMediationReason(req.body.disagreeMediationOption, req.body.otherReason));
      await noMediationReasonForm.validate();
      if (noMediationReasonForm.hasErrors()) {
        renderView(noMediationReasonForm, redirectUrl, res);
      } else {
        if (req.body.disagreeMediationOption !== NoMediationReasonOptions.OTHER) {
          noMediationReasonForm.model.otherReason = '';
        }
        await saveMediation(redisKey, noMediationReasonForm.model, 'noMediationReason');
        res.redirect(redirectUrl);
      }
    } catch (error) {
      next(error);
    }
  });

export default iDontWantFreeMediationController;
