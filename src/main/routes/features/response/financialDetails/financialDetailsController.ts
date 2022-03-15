import * as express from 'express';
import {
  CITIZEN_BANK_ACCOUNT_URL, CLAIM_TASK_LIST,
  FINANCIAL_DETAILS_URL,
} from '../../../urls';
import {Claim} from '../../../../common/models/claim';
import {
  getDraftClaimFromStore,
} from '../../../../modules/draft-store/draftStoreService';
import {CounterpartyType} from '../../../../common/models/counterpartyType';
import * as winston from 'winston';
import {
  constructResponseUrlWithIdParams,
} from '../../../../common/utils/urlFormatter';

const financialDetailsViewPath = 'features/response/financialDetails/financial-details';
const router = express.Router();
const { Logger } = require('@hmcts/nodejs-logging');
let logger : winston.LoggerInstance = Logger.getLogger('financialDetailsController');


export function setLogger(winstonLogger : winston.LoggerInstance){
  logger = winstonLogger;
}

function renderPage(res: express.Response, claim: Claim): void {
  res.render(financialDetailsViewPath, {claim: claim});
}


router.get(FINANCIAL_DETAILS_URL.toString(),  async (req, res) => {
  let claim : Claim = new Claim();
  await getDraftClaimFromStore(req.params.id)
    .then(claimResponse => {
      claim = claimResponse.case_data;
    }).catch(error => {
      logger.error(error.message);
    });
  renderPage(res, claim);
});

router.post(FINANCIAL_DETAILS_URL.toString(),  async (req, res) => {
  let counterpartyType : CounterpartyType;
  let claim : Claim = new Claim();
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
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST));
    }
  } else {
    logger.error('No counterpartyType found.');
    renderPage(res, claim);
  }
});

export default router;
