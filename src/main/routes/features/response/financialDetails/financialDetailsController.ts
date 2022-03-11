import * as express from 'express';
import {
  BASE_CASE_RESPONSE_URL,
  CITIZEN_BANK_ACCOUNT_URL,
  CLAIM_TASK_LIST,
  FINANCIAL_DETAILS,
} from '../../../urls';
import {Claim} from '../../../../common/models/claim';
import {DraftStoreService} from '../../../../modules/draft-store/draftStoreService';
import {CounterpartyType} from '../../../../common/models/counterpartyType';
import {getBaseUrlWithIdParam} from '../../../../common/utils/urlFormatter';

const financialDetailsViewPath = 'features/response/financialDetails/financial-details';
const router = express.Router();
const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('financialDetailsController');
const draftStoreService : DraftStoreService = new DraftStoreService();


function renderPage(res: express.Response, claim: Claim): void {
  res.render(financialDetailsViewPath, {claim: claim});
}


router.get(BASE_CASE_RESPONSE_URL + FINANCIAL_DETAILS, async (req, res) => {
  await draftStoreService.getCaseDataFormStore(req.params.id)
    .then(claim => {
      renderPage(res, claim);
    }).catch(error => {
      logger.error(error.message);
    });
});

router.post(BASE_CASE_RESPONSE_URL + FINANCIAL_DETAILS,  async (req, res) => {
  let counterpartyType : CounterpartyType;
  await draftStoreService.getCaseDataFormStore(req.params.id)
    .then(claim => {
      counterpartyType = claim.respondent1.type;
    }).catch(error => {
      logger.error(error.message);
    });
  if (counterpartyType) {
    if (counterpartyType == CounterpartyType.individual || counterpartyType == CounterpartyType.soleTrader) {
      res.redirect(getBaseUrlWithIdParam(req.params.id) + CITIZEN_BANK_ACCOUNT_URL);
    } else if (counterpartyType == CounterpartyType.company || counterpartyType == CounterpartyType.organisation) {
      res.redirect(getBaseUrlWithIdParam(req.params.id) + CLAIM_TASK_LIST);
    }
  } else {
    logger.error('No counterpartyType found.');
  }
});

export default router;
