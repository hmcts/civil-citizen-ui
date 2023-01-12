import {Router} from 'express';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {EXPERT_GUIDANCE_URL, PERMISSION_FOR_EXPERT_URL} from 'routes/urls';

const expertGuidanceController = Router();

expertGuidanceController.get(EXPERT_GUIDANCE_URL, (_req, res) => {
  res.render('features/directionsQuestionnaire/experts/expert-guidance');
});

expertGuidanceController.post(EXPERT_GUIDANCE_URL, (req, res) => {
  res.redirect(constructResponseUrlWithIdParams(req.params.id, PERMISSION_FOR_EXPERT_URL));
});

export default expertGuidanceController;
