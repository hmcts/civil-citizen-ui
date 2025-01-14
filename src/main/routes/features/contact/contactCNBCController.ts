import {Router} from 'express';
import {CONTACT_CNBC_URL} from '../../urls';
import config from 'config';

const contactCNBCController = Router();
const contactServiceViewPath = 'features/public/contact-service';

export type WebChat = {
  enabled: boolean;
  uuid: string;
  tenant: string;
  channel: string;
  channelUuid: string;
  buttonContainerId: string;
};

contactCNBCController.get(CONTACT_CNBC_URL, (req, res) => {
  const webChatCNBC = config.get<WebChat>('webChat.cnbc');
  const webChatEnabled = webChatCNBC.enabled;
  const webChatConfig: Partial<WebChat> = {
    uuid: webChatCNBC.uuid,
    tenant: webChatCNBC.tenant,
    channel: webChatCNBC.channel,
    channelUuid: webChatCNBC.channelUuid,
    buttonContainerId: webChatCNBC.buttonContainerId,
  };
  res.render(contactServiceViewPath, {
    pageTitle: 'Civil National Business Centre',
    telephone: '0300 123 1056',
    webChatEnabled,
    webChatConfig,
  });
});

export default contactCNBCController;
