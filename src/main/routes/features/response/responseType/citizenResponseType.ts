import * as express from 'express';
import moment from 'moment';

import {CITIZEN_RESPONSE_TYPE, ROOT_URL} from '../../../urls';
import {ValidationError, Validator} from 'class-validator';
import {Respondent} from '../../../../common/models/respondent';
import {Claim} from '../../../../common/models/claim';
import {CitizenResponseType} from '../../../../common/form/models/citizenResponseType';
import {ComponentDetailItems} from 'common/form/models/componentDetailItems/componentDetailItems';


const citizenResponseTypeViewPath = 'features/response/citizenResponseType/citizen-response-type';
const router = express.Router();
const citizenResponseType = new CitizenResponseType();
const DEADLINE = moment().add(28,'d').format('d MMMM YYYY');

const componentDetailItemsList: ComponentDetailItems[] = [new ComponentDetailItems('Admit all of the claim', null, ['You have until 4pm on ' + DEADLINE + ' to admit the claim.']),
  new ComponentDetailItems(null, 'Pay immediately', ['If you admit all the claim and want to pay it in full, including interest and claim fee, contact the claimant to arrange payment.', 'If you pay at the same time as admitting the claim, you won’t get a County Court Judgment (CCJ).', 'You should ask the claimant to give you a receipt.']),
  new ComponentDetailItems('Admit part of the claim', null, ['You have until 4pm on ' + DEADLINE + ' to admit part of the claim.']),
  new ComponentDetailItems(null, 'Pay immediately', ['To admit part of the claim, contact the claimant and pay the amount you believe you owe then send the court your part admission.', 'They can accept the amount you’ve paid and settle the claim, or ask the court to transfer the claim to a County Court hearing centre.']),
  new ComponentDetailItems('Reject all of the claim', 'If you can’t pay immediately', ['You have until 4pm on '+ DEADLINE +' to reject the claim.', 'If you reject all of the claim, the claim may be transferred to a County Court hearing centre.', 'If you reject because you believe you’ve paid the money, the claimant has 28 days to tell you and the court whether they’re proceeding with the claim. If they proceed, the claim may be transferred to a County Court hearing centre.']),
  new ComponentDetailItems(null, 'Hearing centre location', ['If the claim is against you as an individual, the hearing centre will be the nearest one to your home or business.', 'If the claimant is an individual and the claim is against you as an organisation, the hearing centre will be the nearest one to their home or business.']),

];

function renderView(form: CitizenResponseType, res: express.Response): void {
  res.render(citizenResponseTypeViewPath, {form: form, componentDetailItemsList: componentDetailItemsList});
}

router.get(CITIZEN_RESPONSE_TYPE, (req, res) => {
  renderView(citizenResponseType, res);
});

router.post(CITIZEN_RESPONSE_TYPE,
  (req, res) => {

    const model: CitizenResponseType = new CitizenResponseType(req.body.responseType);
    const validator = new Validator();
    const errors: ValidationError[] = validator.validateSync(model);
    if (errors && errors.length > 0) {
      model.errors = errors;
      renderView(model, res);
    } else {
      const respondent = new Respondent();
      respondent.responseType = model.responseType;
      const claim = new Claim();
      claim.respondent1 = respondent;
      claim.legacyCaseReference = 'responseType';
      const draftStoreClient = req.app.locals.draftStoreClient;
      draftStoreClient.set(claim.legacyCaseReference, JSON.stringify(claim)).then(() => {
        res.redirect(ROOT_URL);
      });
    }
  });

export default router;
