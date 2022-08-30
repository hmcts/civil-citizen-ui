import * as express from 'express';
import {
  ELIGIBILITY_HELP_WITH_FEES,
} from '../../../../routes/urls';

const applyForHelpWithFeesController = express.Router();
const applyForHelpWithFeesControllerViewPath = 'features/public/eligibility/apply-for-help-with-fees';

applyForHelpWithFeesController.get(ELIGIBILITY_HELP_WITH_FEES, (req, res) => {
  res.render(applyForHelpWithFeesControllerViewPath);
});

export default applyForHelpWithFeesController;
