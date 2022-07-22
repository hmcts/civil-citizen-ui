import * as express from 'express';
import {CITIZEN_EXPLANATION_URL, CLAIM_TASK_LIST_URL} from '../../../urls';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {getExplanation, saveExplanation} from '../../../../services/features/response/statementOfMeans/explanationService';
import {Explanation} from '../../../../common/form/models/statementOfMeans/explanation';
import {GenericForm} from '../../../../common/form/models/genericForm';

const explanationViewPath = 'features/response/statementOfMeans/explanation';
const explanationController = express.Router();

explanationController.get(CITIZEN_EXPLANATION_URL, async (req, res, next: express.NextFunction) => {
  try {
    const explanation: Explanation = await getExplanation(req.params.id);
    res.render(explanationViewPath, { form: new GenericForm(explanation) });
  } catch (error) {
    next(error);
  }
});

explanationController.post(CITIZEN_EXPLANATION_URL,
  async (req, res, next: express.NextFunction) => {
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
        next(error);
      }
    }
  });

export default explanationController;
