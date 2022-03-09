import * as express from 'express';
import config from 'config';
import {FINANCIAL_DETAILS, ROOT_URL} from '../../../urls';
import {ValidationError, Validator} from 'class-validator';
import {Claim} from '../../../../common/models/claim';
import { CivilServiceClient } from '../../../../app/client/civilServiceClient';
import {Form} from '../../../../common/form/models/form';
import {Respondent} from '../../../../common/models/respondent';
import {CounterpartyType} from "models/counterpartyType";
import {AppRequest} from "models/AppRequest";




const financialDetailsViewPath = 'features/response/financialDetails/financial-details';
const router = express.Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
const form = new Form();

let claim : Claim = new Claim();
let counterpartyType : CounterpartyType;



function renderView(form: Form, res: express.Response): void {
  res.render(financialDetailsViewPath, {form: form});
}

router.get(FINANCIAL_DETAILS, async (req, res) => {
  try {
    claim = await civilServiceClient.retrieveClaimDetails(<AppRequest>req,'1646818997929180');
    console.log('Respondent::' + JSON.stringify(claim.respondent1));
    counterpartyType = claim.respondent1.type;
    console.log('CounterpartyType::' + counterpartyType);
    renderView(form, res);
  } catch (e) {
    console.log(e);
  }
});

router.post(FINANCIAL_DETAILS,  (req, res) => {

  const model: Form = new Form();
  const validator = new Validator();
  const errors: ValidationError[] = validator.validateSync(model);
  if (errors && errors.length > 0) {
    model.errors = errors;
    renderView(model, res);
  } else {
    const respondent = new Respondent();
    respondent.type = counterpartyType;
    claim.respondent1 = respondent;
    claim.legacyCaseReference = 'counterpartyType';
    const draftStoreClient = req.app.locals.draftStoreClient;
    draftStoreClient.set(claim.legacyCaseReference, JSON.stringify(claim)).then(() => {
      res.redirect(ROOT_URL);
    });
  }
});

export default router;
