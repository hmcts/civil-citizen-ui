import * as express from 'express';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {EXPERT_DETAILS_URL, EXPERT_EVIDENCE_URL} from '../../urls';

const expertDetailsController = express.Router();
const expertDetailsViewPath = 'features/directionsQuestionnaire/expert-details';

expertDetailsController.get(EXPERT_DETAILS_URL, async (_req, res, next: express.NextFunction) => {
  try {
    res.render(expertDetailsViewPath);
  } catch (error) {
    next(error);
  }
});

expertDetailsController.post(EXPERT_DETAILS_URL, async (req, res, next: express.NextFunction) => {
  try {
    res.redirect(constructResponseUrlWithIdParams(req.params.id, EXPERT_EVIDENCE_URL));
  } catch (error) {
    next(error);
  }
});

export default expertDetailsController;
