import * as express from 'express';
import {CITIZEN_BANK_ACCOUNT_URL, CLAIM_TASK_LIST_URL, FINANCIAL_DETAILS_URL} from '../../../urls';
import {Claim} from '../../../../common/models/claim';
import {getDraftClaimFromStore} from '../../../../modules/draft-store/draftStoreService';
import {CounterpartyType} from '../../../../common/models/counterpartyType';
import * as winston from 'winston';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';

const financialDetailsViewPath = 'features/response/financialDetails/financial-details';
const financialDetailsController = express.Router();
const {Logger} = require('@hmcts/nodejs-logging');
let logger: winston.LoggerInstance = Logger.getLogger('financialDetailsController');


export function setFinancialDetailsControllerLogger(winstonLogger: winston.LoggerInstance) {
  logger = winstonLogger;
}

function renderView(res: express.Response, claim: Claim): void {
  res.render(financialDetailsViewPath, {claim: claim});
}


financialDetailsController.get(FINANCIAL_DETAILS_URL, async (req: express.Request, res: express.Response) => {
  let claim: Claim = new Claim();
  await getDraftClaimFromStore(req.params.id)
    .then(claimResponse => {
      claim = claimResponse.case_data;
    }).catch(error => {
      logger.error(error.message);
    });
  renderView(res, claim);
});

financialDetailsController.post(FINANCIAL_DETAILS_URL, async (req: express.Request, res: express.Response) => {
  let counterpartyType: CounterpartyType;
  let claim: Claim = new Claim();
  await getDraftClaimFromStore(req.params.id)
    .then(claimResponse => {
      counterpartyType = claimResponse.case_data.respondent1.type;
      claim = claimResponse.case_data;
    }).catch(error => {
      logger.error(error.message);
    });
  if (counterpartyType) {
    if (counterpartyType == CounterpartyType.INDIVIDUAL || counterpartyType == CounterpartyType.SOLE_TRADER) {
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_BANK_ACCOUNT_URL));
    } else if (counterpartyType == CounterpartyType.COMPANY || counterpartyType == CounterpartyType.ORGANISATION) {
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL));
    }
  } else {
    logger.error('No counterpartyType found.');
    renderView(res, claim);
  }
});

export default financialDetailsController;
