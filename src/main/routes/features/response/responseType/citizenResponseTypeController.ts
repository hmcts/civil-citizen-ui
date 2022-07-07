import * as express from 'express';
import {
  CITIZEN_ALREADY_PAID_URL,
  CITIZEN_REJECT_ALL_CLAIM_URL,
  CITIZEN_RESPONSE_TYPE_URL,
  CLAIM_TASK_LIST_URL,
} from '../../../urls';
import {ValidationError, Validator} from 'class-validator';
import {Respondent} from '../../../../common/models/respondent';
import {Claim} from '../../../../common/models/claim';
import {CitizenResponseType} from '../../../../common/form/models/citizenResponseType';
import {ResponseType} from '../../../../common/form/models/responseType';
import {ComponentDetailItems} from '../../../../common/form/models/componentDetailItems/componentDetailItems';
import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';

const citizenResponseTypeViewPath = 'features/response/citizenResponseType/citizen-response-type';
const citizenResponseTypeController = express.Router();
const validator = new Validator();

function renderView(form: CitizenResponseType, res: express.Response, componentDetailItemsList?: ComponentDetailItems[]): void {
  res.render(citizenResponseTypeViewPath, {form: form, componentDetailItemsList: componentDetailItemsList});
}

citizenResponseTypeController.get(CITIZEN_RESPONSE_TYPE_URL, async (req, res,next: express.NextFunction) => {
  try {
    const citizenResponseType = new CitizenResponseType();
    const claim = await getCaseDataFromStore(req.params.id);
    if (claim.respondent1?.responseType) {
      citizenResponseType.responseType = claim.respondent1.responseType;
    }
    const componentDetailItemsList = getDetailItemsList(claim);
    renderView(citizenResponseType, res, componentDetailItemsList);
  } catch (error) {
    next(error);
  }
});

citizenResponseTypeController.post(CITIZEN_RESPONSE_TYPE_URL,
  async (req, res, next: express.NextFunction) => {
    try {
      const model: CitizenResponseType = new CitizenResponseType(req.body.responseType);
      const errors: ValidationError[] = validator.validateSync(model);
      if (errors?.length > 0) {
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
        switch (model.responseType) {
          case ResponseType.PART_ADMISSION:
            res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_ALREADY_PAID_URL));
            break;
          case ResponseType.FULL_ADMISSION:
            res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL));
            break;
          case ResponseType.FULL_DEFENCE:
            res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_REJECT_ALL_CLAIM_URL));
            break;
          default:
            res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL));
        }
      }
    } catch (error) {
      next(error);
    }
  });

function getDetailItemsList(claim: Claim): ComponentDetailItems[] {
  return [
    {
      title: 'Admit all of the claim',
      content: ['You have until 4pm on ' + claim.formattedResponseDeadline() + ' to admit the claim.'],
    },
    {
      subtitle: 'Pay immediately',
      content: ['If you admit all the claim and want to pay it in full, including interest and claim fee, contact the claimant to arrange payment.', 'If you pay at the same time as admitting the claim, you won’t get a County Court Judgment (CCJ).', 'You should ask the claimant to give you a receipt.'],
    },
    {
      subtitle: 'If you can\'t pay immediately',
      content: ['If you admit all the claim but can’t pay immediately, you can offer to pay the claimant in instalments.', 'If the claimant accepts your offer, they can ask the court to enter a CCJ against you and you’ll be sent an order to pay.', 'If the claimant rejects your offer, they can ask the court to enter a CCJ against you. The court will then decide the instalment plan.'],
    },
    {
      title: 'Admit part of the claim',
      content: ['You have until 4pm on ' + claim.formattedResponseDeadline() + ' to admit part of the claim.'],
    },
    {
      subtitle: 'Pay immediately',
      content: ['To admit part of the claim, contact the claimant and pay the amount you believe you owe then send the court your part admission.', 'They can accept the amount you’ve paid and settle the claim, or ask the court to transfer the claim to a County Court hearing centre.'],
    },
    {
      subtitle: 'If you can\'t pay immediately',
      content: ['If the claimant accepts your part-admission and you can’t pay immediately, you can offer to pay in instalments.', 'If the claimant agrees, they can ask the court to enter a CCJ against you and you’ll be sent an order to pay.', 'If they reject your offer, the court will decide an instalment plan.'],
    },
    {
      title: 'Reject all of the claim',
      content: ['You have until 4pm on ' + claim.formattedResponseDeadline() + ' to reject the claim.', 'If you reject all of the claim, the claim may be transferred to a County Court hearing centre.', 'If you reject because you believe you’ve paid the money, the claimant has ' + claim.responseInDays() + ' days to tell you and the court whether they’re proceeding with the claim. If they proceed, the claim may be transferred to a County Court hearing centre.'],
    },
    {
      title: 'Hearing centre location',
      content: ['If the claim is against you as an individual, the hearing centre will be the nearest one to your home or business.', 'If the claimant is an individual and the claim is against you as an organisation, the hearing centre will be the nearest one to their home or business.'],
    },
  ];
}

export default citizenResponseTypeController;
