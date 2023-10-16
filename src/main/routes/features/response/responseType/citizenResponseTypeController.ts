import {NextFunction, Response, Router} from 'express';
import {
  CITIZEN_ALREADY_PAID_URL,
  CITIZEN_REJECT_ALL_CLAIM_URL,
  CITIZEN_RESPONSE_TYPE_URL,
  RESPONSE_TASK_LIST_URL,
} from '../../../urls';
import {Claim} from '../../../../common/models/claim';
import {CitizenResponseType} from '../../../../common/form/models/citizenResponseType';
import {ResponseType} from '../../../../common/form/models/responseType';
import {ComponentDetailItems} from '../../../../common/form/models/componentDetailItems/componentDetailItems';
import {getCaseDataFromStore} from '../../../../modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {saveResponseType} from '../../../../services/features/response/responseType/citizenResponseTypeService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';

const citizenResponseTypeViewPath = 'features/response/citizenResponseType/citizen-response-type';
const citizenResponseTypeController = Router();

function renderView(form: GenericForm<CitizenResponseType>, res: Response, componentDetailItemsList?: ComponentDetailItems[]): void {
  res.render(citizenResponseTypeViewPath, {form: form, componentDetailItemsList: componentDetailItemsList});
}

citizenResponseTypeController.get(CITIZEN_RESPONSE_TYPE_URL, async (req, res, next: NextFunction) => {
  try {
    const citizenResponseType = new GenericForm(new CitizenResponseType());
    const claim = await getCaseDataFromStore(generateRedisKey(<AppRequest>req));
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    if (claim.respondent1?.responseType) {
      citizenResponseType.model.responseType = claim.respondent1.responseType;
    }
    const componentDetailItemsList = getDetailItemsList(claim, lang);
    renderView(citizenResponseType, res, componentDetailItemsList);
  } catch (error) {
    next(error);
  }
});

citizenResponseTypeController.post(CITIZEN_RESPONSE_TYPE_URL,
  async (req, res, next: NextFunction) => {
    try {
      const formResponseType: GenericForm<CitizenResponseType> = new GenericForm<CitizenResponseType>(new CitizenResponseType(req.body.responseType));
      await formResponseType.validate();
      if (formResponseType.hasErrors()) {
        renderView(formResponseType, res);
      } else {
        await saveResponseType(generateRedisKey(<AppRequest>req), formResponseType.model.responseType);
        switch (formResponseType.model.responseType) {
          case ResponseType.PART_ADMISSION:
            res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_ALREADY_PAID_URL));
            break;
          case ResponseType.FULL_ADMISSION:
            res.redirect(constructResponseUrlWithIdParams(req.params.id, RESPONSE_TASK_LIST_URL));
            break;
          case ResponseType.FULL_DEFENCE:
            res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_REJECT_ALL_CLAIM_URL));
            break;
          default:
            res.redirect(constructResponseUrlWithIdParams(req.params.id, RESPONSE_TASK_LIST_URL));
        }
      }
    } catch (error) {
      next(error);
    }
  });

function getDetailItemsList(claim: Claim, lng?: string): ComponentDetailItems[] {
  return [
    {
      title: 'PAGES.CITIZEN_RESPONSE_TYPE.ADMIT_ALL',
      content: ['PAGES.CITIZEN_RESPONSE_TYPE.ADMIT_ALL_DEADLINE'],
      formattedValues: [claim.formattedResponseDeadline(lng)],
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
      formattedValues: [claim.formattedResponseDeadline(lng)],
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
      formattedValues: [claim.formattedResponseDeadline(lng)],
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
