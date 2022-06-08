// import { constructResponseUrlWithIdParams } from '../../../common/utils/urlFormatter';
import * as express from 'express';
import {EXPERT_GUIDANCE_URL} from '../../urls';

const expertGuidanceController = express.Router();
const expertGuidanceViewPath = 'features/directionsQuestionnaire/expert-guidance';

expertGuidanceController.get(EXPERT_GUIDANCE_URL, async (req, res) => {
  try {
    res.render(expertGuidanceViewPath);
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

expertGuidanceController.post(EXPERT_GUIDANCE_URL, async (req, res) => {
  try {
    // res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL));
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

export default expertGuidanceController;
