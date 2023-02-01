import {NextFunction, Request, Response, Router} from 'express';
import {CITIZEN_DETAILS_URL, CITIZEN_PHONE_NUMBER_URL, DOB_URL, RESPONSE_TASK_LIST_URL} from '../../../urls';
import {Party} from '../../../../common/models/party';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {
  getDefendantInformation,
  saveDefendantProperty,
} from '../../../../services/features/common/defendantDetailsService';
import {ClaimantOrDefendant, PartyType} from '../../../../common/models/partyType';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {PartyDetails} from '../../../../common/form/models/partyDetails';
import {PartyPhone} from '../../../../common/models/PartyPhone';
import {saveTelephone} from '../../../../services/features/claim/yourDetails/phoneService';
import {CitizenTelephoneNumber} from '../../../../common/form/models/citizenTelephoneNumber';

const citizenDetailsController = Router();

const CITIZEN_DETAILS_COMPANY_VIEW_PATH = 'features/response/citizenDetails/citizen-details-company';
const CITIZEN_DETAILS_VIEW_PATH = 'features/response/citizenDetails/citizen-details';
const propertyName = 'partyDetails';

const getViewPathWithType = (type: PartyType) => {
  if (type === PartyType.ORGANISATION || type === PartyType.COMPANY) {
    return CITIZEN_DETAILS_COMPANY_VIEW_PATH;
  }
  return CITIZEN_DETAILS_VIEW_PATH;
};

function renderPage(res: Response, req: Request, partyDetails: GenericForm<PartyDetails>, type: PartyType, partyPhone: GenericForm<PartyPhone>): void {

  res.render(getViewPathWithType(type), {
    party: partyDetails,
    type: type,
    partyPhone: partyPhone,
  });
}

const redirect = (respondent: Party, req: Request, res: Response) => {
  if (respondent?.type === PartyType.INDIVIDUAL) {
    res.redirect(constructResponseUrlWithIdParams(req.params.id, DOB_URL));
  } else {
    if (respondent?.partyPhone) {
      res.redirect(constructResponseUrlWithIdParams(req.params.id, RESPONSE_TASK_LIST_URL));
    } else {
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_PHONE_NUMBER_URL));
    }
  }
};

citizenDetailsController.get(CITIZEN_DETAILS_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const respondent: Party = await getDefendantInformation(req.params.id);
    const partyDetails = new GenericForm(respondent.partyDetails);
    const partyPhoneForm = new GenericForm<PartyPhone>(new PartyPhone(respondent.partyPhone?.phone));
    renderPage(res, req, partyDetails, respondent.type, partyPhoneForm);
  } catch (error) {
    next(error);
  }
});

citizenDetailsController.post(CITIZEN_DETAILS_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const respondent = await getDefendantInformation(req.params.id);
    const partyDetails = new GenericForm(new PartyDetails(req.body));
    const partyPhone = new GenericForm<PartyPhone>(new PartyPhone(req.body.partyPhone));

    partyDetails.validateSync();

    if (partyDetails.hasErrors()) {
      renderPage(res, req, partyDetails, respondent.type, partyPhone);
    } else {
      await saveDefendantProperty(req.params.id, propertyName, partyDetails.model);
      if (req.body?.partyPhone) {
        const citizenTelephoneNumber = new CitizenTelephoneNumber(req.body.partyPhone);
        await saveTelephone(req.params.id, citizenTelephoneNumber, ClaimantOrDefendant.DEFENDANT);
      }
      redirect(respondent, req, res);
    }
  } catch (error) {
    next(error);
  }
});

export default citizenDetailsController;
