import * as express from 'express';
import {
  ELIGIBILITY_HELP_WITH_FEES,
  ELIGIBILITY_HELP_WITH_FEES_REFERENCE,
} from '../../../../routes/urls';

const applyForHelpWithFeesController = express.Router();
const applyForHelpWithFeesControllerViewPath = 'features/public/eligibility/apply-for-help-with-fees';

applyForHelpWithFeesController.get(ELIGIBILITY_HELP_WITH_FEES, (req, res) => {
  res.render(applyForHelpWithFeesControllerViewPath);
});

applyForHelpWithFeesController.post(ELIGIBILITY_HELP_WITH_FEES, (req, res) => {
  res.redirect(ELIGIBILITY_HELP_WITH_FEES_REFERENCE);
});

export default applyForHelpWithFeesController;
