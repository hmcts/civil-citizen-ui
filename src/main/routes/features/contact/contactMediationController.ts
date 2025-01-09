import {Router} from 'express';
import {CONTACT_MEDIATION_URL} from '../../urls';
import config from 'config';
import {WebChat} from 'routes/features/contact/contactCNBCController';

const contactMediationController = Router();
const contactServiceViewPath = 'features/public/contact-service';

contactMediationController.get(CONTACT_MEDIATION_URL, (req, res) => {
  const webChatMediation = config.get<WebChat>('webChat.mediation');
  const webChatConfig: WebChat = {
    uuid: webChatMediation.uuid,
    tenant: webChatMediation.tenant,
    channel: webChatMediation.channel,
    channelUuid: webChatMediation.channelUuid,
    buttonContainerId: webChatMediation.buttonContainerId,
  };
  res.render(contactServiceViewPath, {
    pageTitle: 'Small Claims Mediation Service',
    telephone: '0300 123 4593',
    webChatConfig,
  });
});

export default contactMediationController;
