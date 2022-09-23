import * as express from 'express';
import { GenericForm } from '../../../../common/form/models/genericForm';
import { ExpertDetails } from '../../../../common/models/directionsQuestionnaire/experts/expertDetails';
import { getExpertDetails, saveExpertDetails } from '../../../../services/features/directionsQuestionnaire/expertDetailsService';
import { constructResponseUrlWithIdParams } from '../../../../common/utils/urlFormatter';
import { EXPERT_DETAILS_URL, EXPERT_EVIDENCE_URL } from '../../../urls';
import { ExpertDetailsList } from '../../../../common/models/directionsQuestionnaire/experts/expertDetailsList';

const expertDetailsController = express.Router();
const expertDetailsViewPath = 'features/directionsQuestionnaire/experts/expert-details';

expertDetailsController.get(EXPERT_DETAILS_URL, async (req, res, next: express.NextFunction) => {
  try {
    const form = new GenericForm(await getExpertDetails(req.params.id));
    res.render(expertDetailsViewPath, { form });
  } catch (error) {
    next(error);
  }
});

expertDetailsController.post(EXPERT_DETAILS_URL, async (req, res, next: express.NextFunction) => {
  try {

    const claimId = req.params.id;
    
    const expertDetailsList: ExpertDetailsList = new ExpertDetailsList(req.body.expertDetailsList.map((expertDetail: ExpertDetails) => new ExpertDetails(
        expertDetail.firstName,
        expertDetail.lastName,
        expertDetail.emailAddress,
        expertDetail.phoneNumber,
        expertDetail.fieldOfExpertise,
        expertDetail.whyNeedExpert,
        expertDetail.estimatedCost,
    )));
    const form = new GenericForm(expertDetailsList);

    form.validateSync();

    if (form.hasErrors()) {
      res.render(expertDetailsViewPath, { form });
    } else {
      await saveExpertDetails(claimId, expertDetailsList.items);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, EXPERT_EVIDENCE_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default expertDetailsController;
