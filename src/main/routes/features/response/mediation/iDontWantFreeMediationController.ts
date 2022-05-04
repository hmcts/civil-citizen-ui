import * as express from 'express';
import {NoMediationReason} from '../../../../common/form/models/mediation/noMediationReason';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {Mediation} from '../../../../common/models/mediation/mediation';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {getMediation, saveMediation} from '../../../../modules/mediation/mediationService';
import {CLAIM_TASK_LIST_URL, DONT_WANT_FREE_MEDIATION_URL} from '../../../urls';
import NoMediationReasonOptions from '../../../../common/form/models/mediation/noMediationReasonOptions';

const iDontWantFreeMediationViewPath = 'features/response/mediation/i-dont-want-free-mediation';
const iDontWantFreeMediationController = express.Router();

async function renderView(form: GenericForm<NoMediationReason>, res: express.Response): Promise<void> {
  res.render(iDontWantFreeMediationViewPath, {form, NoMediationReasonOptions: NoMediationReasonOptions});
}

iDontWantFreeMediationController.get(DONT_WANT_FREE_MEDIATION_URL, async (req, res) => {
  try {
    const mediation: Mediation = await getMediation(req.params.id);
    renderView(new GenericForm(mediation.noMediationReason), res);
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

iDontWantFreeMediationController.post(DONT_WANT_FREE_MEDIATION_URL,
  async (req: express.Request, res: express.Response) => {
    try {
      const noMediationReasonForm = new GenericForm(new NoMediationReason(req.body.disagreeMediationOption, req.body.otherReason));
      await noMediationReasonForm.validate();
      if (noMediationReasonForm.hasErrors()) {
        renderView(noMediationReasonForm, res);
      } else {
        if (req.body.disagreeMediationOption != NoMediationReasonOptions.OTHER) {
          noMediationReasonForm.model.otherReason = '';
        }
        await saveMediation(req.params.id, noMediationReasonForm.model, 'noMediationReason');
        res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL));
      }
    } catch (error) {
      res.status(500).send({error: error.message});
    }
  });


export default iDontWantFreeMediationController;
