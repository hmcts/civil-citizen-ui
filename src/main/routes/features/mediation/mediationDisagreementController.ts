import * as express from 'express';
import {
  CAN_WE_USE_COMPANY_URL,
  CAN_WE_USE_URL,
  DONT_WANT_FREE_MEDIATION_URL,
  MEDIATION_DISAGREEMENT_URL,
} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {GenericYesNo} from '../../../common/form/models/genericYesNo';
import {getMediation, saveMediation} from '../../../services/features/response/mediation/mediationService';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {YesNo} from '../../../common/form/models/yesNo';
import {Claim} from '../../../common/models/claim';
import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';
import {PartyType} from 'models/partyType';

const mediationDisagreementViewPath = 'features/mediation/mediation-disagreement';
const mediationDisagreementController = express.Router();

function renderView(form: GenericForm<GenericYesNo>, res: express.Response): void {
  res.render(mediationDisagreementViewPath, {form});
}

mediationDisagreementController.get(MEDIATION_DISAGREEMENT_URL, async (req, res, next: express.NextFunction) => {
  try {
    const mediation = await getMediation(req.params.id);
    const freeMediationForm = new GenericForm(new GenericYesNo(mediation.mediationDisagreement?.option));
    renderView(freeMediationForm, res);
  } catch (error) {
    next(error);
  }
});

mediationDisagreementController.post(MEDIATION_DISAGREEMENT_URL, async (req, res, next: express.NextFunction) => {
  try {
    const claim: Claim = await getCaseDataFromStore(req.params.id);
    const mediationDisagreement = new GenericYesNo(req.body.option);
    const mediationDisagreementForm = new GenericForm(mediationDisagreement);
    await mediationDisagreementForm.validate();

    if (mediationDisagreementForm.hasErrors()) {
      renderView(mediationDisagreementForm, res);
    } else {
      await saveMediation(req.params.id, mediationDisagreement, 'mediationDisagreement');
      if (claim.mediation?.canWeUse) {
        await saveMediation(req.params.id, undefined, 'canWeUse');
      }
      if (req.body.option === YesNo.NO) {
        res.redirect(constructResponseUrlWithIdParams(req.params.id, DONT_WANT_FREE_MEDIATION_URL));
      } else {
        if (claim.respondent1.type === PartyType.INDIVIDUAL || claim.respondent1.type === PartyType.SOLE_TRADER) {
          res.redirect(constructResponseUrlWithIdParams(req.params.id, CAN_WE_USE_URL));
        } else {
          res.redirect(constructResponseUrlWithIdParams(req.params.id, CAN_WE_USE_COMPANY_URL));
        }
      }
    }
  } catch (error) {
    next(error);
  }
});

export default mediationDisagreementController;
