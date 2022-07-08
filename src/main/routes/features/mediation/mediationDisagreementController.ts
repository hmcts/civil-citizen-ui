import * as express from 'express';
import {
  MEDIATION_DISAGREEMENT_URL,
  DONT_WANT_FREE_MEDIATION_URL,
  CAN_WE_USE_URL,
  CAN_WE_USE_COMPANY_URL,
} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {FreeMediation} from '../../../common/form/models/mediation/freeMediation';
import {getMediation, saveMediation} from '../../../services/features/response/mediation/mediationService';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {YesNo} from '../../../common/form/models/yesNo';
import {Claim} from '../../../common/models/claim';
import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';
import {CounterpartyType} from '../../../common/models/counterpartyType';

const mediationDisagreementViewPath = 'features/mediation/mediation-disagreement';
const mediationDisagreementController = express.Router();

function renderView(form: GenericForm<FreeMediation>, res: express.Response): void {
  const alreadyPaid = Object.assign(form);
  alreadyPaid.option = form.model.option;
  res.render(mediationDisagreementViewPath, { form });
}

mediationDisagreementController.get(MEDIATION_DISAGREEMENT_URL, async (req, res, next: express.NextFunction) => {
  try {
    const mediation = await getMediation(req.params.id);
    const freeMediationForm = new GenericForm(new FreeMediation(mediation.mediationDisagreement?.option));
    renderView(freeMediationForm, res);
  } catch (error) {
    next(error);
  }
});

mediationDisagreementController.post(MEDIATION_DISAGREEMENT_URL, async (req, res, next: express.NextFunction) => {
  try {
    const claim: Claim = await getCaseDataFromStore(req.params.id);
    const mediationDisagreement = new FreeMediation(req.body.option);
    const mediationDisagreementForm = new GenericForm(mediationDisagreement);
    await mediationDisagreementForm.validate();

    if (mediationDisagreementForm.hasErrors()) {
      renderView(mediationDisagreementForm, res);
    } else {
      await saveMediation(req.params.id, mediationDisagreement, 'mediationDisagreement');
      if (req.body.option === YesNo.NO) {
        res.redirect(constructResponseUrlWithIdParams(req.params.id, DONT_WANT_FREE_MEDIATION_URL));
      } else {
        if (claim.respondent1.type === CounterpartyType.INDIVIDUAL || claim.respondent1.type === CounterpartyType.SOLE_TRADER) {
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
