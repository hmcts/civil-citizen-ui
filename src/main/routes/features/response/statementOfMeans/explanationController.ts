import * as express from 'express';
import {CITIZEN_EXPLANATION_URL, CLAIM_TASK_LIST_URL} from '../../../urls';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {getExplanation, saveExplanation} from '../../../../modules/statementOfMeans/explanationService';
import {Explanation} from '../../../../common/form/models/statementOfMeans/explanation';
import {GenericForm} from '../../../../common/form/models/genericForm';

const explanationViewPath = 'features/response/statementOfMeans/explanation';
const explanationController = express.Router();
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('explanationController');

explanationController.get(CITIZEN_EXPLANATION_URL, async (req, res) => {
  try {
    const explanation: Explanation = await getExplanation(req.params.id);
    res.render(explanationViewPath, { form: new GenericForm(explanation) });
  } catch (error) {
    logger.error(error);
    res.status(500).send({ error: error.message });
  }
});

explanationController.post(CITIZEN_EXPLANATION_URL,
  async (req, res) => {
    const explanation: Explanation = new Explanation(req.body.text);
    const form: GenericForm<Explanation> = new GenericForm(explanation);
    await form.validate();
    if (form.hasErrors()) {
      res.render(explanationViewPath, { form });
    } else {
      try {
        await saveExplanation(req.params.id, explanation);
        res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL));
      } catch (error) {
        logger.error(error);
        res.status(500).send({ error: error.message });
      }
    }
  });

export default explanationController;
