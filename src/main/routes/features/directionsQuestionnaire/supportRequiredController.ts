import * as express from 'express';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {CLAIM_TASK_LIST_URL, SUPPORT_REQUIRED_URL} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {Support, SupportRequired} from '../../../common/models/directionsQuestionnaire/supportRequired';
import {
  getSupportRequired,
} from '../../../services/features/directionsQuestionnaire/supportRequiredService';
import {
  saveDirectionQuestionnaire,
} from '../../../services/features/directionsQuestionnaire/directionQuestionnaireService';

const supportRequiredController = express.Router();
const supportRequiredViewPath = 'features/directionsQuestionnaire/support-required';

supportRequiredController.get(SUPPORT_REQUIRED_URL, async (req, res, next: express.NextFunction) => {
  try {
    const form = new GenericForm(await getSupportRequired(req.params.id));
    res.render(supportRequiredViewPath, {form});
  } catch (error) {
    next(error);
  }
});

supportRequiredController.post(SUPPORT_REQUIRED_URL, async (req, res, next: express.NextFunction) => {
  try {
    const claimId = req.params.id;
    if (req.body.declared) {
      req.body.declared.forEach((supportName: keyof SupportRequired) => {
        if (req.body.model[supportName]) {
          req.body.model[supportName] = new Support(true, req.body.model[supportName].content);
        } else {
          req.body.model[supportName] = new Support(true);
        }
      });
    }
    const form = new GenericForm(new SupportRequired(req.body.model));
    form.validateSync();
    if (form.hasErrors()) {
      res.render(supportRequiredViewPath, {form});
    } else {
      await saveDirectionQuestionnaire(claimId, form.model, 'supportRequired');
      res.redirect(constructResponseUrlWithIdParams(claimId, CLAIM_TASK_LIST_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default supportRequiredController;
