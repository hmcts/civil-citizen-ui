import {Router} from 'express';
import {CONTACT_US_URL, DASHBOARD_URL} from '../../urls';

const contactUsController = Router();
const contactUsViewPath = 'features/public/contact-us';

contactUsController.get(CONTACT_US_URL, (req, res) => {
  res.render(contactUsViewPath, { dashboardUrl: DASHBOARD_URL , pageTitle: 'PAGES.CONTACT_US.TITLE'});
});

export default contactUsController;
