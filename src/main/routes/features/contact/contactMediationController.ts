import {Router} from 'express';
import {CONTACT_MEDIATION_URL} from '../../urls';

const contactMediationController = Router();
const contactUsViewPath = 'features/contact/contact-mediation';

contactMediationController.get(CONTACT_MEDIATION_URL, (req, res) => {
  res.render(contactUsViewPath, { pageTitle: 'Small Claims Mediation Service'});
});

export default contactMediationController;
