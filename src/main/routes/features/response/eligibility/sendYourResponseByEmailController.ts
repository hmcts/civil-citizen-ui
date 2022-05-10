import * as express from 'express';
import {SEND_RESPONSE_BY_EMAIL_URL} from '../../../urls';

const sendYourResponseByEmailViewPath = 'features/response/eligibility/send-your-response-by-email';
const sendYourResponseByEmailController = express.Router();
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('sendYourResponseByEmailController');

function renderView(res: express.Response): void {
  res.render(sendYourResponseByEmailViewPath);
}

sendYourResponseByEmailController.get(SEND_RESPONSE_BY_EMAIL_URL, async (req, res) => {
  try {
    renderView(res);
  } catch (error) {
    logger.error(error);
    res.status(500).send({error: error.message});
  }
});

export default sendYourResponseByEmailController;
