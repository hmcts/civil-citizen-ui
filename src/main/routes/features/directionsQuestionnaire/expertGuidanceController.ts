import * as express from 'express';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {EXPERT_GUIDANCE_URL, PERMISSION_FOR_EXPERT_URL} from '../../urls';

const expertGuidanceController = express.Router();
const expertGuidanceViewPath = 'features/directionsQuestionnaire/expert-guidance';

expertGuidanceController.get(EXPERT_GUIDANCE_URL, async (_req, res) => {
  try {
    res.render(expertGuidanceViewPath);
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

expertGuidanceController.post(EXPERT_GUIDANCE_URL, async (req, res) => {
  try {
    res.redirect(constructResponseUrlWithIdParams(req.params.id, PERMISSION_FOR_EXPERT_URL));
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

export default expertGuidanceController;
