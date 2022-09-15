import * as express from 'express';
import {
  ELIGIBILITY_APPLY_HELP_WITH_FEES_URL,
  ELIGIBILITY_HELP_WITH_FEES_REFERENCE_URL,
} from '../../../../routes/urls';

const applyForHelpWithFeesController = express.Router();
const applyForHelpWithFeesControllerViewPath = 'features/public/eligibility/apply-for-help-with-fees';

applyForHelpWithFeesController.get(ELIGIBILITY_APPLY_HELP_WITH_FEES_URL, (req, res) => {
  res.render(applyForHelpWithFeesControllerViewPath);
});

applyForHelpWithFeesController.post(ELIGIBILITY_APPLY_HELP_WITH_FEES_URL, (req, res) => {
  res.redirect(ELIGIBILITY_HELP_WITH_FEES_REFERENCE_URL);
});

export default applyForHelpWithFeesController;
