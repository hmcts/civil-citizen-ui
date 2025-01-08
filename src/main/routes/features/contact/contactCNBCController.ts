import {Router} from 'express';
import {CONTACT_CNBC_URL} from '../../urls';
import config from 'config';

const contactCNBCController = Router();
const contactUsViewPath = 'features/public/contact-cnbc';

contactCNBCController.get(CONTACT_CNBC_URL, (req, res) => {
  const webChat = config.get('webChat.cnbc');
  res.render(contactUsViewPath, { pageTitle: 'Civil National Business Centre', webChat });
});

export default contactCNBCController;
