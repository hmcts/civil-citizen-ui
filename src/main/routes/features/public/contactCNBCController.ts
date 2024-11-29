import {Router} from 'express';
import {CONTACT_CNBC_URL, DASHBOARD_URL} from '../../urls';

const contactCNBCController = Router();
const contactUsViewPath = 'features/public/contact-cnbc';

contactCNBCController.get(CONTACT_CNBC_URL, (req, res) => {
  res.render(contactUsViewPath, { dashboardUrl: DASHBOARD_URL , pageTitle: 'Civil National Business Centre Contact'});
});

export default contactCNBCController;
