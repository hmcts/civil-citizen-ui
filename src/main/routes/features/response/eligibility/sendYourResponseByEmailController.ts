import * as express from 'express';
import {SEND_RESPONSE_BY_EMAIL_URL} from '../../../urls';
import {getCaseDataFromStore} from '../../../../modules/draft-store/draftStoreService';
import {Claim} from '../../../../common/models/claim';
import {ResponseType} from '../../../../common/form/models/responseType';
import {CounterpartyType} from '../../../../common/models/counterpartyType';
import RejectAllOfClaimType from '../../../../common/form/models/rejectAllOfClaimType';
import {CivilServiceClient} from '../../../../app/client/civilServiceClient';
import config from 'config';
import {FeeRange} from '../../../../common/models/feeRange';
import {TableItem} from '../../../../common/models/tableItem';
import {AppRequest} from 'models/AppRequest';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
const sendYourResponseByEmailViewPath = 'features/response/eligibility/send-your-response-by-email';
const sendYourResponseByEmailController = express.Router();
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('sendYourResponseByEmailController');

function renderView(res: express.Response, form: Claim, fees: [TableItem[]]): void {
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
    const feesRanges: FeeRange[] = await civilServiceClient.getFeeRanges(<AppRequest>req);
    const formattedFeesRanges = formatFeesRanges(feesRanges);
    renderView(res, form, formattedFeesRanges);
  } catch (error) {
    logger.error(error);
    res.status(500).send({ error: error.message });
  }
});


const formatFeesRanges = (feesRanges: FeeRange[]): [TableItem[]] => {
  const tableFormatFeesRanges: [TableItem[]] = [[]];
  feesRanges.forEach((feeRange: FeeRange) => {
    tableFormatFeesRanges.push(feeRange.formatFeeRange());
  });
  return tableFormatFeesRanges;
};

export default sendYourResponseByEmailController;
