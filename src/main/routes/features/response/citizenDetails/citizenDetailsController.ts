import {NextFunction, Request, Response, Router} from 'express';
import {CITIZEN_DETAILS_URL, DOB_URL, CITIZEN_PHONE_NUMBER_URL} from '../../../urls';
import {Address} from '../../../../common/form/models/address';
import {CitizenCorrespondenceAddress} from '../../../../common/form/models/citizenCorrespondenceAddress';
import {Party} from 'models/party';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {YesNo} from '../../../../common/form/models/yesNo';
import {
  getRespondentInformation,
  saveRespondent,
} from '../../../../services/features/response/citizenDetails/citizenDetailsService';
import {PartyType} from '../../../../common/models/partyType';
import {GenericForm} from '../../../../common/form/models/genericForm';

const citizenDetailsController = Router();

const CITIZEN_DETAILS_COMPANY_VIEW_PATH = 'features/response/citizenDetails/citizen-details-company';
const CITIZEN_DETAILS_VIEW_PATH = 'features/response/citizenDetails/citizen-details';

const getViewPathWithType = (type: PartyType) => {
  if (type === PartyType.ORGANISATION || type === PartyType.COMPANY) {
    return CITIZEN_DETAILS_COMPANY_VIEW_PATH;
  }
  return CITIZEN_DETAILS_VIEW_PATH;
};

function renderPage(res: Response, req: Request, respondent: Party, citizenAddress: GenericForm<Address>, citizenCorrespondenceAddress: GenericForm<CitizenCorrespondenceAddress>): void {
  const type = respondent?.type;

  res.render(getViewPathWithType(type), {
    respondent,
    citizenAddress,
    citizenCorrespondenceAddress,
    partyName: respondent?.partyName,
    contactPerson: respondent?.contactPerson,
    type,
  });
}

const redirect = (responseDataRedis: Party, req: Request, res: Response) => {
  if (responseDataRedis?.type === PartyType.SOLE_TRADER || responseDataRedis?.type === PartyType.INDIVIDUAL) {
    res.redirect(constructResponseUrlWithIdParams(req.params.id, DOB_URL));
  } else {
    res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_PHONE_NUMBER_URL));
  }
};

citizenDetailsController.get(CITIZEN_DETAILS_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const respondent: Party = await getRespondentInformation(req.params.id);
    const citizenAddress = new GenericForm<Address>(new Address(respondent?.primaryAddress));
    const citizenCorrespondenceAddress = new GenericForm<CitizenCorrespondenceAddress>(new CitizenCorrespondenceAddress(respondent?.correspondenceAddress));
    renderPage(res, req, respondent, citizenAddress, citizenCorrespondenceAddress);
  } catch (error) {
    next(error);
  }
});

citizenDetailsController.post(CITIZEN_DETAILS_URL, async (req: Request, res: Response, next: NextFunction) => {
  const responseDataRedis: Party = await getRespondentInformation(req.params.id);
  try {
    const citizenAddress = new GenericForm<Address>(new Address(req.body));

    let citizenCorrespondenceAddress = new GenericForm<CitizenCorrespondenceAddress>(new CitizenCorrespondenceAddress(req.body));

    await citizenAddress.validate();
    if (req.body.postToThisAddress === YesNo.YES) {
      await citizenCorrespondenceAddress.validate();
      responseDataRedis.postToThisAddress = YesNo.YES;
    }

    if (citizenAddress.hasErrors() || citizenCorrespondenceAddress.hasErrors()) {
      renderPage(res, req, responseDataRedis, citizenAddress, citizenCorrespondenceAddress);
    } else {
      if (req.body.postToThisAddress === YesNo.NO) {
        citizenCorrespondenceAddress = new GenericForm<CitizenCorrespondenceAddress>(new CitizenCorrespondenceAddress());
      }
      await saveRespondent(req.params.id, citizenAddress, citizenCorrespondenceAddress, req.body.postToThisAddress, req.body.contactPerson);
      redirect(responseDataRedis, req, res);
    }
  } catch (error) {
    next(error);
  }
});

export default citizenDetailsController;
