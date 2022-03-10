import * as express from 'express';
import config from 'config';
import {BASE_CASE_RESPONSE_URL, CITIZEN_BANK_ACCOUNT_URL, CLAIM_TASK_LIST, FINANCIAL_DETAILS} from '../../../urls';
import {Claim} from '../../../../common/models/claim';
import {CivilServiceClient} from '../../../../app/client/civilServiceClient';
import {Respondent} from '../../../../common/models/respondent';
import {CounterpartyType} from '../../../../common/models/counterpartyType';
import {AppRequest} from '../../../../common/models/AppRequest';


const financialDetailsViewPath = 'features/response/financialDetails/financial-details';
const router = express.Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);


let claim : Claim = new Claim();
let counterpartyType : CounterpartyType;

function renderPage(res: express.Response, claim: Claim): void {
  res.render(financialDetailsViewPath, {claim: claim});
}


router.get(FINANCIAL_DETAILS, async (req, res) => {
  try {
    claim = await civilServiceClient.retrieveClaimDetails(<AppRequest>req,'1646818997929180');
    claim = await civilServiceClient.retrieveClaimDetails(<AppRequest>req,'1646768947464020');
    console.log('Respondent::' + JSON.stringify(claim.respondent1));
    counterpartyType = claim.respondent1.type;
    console.log('CounterpartyType::' + counterpartyType);
    renderPage(res, claim);
  } catch (e) {
    console.log(e);
  }
});

router.post(FINANCIAL_DETAILS,  (req, res) => {
  const respondent = new Respondent();
  respondent.type = counterpartyType;
  claim.respondent1 = respondent;
  claim.legacyCaseReference = 'counterpartyType';
  const draftStoreClient = req.app.locals.draftStoreClient;
  draftStoreClient.set(claim.legacyCaseReference, JSON.stringify(claim)).then(() => {
    if (counterpartyType == CounterpartyType.individual || counterpartyType == CounterpartyType.soleTrader) {
      res.redirect(BASE_CASE_RESPONSE_URL + CITIZEN_BANK_ACCOUNT_URL);
    } else if (counterpartyType == CounterpartyType.company || counterpartyType == CounterpartyType.organisation) {
      res.render(CLAIM_TASK_LIST);
    }
  });

});

export default router;
