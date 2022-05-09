import * as express from 'express';
import {MEDIATION_DISAGREEMENT_URL} from '../../../urls';
import {GenericForm} from '../../../../common/form/models/genericForm';

const sendYourResponseByEmailViewPath = 'features/response/eligibility/send-your-response-by-email';
const sendYourResponseByEmailController = express.Router();
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('mediationDisagreementController');

function renderView(form: GenericForm<>, res: express.Response): void {
  const alreadyPaid = Object.assign(form);
  alreadyPaid.option = form.model.option;
  res.render(sendYourResponseByEmailViewPath, {form});
}

sendYourResponseByEmailController.get(MEDIATION_DISAGREEMENT_URL, async (req, res) => {
  try {
    const freeMediationForm = new GenericForm(new FreeMediation(mediation.mediationDisagreement?.option));
    renderView(freeMediationForm, res);
  } catch (error) {
    logger.error(error);
    res.status(500).send({error: error.message});
  }
});

export default sendYourResponseByEmailController;
