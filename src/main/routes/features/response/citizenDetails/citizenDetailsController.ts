import {NextFunction, Request, Response, Router} from 'express';
import {CITIZEN_DETAILS_URL, CITIZEN_PHONE_NUMBER_URL, DOB_URL, RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {Party} from 'models/party';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  getDefendantInformation,
  saveDefendantProperty,
} from 'services/features/common/defendantDetailsService';
import {ClaimantOrDefendant, PartyType} from 'models/partyType';
import {GenericForm} from 'form/models/genericForm';
import {generateCorrespondenceAddressErrorMessages, PartyDetails} from 'form/models/partyDetails';
import {PartyPhone} from 'models/PartyPhone';
import {saveTelephone} from 'services/features/claim/yourDetails/phoneService';
import {CitizenTelephoneNumber} from 'form/models/citizenTelephoneNumber';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';
import {isCarmEnabledForCase} from 'common/utils/carmToggleUtils';

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

function renderPage(res: Response, req: Request, partyDetails: GenericForm<PartyDetails>, type: PartyType, partyPhone: GenericForm<PartyPhone>, carmEnabled: boolean): void {

  res.render(getViewPathWithType(type), {
    party: partyDetails,
    type: type,
    partyPhone: partyPhone,
    carmEnabled: carmEnabled,
  });
}

const redirect = (respondent: Party, req: Request, res: Response) => {
  if (respondent?.type === PartyType.INDIVIDUAL) {
    res.redirect(constructResponseUrlWithIdParams(req.params.id, DOB_URL));
  } else {
    if (respondent?.partyPhone && respondent?.partyPhone?.ccdPhoneExist) {
      res.redirect(constructResponseUrlWithIdParams(req.params.id, RESPONSE_TASK_LIST_URL));
    } else {
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_PHONE_NUMBER_URL));
    }
  }
};

citizenDetailsController.get(CITIZEN_DETAILS_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getCaseDataFromStore(redisKey);
    const carmEnabled = await isCarmEnabledForCase(new Date(claim.submittedDate));
    const respondent: Party = await getDefendantInformation(generateRedisKey(<AppRequest>req));
    const partyDetails = new GenericForm(respondent.partyDetails);
    const partyPhoneForm = new GenericForm<PartyPhone>(new PartyPhone(respondent.partyPhone?.phone, respondent.partyPhone?.ccdPhoneExist));
    renderPage(res, req, partyDetails, respondent.type, partyPhoneForm, carmEnabled);
  } catch (error) {
    next(error);
  }
});

citizenDetailsController.post(CITIZEN_DETAILS_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getCaseDataFromStore(redisKey);
    const carmEnabled = await isCarmEnabledForCase(new Date(claim.submittedDate));
    const respondent = await getDefendantInformation(redisKey);
    const partyDetails = new GenericForm(new PartyDetails(req.body, carmEnabled));
    const partyPhone = new GenericForm<PartyPhone>(new PartyPhone(req.body.partyPhone, respondent?.partyPhone?.ccdPhoneExist));

    partyDetails.validateSync();
    partyPhone.validateSync();

    if (partyDetails.hasErrors() || partyPhone.hasErrors()) {
      generateCorrespondenceAddressErrorMessages(partyDetails);
      renderPage(res, req, partyDetails, respondent.type, partyPhone, carmEnabled);
    } else {
      await saveDefendantProperty(redisKey, propertyName, partyDetails.model);
      if (req.body?.partyPhone || (respondent?.partyPhone?.phone && respondent?.partyPhone?.ccdPhoneExist)) {
        const citizenTelephoneNumber = new CitizenTelephoneNumber(req.body.partyPhone, true);
        await saveTelephone(redisKey, citizenTelephoneNumber, ClaimantOrDefendant.DEFENDANT);
      }
      redirect(respondent, req, res);
    }
  } catch (error) {
    next(error);
  }
});

export default citizenDetailsController;
