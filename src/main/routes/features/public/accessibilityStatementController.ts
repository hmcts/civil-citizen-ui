import {Router} from 'express';
import {ACCESSIBILITY_STATEMENT_URL, DASHBOARD_URL} from '../../../routes/urls';
import {isCARMEnabled} from '../../../app/auth/launchdarkly/launchDarklyClient';

const accessibilityStatementController = Router();
const accessibilityStatementViewPath = 'features/public/accessibility-statement';

accessibilityStatementController.get(ACCESSIBILITY_STATEMENT_URL, async (req, res) => {
  const carmEnabled = await isCARMEnabled();
  res.render(
    accessibilityStatementViewPath,
    {
      dashboardUrl: DASHBOARD_URL,
      carmEnabled: carmEnabled
    },
  );
});

export default accessibilityStatementController;
