import {NextFunction, Response, Router} from 'express';
import {
  CAN_WE_USE_COMPANY_URL,
  CAN_WE_USE_URL,
  DONT_WANT_FREE_MEDIATION_URL,
  MEDIATION_DISAGREEMENT_URL,
} from '../../urls';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {getMediation, saveMediation} from 'services/features/response/mediation/mediationService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {YesNo} from 'form/models/yesNo';
import {Claim} from 'models/claim';
import {getCaseDataFromStore, generateRedisKey} from 'modules/draft-store/draftStoreService';
import {PartyType} from 'models/partyType';
import {CaseState} from 'form/models/claimDetails';
import {AppRequest} from 'common/models/AppRequest';

const mediationDisagreementViewPath = 'features/mediation/mediation-disagreement';
const mediationDisagreementController = Router();

function renderView(form: GenericForm<GenericYesNo>, res: Response, claimStatus: CaseState): void {
  res.render(mediationDisagreementViewPath, {form, claimStatus});
}

mediationDisagreementController.get(MEDIATION_DISAGREEMENT_URL, async (req, res, next: NextFunction) => {
  try {
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim: Claim = await getCaseDataFromStore(redisKey);
    const mediation = await getMediation(redisKey);
    const freeMediationForm = new GenericForm(new GenericYesNo(mediation.mediationDisagreement?.option));
    renderView(freeMediationForm, res, claim.ccdState);
  } catch (error) {
    next(error);
  }
});

mediationDisagreementController.post(MEDIATION_DISAGREEMENT_URL, async (req, res, next: NextFunction) => {
  try {
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim: Claim = await getCaseDataFromStore(redisKey);
    const mediationDisagreement = new GenericYesNo(req.body.option);
    const mediationDisagreementForm = new GenericForm(mediationDisagreement);
    await mediationDisagreementForm.validate();

    if (mediationDisagreementForm.hasErrors()) {
      renderView(mediationDisagreementForm, res, claim.ccdState);
    } else {
      await saveMediation(redisKey, mediationDisagreement, 'mediationDisagreement');
      if (claim.mediation?.canWeUse || claim.claimantResponse?.mediation?.canWeUse) {
        await saveMediation(redisKey, undefined, 'canWeUse');
      }
      if (req.body.option === YesNo.NO) {
        res.redirect(constructResponseUrlWithIdParams(req.params.id, DONT_WANT_FREE_MEDIATION_URL));
      } else if (claim.respondent1.type === PartyType.INDIVIDUAL || claim.respondent1.type === PartyType.SOLE_TRADER) {
        res.redirect(constructResponseUrlWithIdParams(req.params.id, CAN_WE_USE_URL));
      } else {
        res.redirect(constructResponseUrlWithIdParams(req.params.id, CAN_WE_USE_COMPANY_URL));
      }
    }
  } catch (error) {
    next(error);
  }
});

export default mediationDisagreementController;
