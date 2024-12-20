import {Router} from 'express';
import {CONTACT_CNBC_URL} from '../../urls';

const contactCNBCController = Router();
const contactUsViewPath = 'features/public/contact-cnbc';

contactCNBCController.get(CONTACT_CNBC_URL, (req, res) => {
  res.render(contactUsViewPath, { pageTitle: 'Civil National Business Centre'});
});

export default contactCNBCController;
