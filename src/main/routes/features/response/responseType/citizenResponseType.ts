import * as express from 'express';

import {RESPONSE_TYPE_URL, ROOT_URL} from '../../../urls';
import {ValidationError, Validator} from 'class-validator';
import {Respondent} from '../../../../common/models/respondent';
import {Claim} from '../../../../common/models/claim';
import {CitizenResponseType} from '../../../../common/form/models/citizenResponseType';
import {ComponentDetailItems} from '../../../../common/form/models/componentDetailItems/componentDetailItems';


const citizenResponseTypeViewPath = 'features/response/citizenResponseType/citizen-response-type';
const router = express.Router();
const citizenResponseType = new CitizenResponseType();
const DEADLINE = new Claim().formattedResponseDeadline();

const componentDetailItemsList: ComponentDetailItems[] = [
  new ComponentDetailItems('Admit all of the claim', null, ['You have until 4pm on ' + DEADLINE + ' to admit the claim.']),
  new ComponentDetailItems(null, 'Pay immediately', ['If you admit all the claim and want to pay it in full, including interest and claim fee, contact the claimant to arrange payment.', 'If you pay at the same time as admitting the claim, you won’t get a County Court Judgment (CCJ).', 'You should ask the claimant to give you a receipt.']),
  new ComponentDetailItems(null, 'If you can\'t pay immediately', ['If you admit all the claim but can’t pay immediately, you can offer to pay the claimant in instalments.', 'If the claimant accepts your offer, they can ask the court to enter a CCJ against you and you’ll be sent an order to pay.', 'If the claimant rejects your offer, they can ask the court to enter a CCJ against you. The court will then decide the instalment plan.']),
  new ComponentDetailItems('Admit part of the claim', null, ['You have until 4pm on ' + DEADLINE + ' to admit part of the claim.']),
  new ComponentDetailItems(null, 'Pay immediately', ['To admit part of the claim, contact the claimant and pay the amount you believe you owe then send the court your part admission.', 'They can accept the amount you’ve paid and settle the claim, or ask the court to transfer the claim to a County Court hearing centre.']),
  new ComponentDetailItems(null, 'If you can\'t pay immediately', ['If the claimant accepts your part-admission and you can’t pay immediately, you can offer to pay in instalments.', 'If the claimant agrees, they can ask the court to enter a CCJ against you and you’ll be sent an order to pay.', 'If they reject your offer, the court will decide an instalment plan.']),
  new ComponentDetailItems('Reject all of the claim', null, ['You have until 4pm on '+ DEADLINE +' to reject the claim.', 'If you reject all of the claim, the claim may be transferred to a County Court hearing centre.', 'If you reject because you believe you’ve paid the money, the claimant has 28 days to tell you and the court whether they’re proceeding with the claim. If they proceed, the claim may be transferred to a County Court hearing centre.']),
  new ComponentDetailItems('Hearing centre location', null, ['If the claim is against you as an individual, the hearing centre will be the nearest one to your home or business.', 'If the claimant is an individual and the claim is against you as an organisation, the hearing centre will be the nearest one to their home or business.']),
];

function renderView(form: CitizenResponseType, res: express.Response): void {
  res.render(citizenResponseTypeViewPath, {form: form, componentDetailItemsList: componentDetailItemsList});
}

router.get(RESPONSE_TYPE_URL, (req, res) => {
  renderView(citizenResponseType, res);
});

router.post(RESPONSE_TYPE_URL,
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
