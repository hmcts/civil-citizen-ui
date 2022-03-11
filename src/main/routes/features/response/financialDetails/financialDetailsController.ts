import * as express from 'express';
import {BASE_CASE_RESPONSE_URL, CITIZEN_BANK_ACCOUNT_URL, CLAIM_TASK_LIST, FINANCIAL_DETAILS} from '../../../urls';
import {Claim} from '../../../../common/models/claim';
import {DraftStoreService} from '../../../../modules/draft-store/draftStoreService';
import {CounterpartyType} from '../../../../common/models/counterpartyType';




const financialDetailsViewPath = 'features/response/financialDetails/financial-details';
const router = express.Router();

const draftStoreService : DraftStoreService = new DraftStoreService();

//let claim : Claim = new Claim();
let counterpartyType : CounterpartyType;

function renderPage(res: express.Response, claim: Claim): void {
  res.render(financialDetailsViewPath, {claim: claim});
}


router.get(BASE_CASE_RESPONSE_URL + FINANCIAL_DETAILS, async (req, res) => {
  await draftStoreService.getCaseDataFormStore(req.params.id)
    .then(claim => {
      counterpartyType = claim.respondent1.type;
      renderPage(res, claim);
    }).catch(error => {
      console.log(error.message);
    });
});

router.post(BASE_CASE_RESPONSE_URL + FINANCIAL_DETAILS,  (req, res) => {
  if (counterpartyType == CounterpartyType.individual || counterpartyType == CounterpartyType.soleTrader) {
    res.redirect(BASE_CASE_RESPONSE_URL + CITIZEN_BANK_ACCOUNT_URL);
  } else if (counterpartyType == CounterpartyType.company || counterpartyType == CounterpartyType.organisation) {
    res.redirect(BASE_CASE_RESPONSE_URL + CLAIM_TASK_LIST);
  }
});

export default router;
