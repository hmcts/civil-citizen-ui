import * as express from 'express';

import {CITIZEN_RESPONSE_TYPE_URL, ROOT_URL} from '../../../urls';
import {ValidationError, Validator} from 'class-validator';
import {Respondent} from '../../../../common/models/respondent';
import {Claim} from '../../../../common/models/claim';
import {CitizenResponseType} from '../../../../common/form/models/citizenResponseType';
import {ComponentDetailItems} from '../../../../common/form/models/componentDetailItems/componentDetailItems';
import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {get} from 'lodash';
const {Logger} = require('@hmcts/nodejs-logging');

const logger = Logger.getLogger('citizenResponseTypeController');

const citizenResponseTypeViewPath = 'features/response/citizenResponseType/citizen-response-type';
const citizenResponseTypeController = express.Router();
const DEADLINE = new Claim().formattedResponseDeadline();
const validator = new Validator();

const componentDetailItemsList: ComponentDetailItems[] = [
  {title: 'Admit all of the claim', content: ['You have until 4pm on ' + DEADLINE + ' to admit the claim.']},
  {subtitle: 'Pay immediately', content: ['If you admit all the claim and want to pay it in full, including interest and claim fee, contact the claimant to arrange payment.', 'If you pay at the same time as admitting the claim, you won’t get a County Court Judgment (CCJ).', 'You should ask the claimant to give you a receipt.']},
  {subtitle: 'If you can\'t pay immediately', content: ['If you admit all the claim but can’t pay immediately, you can offer to pay the claimant in instalments.', 'If the claimant accepts your offer, they can ask the court to enter a CCJ against you and you’ll be sent an order to pay.', 'If the claimant rejects your offer, they can ask the court to enter a CCJ against you. The court will then decide the instalment plan.']},
  {title: 'Admit part of the claim', content: ['You have until 4pm on ' + DEADLINE + ' to admit part of the claim.']},
  {subtitle: 'Pay immediately', content: ['To admit part of the claim, contact the claimant and pay the amount you believe you owe then send the court your part admission.', 'They can accept the amount you’ve paid and settle the claim, or ask the court to transfer the claim to a County Court hearing centre.']},
  {subtitle : 'If you can\'t pay immediately', content:['If the claimant accepts your part-admission and you can’t pay immediately, you can offer to pay in instalments.', 'If the claimant agrees, they can ask the court to enter a CCJ against you and you’ll be sent an order to pay.', 'If they reject your offer, the court will decide an instalment plan.']},
  {title: 'Reject all of the claim', content: ['You have until 4pm on ' + DEADLINE + ' to reject the claim.', 'If you reject all of the claim, the claim may be transferred to a County Court hearing centre.', 'If you reject because you believe you’ve paid the money, the claimant has 28 days to tell you and the court whether they’re proceeding with the claim. If they proceed, the claim may be transferred to a County Court hearing centre.']},
  {title: 'Hearing centre location', content: ['If the claim is against you as an individual, the hearing centre will be the nearest one to your home or business.', 'If the claimant is an individual and the claim is against you as an organisation, the hearing centre will be the nearest one to their home or business.']},
];

function renderView(form: CitizenResponseType, res: express.Response): void {
  res.render(citizenResponseTypeViewPath, {form: form, componentDetailItemsList: componentDetailItemsList});
}

citizenResponseTypeController.get(CITIZEN_RESPONSE_TYPE_URL, async (req, res) => {
  try {
    const citizenResponseType = new CitizenResponseType();
    const responseDataRedis: Claim = await getCaseDataFromStore(req.params.id);
    if (get(responseDataRedis,'respondent1.responseType')){
      citizenResponseType.responseType = responseDataRedis.respondent1.responseType;
    }
    renderView(citizenResponseType, res);
  } catch (error) {
    logger.error(error);
    res.status(500).send({error: error.message});
  }
});

citizenResponseTypeController.post(CITIZEN_RESPONSE_TYPE_URL,
  async (req, res) => {
    try {
      const model: CitizenResponseType = new CitizenResponseType(req.body.responseType);
      const errors: ValidationError[] = validator.validateSync(model);
      if (errors && errors.length > 0) {
        model.errors = errors;
        renderView(model, res);
      } else {
        const claim = await getCaseDataFromStore(req.params.id) || new Claim();
        if (claim.respondent1) {
          claim.respondent1.responseType = model.responseType;
        } else {
          const respondent = new Respondent();
          respondent.responseType = model.responseType;
          claim.respondent1 = respondent;
        }
        await saveDraftClaim(req.params.id, claim);
        res.redirect(ROOT_URL);
      }
    } catch (error) {
      logger.error(error);
      res.status(500).send({error: error.message});
    }
  });

export default citizenResponseTypeController;
