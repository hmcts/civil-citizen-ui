import {Router} from 'express';
import {DASHBOARD_URL, PRIVACY_POLICY_URL} from '../../urls';

const privacyPolicyController = Router();
const privacyPolicyViewPath = 'features/public/privacy-policy';

privacyPolicyController.get(PRIVACY_POLICY_URL, (req, res) => {
  res.render(privacyPolicyViewPath, { dashboardUrl: DASHBOARD_URL });
});

export default privacyPolicyController;
