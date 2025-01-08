import {Router} from 'express';
import {CONTACT_CNBC_URL} from '../../urls';
import config from 'config';

const contactCNBCController = Router();
const contactUsViewPath = 'features/public/contact-cnbc';

type WebChat = {
  uuid: string;
  tenant: string;
  channel: string;
  channelUuid: string;
  buttonContainerId: string;
};

contactCNBCController.get(CONTACT_CNBC_URL, (req, res) => {
  const webChat = config.get<WebChat>('webChat.cnbc');
  res.render(contactUsViewPath, { pageTitle: 'Civil National Business Centre', webChat });
});

export default contactCNBCController;
