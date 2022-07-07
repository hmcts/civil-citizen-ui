import * as express from 'express';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {EXPERT_GUIDANCE_URL, PERMISSION_FOR_EXPERT_URL} from '../../urls';

const expertGuidanceController = express.Router();
const expertGuidanceViewPath = 'features/directionsQuestionnaire/expert-guidance';

expertGuidanceController.get(EXPERT_GUIDANCE_URL, async (_req, res, next: express.NextFunction) => {
  try {
    res.render(expertGuidanceViewPath);
  } catch (error) {
    next(error);
  }
});

expertGuidanceController.post(EXPERT_GUIDANCE_URL, async (req, res, next: express.NextFunction) => {
  try {
    res.redirect(constructResponseUrlWithIdParams(req.params.id, PERMISSION_FOR_EXPERT_URL));
  } catch (error) {
    next(error);
  }
});

export default expertGuidanceController;
