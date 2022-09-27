import * as express from 'express';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {ExpertDetails} from '../../../../common/models/directionsQuestionnaire/experts/expertDetails';
import {
  getExpertDetails,
  saveExpertDetails,
} from '../../../../services/features/directionsQuestionnaire/expertDetailsService';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {DQ_EXPERT_DETAILS_URL, DQ_DEFENDANT_EXPERT_EVIDENCE_URL} from '../../../urls';
import {ExpertDetailsList} from '../../../../common/models/directionsQuestionnaire/experts/expertDetailsList';
import {toNumber} from 'lodash';

const expertDetailsController = express.Router();
const expertDetailsViewPath = 'features/directionsQuestionnaire/experts/expert-details';

expertDetailsController.get(DQ_EXPERT_DETAILS_URL, async (req, res, next: express.NextFunction) => {
  try {
    const form = new GenericForm(await getExpertDetails(req.params.id));
    res.render(expertDetailsViewPath, {form});
  } catch (error) {
    next(error);
  }
});

expertDetailsController.post(DQ_EXPERT_DETAILS_URL, async (req, res, next: express.NextFunction) => {
  try {
    const claimId = req.params.id;
    const expertDetailsList: ExpertDetailsList = new ExpertDetailsList(req.body.items.map((expertDetail: ExpertDetails) => new ExpertDetails(
      expertDetail.firstName,
      expertDetail.lastName,
      expertDetail.emailAddress,
      expertDetail.phoneNumber,
      expertDetail.whyNeedExpert,
      expertDetail.fieldOfExpertise,
      toNumber(expertDetail.estimatedCost),
    )));

    const form = new GenericForm(expertDetailsList);
    form.validateSync();

    if (form.hasNestedErrors()) {
      res.render(expertDetailsViewPath, {form});
    } else {
      await saveExpertDetails(claimId, expertDetailsList, 'expertDetailsList');
      res.redirect(constructResponseUrlWithIdParams(req.params.id, DQ_DEFENDANT_EXPERT_EVIDENCE_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default expertDetailsController;
