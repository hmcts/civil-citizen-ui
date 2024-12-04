import {Router} from 'express';
import {ACCESSIBILITY_STATEMENT_URL, DASHBOARD_URL} from '../../../routes/urls';

const accessibilityStatementController = Router();
const accessibilityStatementViewPath = 'features/public/accessibility-statement';

accessibilityStatementController.get(ACCESSIBILITY_STATEMENT_URL, async (req, res) => {
  res.render(
    accessibilityStatementViewPath,
    {
      dashboardUrl: DASHBOARD_URL,
    },
  );
});

export default accessibilityStatementController;
