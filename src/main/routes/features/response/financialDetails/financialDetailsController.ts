import * as express from 'express';
import config from 'config';
import {BASE_CASE_RESPONSE_URL, CITIZEN_BANK_ACCOUNT_URL, CLAIM_TASK_LIST, FINANCIAL_DETAILS} from '../../../urls';
import {Claim} from '../../../../common/models/claim';
import {CivilServiceClient} from '../../../../app/client/civilServiceClient';
import {DraftStoreService} from '../../../../modules/draft-store/draftStoreService';
// import {Respondent} from '../../../../common/models/respondent';
import {CounterpartyType} from '../../../../common/models/counterpartyType';
import {AppRequest} from '../../../../common/models/AppRequest';



const financialDetailsViewPath = 'features/response/financialDetails/financial-details';
const router = express.Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
const draftStoreService : DraftStoreService = new DraftStoreService();

let claim : Claim = new Claim();
let counterpartyType : CounterpartyType;

function renderPage(res: express.Response, claim: Claim): void {
  res.render(financialDetailsViewPath, {claim: claim});
}


router.get(BASE_CASE_RESPONSE_URL + FINANCIAL_DETAILS, async (req, res) => {
  try {
    const id = req.params.id;
    console.log('Id:: ' + id);
    claim = await civilServiceClient.retrieveClaimDetails(<AppRequest>req, id);
    //console.log(claim);
    claim = await draftStoreService.getCaseDataFormStore(id);
    console.log(claim);
    console.log('Claim Respondent::' + JSON.stringify(claim.respondent1));
    counterpartyType = claim.respondent1.type;
    console.log('CounterpartyType::' + counterpartyType);
    await draftStoreService.saveDraftClaim(id, claim);
    renderPage(res, claim);
  } catch (e) {
    console.log(e);
  }
});

router.post(BASE_CASE_RESPONSE_URL + FINANCIAL_DETAILS,  (req, res) => {
  if (counterpartyType == CounterpartyType.individual || counterpartyType == CounterpartyType.soleTrader) {
    res.redirect(BASE_CASE_RESPONSE_URL + CITIZEN_BANK_ACCOUNT_URL);
  } else if (counterpartyType == CounterpartyType.company || counterpartyType == CounterpartyType.organisation) {
    res.redirect(BASE_CASE_RESPONSE_URL + CLAIM_TASK_LIST);
  }
});

export default router;
