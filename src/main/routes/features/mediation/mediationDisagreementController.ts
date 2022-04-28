import * as express from 'express';
import {
  MEDIATION_DISAGREEMENT_URL,
  DONT_WANT_FREE_MEDIATION_URL,
  CAN_WE_USE_URL,
  CAN_WE_USE_COMPANY_URL,
} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {FreeMediation} from '../../../common/form/models/mediation/FreeMediation';
import {getMediation, saveMediation} from '../../../modules/mediation/mediationService';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {YesNo} from '../../../common/form/models/yesNo';
import {Claim} from 'common/models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {CounterpartyType} from 'common/models/counterpartyType';

const mediationDisagreementViewPath = 'features/mediation/mediation-disagreement';
const mediationDisagreementController = express.Router();
const {Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('mediationDisagreementController');

function renderView(form: GenericForm<FreeMediation>, res: express.Response): void {
  const alreadyPaid = Object.assign(form);
  alreadyPaid.option = form.model.option;
  res.render(mediationDisagreementViewPath, { form });
}

mediationDisagreementController.get(MEDIATION_DISAGREEMENT_URL, async (req, res) => {
  try {
    const mediation = await getMediation(req.params.id);
    const freeMediationForm = new GenericForm(new FreeMediation(mediation.mediationDisagreement?.option));
    renderView(freeMediationForm, res);
  } catch (error) {
    logger.error(error);
    res.status(500).send({ error: error.message });
  }
});

mediationDisagreementController.post(MEDIATION_DISAGREEMENT_URL, async (req, res) => {
  try {
    const claim: Claim = await getCaseDataFromStore(req.params.id);
    const mediationDisagreement = new FreeMediation(req.body.option);
    const mediationDisagreementForm = new GenericForm(mediationDisagreement);
    await mediationDisagreementForm.validate();

    if (mediationDisagreementForm.hasErrors()) {
      renderView(mediationDisagreementForm, res);
    } else {
      await saveMediation(req.params.id, mediationDisagreement, "mediationDisagreement");

      if (req.body.option === YesNo.NO) {
        res.redirect(constructResponseUrlWithIdParams(req.params.id, DONT_WANT_FREE_MEDIATION_URL));
      } else {
        if (claim.applicant1.type === CounterpartyType.INDIVIDUAL || CounterpartyType.SOLE_TRADER) {
          if (claim.mediation?.individualTelephone) {
            // Then display  'Confirm your telephone number' screen IF telephone number is Not Null
            res.redirect(constructResponseUrlWithIdParams(req.params.id, CAN_WE_USE_URL));
          } else {
            // Or display  'Enter a phone number' screen IF telephone number is Null
            res.redirect(constructResponseUrlWithIdParams(req.params.id, CAN_WE_USE_URL));
          }
        } else if (claim.respondent1.type === CounterpartyType.COMPANY || CounterpartyType.ORGANISATION) {
          if (!claim.respondent1.individualFirstName || !claim.respondent1.individualFirstName) {
            // Then display 'Who should the mediation service call' screen IF contact name for company or organisation is Null 
            res.redirect(constructResponseUrlWithIdParams(req.params.id, CAN_WE_USE_COMPANY_URL));
          } else {
            // Or display 'The right person for mediation service to call' screen IF contact name for company or organisation is Not Null 
            res.redirect(constructResponseUrlWithIdParams(req.params.id, CAN_WE_USE_COMPANY_URL));
          }
        }
      }
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

export default mediationDisagreementController;
