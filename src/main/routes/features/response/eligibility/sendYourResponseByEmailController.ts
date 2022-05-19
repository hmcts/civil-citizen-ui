import * as express from 'express';
import {SEND_RESPONSE_BY_EMAIL_URL} from '../../../urls';
import {getCaseDataFromStore} from '../../../../modules/draft-store/draftStoreService';
import {Claim} from '../../../../common/models/claim';
import {ResponseType} from '../../../../common/form/models/responseType';
import {CounterpartyType} from '../../../../common/models/counterpartyType';
import RejectAllOfClaimType from '../../../../common/form/models/rejectAllOfClaimType';

const sendYourResponseByEmailViewPath = 'features/response/eligibility/send-your-response-by-email';
const sendYourResponseByEmailController = express.Router();
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('sendYourResponseByEmailController');

function renderView(res: express.Response, form: Claim, fees: any): void {
  res.render(sendYourResponseByEmailViewPath, {
    form: form,
    fees: fees,
    ResponseType: ResponseType,
    RejectAllOfClaimType: RejectAllOfClaimType,
    CounterpartyType: CounterpartyType,
  });
}

sendYourResponseByEmailController.get(SEND_RESPONSE_BY_EMAIL_URL, async (req, res) => {
  try {
    const form = await getCaseDataFromStore(req.params.id);
    // TODO call the service
    const fees: any[] = [
      [
        { text: "£0.01 to £300" },
        { text: "£35" }
      ],
      [
        { text: "£300.01 to £500" },
        { text: "£50" }
      ],
      [
        { text: "£500.01 to £1000" },
        { text: "£70" }
      ]
    ];
    renderView(res, form, fees);
  } catch (error) {
    logger.error(error);
    res.status(500).send({error: error.message});
  }
});

export default sendYourResponseByEmailController;
