import * as express from 'express';
import {IndividualTelephoneNumber} from '../../../../common/form/models/mediation/individualTelephoneNumber';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {Mediation} from '../../../../common/models/mediation';
import { Claim } from '../../../../common/models/claim';
import { YesNo } from '../../../../common/form/models/yesNo';
import { constructResponseUrlWithIdParams } from '../../../../common/utils/urlFormatter';
import { getCaseDataFromStore } from '../../../../modules/draft-store/draftStoreService';
import {
  getMediation,
  saveMediation,
} from '../../../../modules/mediation/mediationService';
import {
  CITIZEN_CONFIRM_TELEPHONE_MEDIATION_URL,
  CLAIM_TASK_LIST_URL,
} from '../../../urls';

const individualTelephoneViewPath = 'features/response/mediation/individual-telephone';
const individualTelephoneController = express.Router();

async function renderView(form: GenericForm<IndividualTelephoneNumber>, res: express.Response, claimId: string): Promise<void> {
  const claim: Claim = await getCaseDataFromStore(claimId);
  res.render(individualTelephoneViewPath, { form, respondentTelNumber: claim.respondent1?.telephoneNumber });
}

const getGenericForm = (individualTelephoneNumber:IndividualTelephoneNumber) => {
  if (individualTelephoneNumber) {
    const form = Object.assign(new GenericForm<IndividualTelephoneNumber>(individualTelephoneNumber));
    form.option = form.model.option;
    return form;
  }
  return new GenericForm<IndividualTelephoneNumber>(individualTelephoneNumber);
};

// -- GET
individualTelephoneController.get(CITIZEN_CONFIRM_TELEPHONE_MEDIATION_URL, async (req, res) => {
  try {
    const mediation: Mediation = await getMediation(req.params.id);
    renderView(getGenericForm(mediation.individualTelephone), res, req.params.id);
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

// -- POST
individualTelephoneController.post(CITIZEN_CONFIRM_TELEPHONE_MEDIATION_URL,
  async (req:express.Request, res:express.Response) => {
    try {
      const claim: Claim = await getCaseDataFromStore(req.params.id);
      const individualTelNumberForm: GenericForm<IndividualTelephoneNumber> = getGenericForm(new IndividualTelephoneNumber(req.body.option, req.body.telephoneNumber));
      await individualTelNumberForm.validate();
      if (individualTelNumberForm.hasErrors()) {
        renderView(individualTelNumberForm, res, req.params.id);
      } else {
        if (req.body.option == YesNo.YES) {
          individualTelNumberForm.model.telephoneNumber = claim.respondent1.telephoneNumber;
        }
        await saveMediation(req.params.id, individualTelNumberForm.model, 'individualTelephone');
        res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL));
      }
    } catch (error) {
      res.status(500).send({error: error.message});
    }
  });


export default individualTelephoneController;
