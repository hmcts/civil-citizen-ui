import {NextFunction, Request, Response, Router} from 'express';
import {NoMediationReason} from '../../../common/form/models/mediation/noMediationReason';
import {GenericForm} from '../../../common/form/models/genericForm';
import {Mediation} from '../../../common/models/mediation/mediation';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {getMediation, saveMediation} from '../../../services/features/response/mediation/mediationService';
import {CLAIMANT_RESPONSE_TASK_LIST_URL, DONT_WANT_FREE_MEDIATION_URL, RESPONSE_TASK_LIST_URL} from '../../urls';
import {NoMediationReasonOptions} from '../../../common/form/models/mediation/noMediationReasonOptions';
import {Claim} from 'common/models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';

const iDontWantFreeMediationViewPath = 'features/mediation/i-dont-want-free-mediation';
const iDontWantFreeMediationController = Router();

function renderView(form: GenericForm<NoMediationReason>, redirectUrl: string, res: Response): void {
  res.render(iDontWantFreeMediationViewPath, {form, redirectUrl, NoMediationReasonOptions: NoMediationReasonOptions});
}

iDontWantFreeMediationController.get(DONT_WANT_FREE_MEDIATION_URL, async (req, res, next: NextFunction) => {
  try {
    const claim: Claim = await getCaseDataFromStore(req.params.id);
    const redirectUrl = constructResponseUrlWithIdParams(req.params.id, claim.isClaimantIntentionPending() ? CLAIMANT_RESPONSE_TASK_LIST_URL : RESPONSE_TASK_LIST_URL);
    const mediation: Mediation = await getMediation(req.params.id);
    renderView(new GenericForm(mediation?.noMediationReason), redirectUrl, res);
  } catch (error) {
    next(error);
  }
});

iDontWantFreeMediationController.post(DONT_WANT_FREE_MEDIATION_URL,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const claim: Claim = await getCaseDataFromStore(req.params.id);
      const redirectUrl = constructResponseUrlWithIdParams(req.params.id, claim.isClaimantIntentionPending() ? CLAIMANT_RESPONSE_TASK_LIST_URL : RESPONSE_TASK_LIST_URL);
      const noMediationReasonForm = new GenericForm(new NoMediationReason(req.body.disagreeMediationOption, req.body.otherReason));
      await noMediationReasonForm.validate();
      if (noMediationReasonForm.hasErrors()) {
        renderView(noMediationReasonForm, redirectUrl, res);
      } else {
        if (req.body.disagreeMediationOption !== NoMediationReasonOptions.OTHER) {
          noMediationReasonForm.model.otherReason = '';
        }
        await saveMediation(req.params.id, noMediationReasonForm.model, 'noMediationReason');
        res.redirect(redirectUrl);
      }
    } catch (error) {
      next(error);
    }
  });

export default iDontWantFreeMediationController;
