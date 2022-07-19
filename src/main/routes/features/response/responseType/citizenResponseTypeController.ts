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
      title: 'PAGES.CITIZEN_RESPONSE_TYPE.ADMIT_ALL',
      content: ['PAGES.CITIZEN_RESPONSE_TYPE.ADMIT_ALL_DEADLINE'],
      formattedValues: [claim.formattedResponseDeadline()],
    },
    {
      subtitle: 'PAGES.CITIZEN_RESPONSE_TYPE.PAY_IMMEDIATELY',
      content: [
        'PAGES.CITIZEN_RESPONSE_TYPE.IF_ADMIT_ALL',
        'PAGES.CITIZEN_RESPONSE_TYPE.IF_ADMIT_ALL_AND_PAY',
        'PAGES.CITIZEN_RESPONSE_TYPE.CLAIMANT_RECEIPT',
      ],
    },
    {
      subtitle: 'PAGES.CITIZEN_RESPONSE_TYPE.CANT_PAY_IMMEDIATELY',
      content: [
        'PAGES.CITIZEN_RESPONSE_TYPE.ADMIT_ALL_CANT_PAY',
        'PAGES.CITIZEN_RESPONSE_TYPE.CLAIMANT_ACCEPT_OFFER',
        'PAGES.CITIZEN_RESPONSE_TYPE.CLAIMANT_REJECT_OFFER',
      ],
    },
    {
      title: 'PAGES.CITIZEN_RESPONSE_TYPE.ADMIT_PART',
      content: ['PAGES.CITIZEN_RESPONSE_TYPE.PART_ADMIT_DEADLINE'],
      formattedValues: [claim.formattedResponseDeadline()],
    },
    {
      subtitle: 'PAGES.CITIZEN_RESPONSE_TYPE.PAY_IMMEDIATELY',
      content: [
        'PAGES.CITIZEN_RESPONSE_TYPE.PART_ADMIT',
        'PAGES.CITIZEN_RESPONSE_TYPE.ACCEPT_OR_TRANSFER'],
    },
    {
      subtitle: 'PAGES.CITIZEN_RESPONSE_TYPE.CANT_PAY_IMMEDIATELY',
      content: [
        'PAGES.CITIZEN_RESPONSE_TYPE.CLAIMANT_ACCEPT_PART_ADMISSION',
        'PAGES.CITIZEN_RESPONSE_TYPE.CLAIMANT_AGREES',
        'PAGES.CITIZEN_RESPONSE_TYPE.CLAIMANT_REJECT_PART_ADMISSION',
      ],
    },
    {
      title: 'PAGES.CITIZEN_RESPONSE_TYPE.REJECT_ALL',
      content: [
        'PAGES.CITIZEN_RESPONSE_TYPE.REJECT_DEADLINE',
        'PAGES.CITIZEN_RESPONSE_TYPE.REJECT_WHOLE_CLAIM',
        'PAGES.CITIZEN_RESPONSE_TYPE.REJECT_PAID',
        'PAGES.CITIZEN_RESPONSE_TYPE.IF_PROCEED',
      ],
      formattedValues: [claim.formattedResponseDeadline()],
    },
    {
      title: 'PAGES.CITIZEN_RESPONSE_TYPE.HEARING_CENTRE',
      content: [
        'PAGES.CITIZEN_RESPONSE_TYPE.AGAINST_INDIVIDUAL',
        'PAGES.CITIZEN_RESPONSE_TYPE.CLAIMANT_INDIVIDUAL',
      ],
    },
  ];
}

export default citizenResponseTypeController;
