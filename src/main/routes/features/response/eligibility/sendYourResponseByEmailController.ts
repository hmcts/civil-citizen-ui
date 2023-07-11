import {NextFunction, Response, Router} from 'express';
import {SEND_RESPONSE_BY_EMAIL_URL} from 'routes/urls';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {ResponseType} from 'form/models/responseType';
import {PartyType} from 'models/partyType';
import {CivilServiceClient} from 'client/civilServiceClient';
import config from 'config';
import {FeeRange, FeeRanges} from 'models/feeRange';
import {TableItem} from 'models/tableItem';
import {AppRequest} from 'models/AppRequest';
import {RejectAllOfClaimType} from 'form/models/rejectAllOfClaimType';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
const sendYourResponseByEmailViewPath = 'features/response/eligibility/send-your-response-by-email';
const sendYourResponseByEmailController = Router();

function renderView(res: Response, form: Claim, fees: [TableItem[]]): void {
  res.render(sendYourResponseByEmailViewPath, {
    form,
    fees,
    ResponseType,
    RejectAllOfClaimType,
    partyType: PartyType,
  });
}

sendYourResponseByEmailController.get(SEND_RESPONSE_BY_EMAIL_URL, async (req, res, next: NextFunction) => {
  try {
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const form = await getCaseDataFromStore(req.params.id);
    const feesRanges: FeeRanges = await civilServiceClient.getFeeRanges(<AppRequest>req);
    const formattedFeesRanges = formatFeesRanges(feesRanges, lang);
    renderView(res, form, formattedFeesRanges);
  } catch (error) {
    next(error);
  }
});

const formatFeesRanges = (feesRanges: FeeRanges, lang: string): [TableItem[]] => {
  const tableFormatFeesRanges: [TableItem[]] = [[]];
  feesRanges.value.forEach((feeRange: FeeRange) => {
    tableFormatFeesRanges.push(feeRange.formatFeeRangeToTableItem(lang));
  });
  return tableFormatFeesRanges;
};

export default sendYourResponseByEmailController;
