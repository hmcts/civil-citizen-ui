import {NextFunction, Router} from 'express';
import {CITIZEN_EXPLANATION_URL, RESPONSE_TASK_LIST_URL} from '../../../urls';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {
  getExplanation,
  saveExplanation,
} from '../../../../services/features/response/statementOfMeans/explanationService';
import {Explanation} from '../../../../common/form/models/statementOfMeans/explanation';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';

const explanationViewPath = 'features/response/statementOfMeans/explanation';
const explanationController = Router();

explanationController.get(CITIZEN_EXPLANATION_URL, async (req, res, next: NextFunction) => {
  try {
    res.render(explanationViewPath, {form: new GenericForm(await getExplanation(generateRedisKey(<AppRequest>req)))});
  } catch (error) {
    next(error);
  }
});

explanationController.post(CITIZEN_EXPLANATION_URL,
  async (req, res, next: NextFunction) => {
    const explanation: Explanation = new Explanation(req.body.text);
    const form: GenericForm<Explanation> = new GenericForm(explanation);
    await form.validate();
    if (form.hasErrors()) {
      res.render(explanationViewPath, {form});
    } else {
      try {
        await saveExplanation(generateRedisKey(<AppRequest>req), explanation);
        res.redirect(constructResponseUrlWithIdParams(req.params.id, RESPONSE_TASK_LIST_URL));
      } catch (error) {
        next(error);
      }
    }
  });

export default explanationController;
