import {NextFunction, Router} from 'express';
import {GenericForm} from 'common/form/models/genericForm';
import {
  getExpertDetails,
  getExpertDetailsForm,
} from '../../../../services/features/directionsQuestionnaire/expertDetailsService';
import {saveDirectionQuestionnaire} from '../../../../services/features/directionsQuestionnaire/directionQuestionnaireService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {DQ_EXPERT_DETAILS_URL, DQ_DEFENDANT_EXPERT_EVIDENCE_URL} from '../../../urls';

const expertDetailsController = Router();
const expertDetailsViewPath = 'features/directionsQuestionnaire/experts/expert-details';
const dqPropertyName = 'expertDetailsList';
const dqParentName = 'experts';

expertDetailsController.get(DQ_EXPERT_DETAILS_URL, async (req, res, next: NextFunction) => {
  try {
    const form = new GenericForm(await getExpertDetails(req.params.id));
    res.render(expertDetailsViewPath, {form});
  } catch (error) {
    next(error);
  }
});

expertDetailsController.post(DQ_EXPERT_DETAILS_URL, async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const expertDetailsList = getExpertDetailsForm(req.body.items);
    const form = new GenericForm(expertDetailsList);
    form.validateSync();

    if (form.hasNestedErrors()) {
      res.render(expertDetailsViewPath, {form});
    } else {
      await saveDirectionQuestionnaire(claimId, expertDetailsList, dqPropertyName, dqParentName);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, DQ_DEFENDANT_EXPERT_EVIDENCE_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default expertDetailsController;
