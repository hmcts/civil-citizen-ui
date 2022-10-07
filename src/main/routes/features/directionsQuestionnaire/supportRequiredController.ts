import * as express from 'express';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {CLAIM_TASK_LIST_URL, SUPPORT_REQUIRED_URL} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {saveDirectionQuestionnaire} from '../../../services/features/directionsQuestionnaire/directionQuestionnaireService';
import {
  getSupportRequired,
  getSupportRequiredForm,
  generatePeopleListWithSelectedValues,
} from '../../../services/features/directionsQuestionnaire/supportRequiredService';

const supportRequiredController = express.Router();
const supportRequiredViewPath = 'features/directionsQuestionnaire/support-required-list';
const dqPropertyName = 'supportRequiredList';
const dqParentName = 'hearing';

supportRequiredController.get(SUPPORT_REQUIRED_URL, async (req, res, next: express.NextFunction) => {
  try {
    const [supportRequiredList, peopleLists] = await getSupportRequired(req.params.id);
    const form = new GenericForm(supportRequiredList);
    res.render(supportRequiredViewPath, {form, peopleLists});
  } catch (error) {
    next(error);
  }
});

supportRequiredController.post(SUPPORT_REQUIRED_URL, async (req, res, next: express.NextFunction) => {
  try {
    const claimId = req.params.id;
    const supportRequiredList = getSupportRequiredForm(req);
    const form = new GenericForm(supportRequiredList);
    form.validateSync();
    if (form.hasErrors()) {
      const selectedNames = form.model?.items?.map(item => item.fullName);
      const peopleLists = await generatePeopleListWithSelectedValues(claimId, selectedNames);
      res.render(supportRequiredViewPath, {form, peopleLists});
    } else {
      await saveDirectionQuestionnaire(claimId, form.model, dqPropertyName, dqParentName);
      res.redirect(constructResponseUrlWithIdParams(claimId, CLAIM_TASK_LIST_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default supportRequiredController;
