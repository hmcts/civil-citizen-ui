import * as express from 'express';
import {EXPERT_GUIDANCE_URL} from '../../urls';

const expertGuidanceController = express.Router();
const expertGuidanceViewPath = 'features/directionsQuestionnaire/expert-guidance';

expertGuidanceController.get(EXPERT_GUIDANCE_URL, async (_req, res) => {
  try {
    res.render(expertGuidanceViewPath);
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

export default expertGuidanceController;
