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
  const webChatCNBC = config.get<WebChat>('webChat.cnbc');
  const webChatConfig: WebChat = {
    uuid: webChatCNBC.uuid,
    tenant: webChatCNBC.tenant,
    channel: webChatCNBC.channel,
    channelUuid: webChatCNBC.channelUuid,
    buttonContainerId: webChatCNBC.buttonContainerId,
  };
  res.render(contactUsViewPath, { pageTitle: 'Civil National Business Centre', webChatConfig });
});

export default contactCNBCController;
