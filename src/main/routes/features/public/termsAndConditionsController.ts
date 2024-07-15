import {Router} from 'express';
import {DASHBOARD_URL, TERMS_AND_CONDITIONS_URL} from '../../urls';

const termsAndConditionsController = Router();
const termsAndConditionsViewPath = 'features/public/terms-and-conditions';

termsAndConditionsController.get(TERMS_AND_CONDITIONS_URL, (req, res) => {
  res.render(termsAndConditionsViewPath, { dashboardUrl: DASHBOARD_URL });
});

export default termsAndConditionsController;
