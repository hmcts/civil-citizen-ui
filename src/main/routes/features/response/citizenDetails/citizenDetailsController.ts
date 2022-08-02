import * as express from 'express';
import {CITIZEN_DETAILS_URL, DOB_URL, CITIZEN_PHONE_NUMBER_URL} from '../../../urls';
import {CitizenAddress} from '../../../../common/form/models/citizenAddress';
import {CitizenCorrespondenceAddress} from '../../../../common/form/models/citizenCorrespondenceAddress';
import {Respondent} from '../../../../common/models/respondent';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {YesNo} from '../../../../common/form/models/yesNo';
import {
  getRespondentInformation,
  saveRespondent,
} from '../../../../services/features/response/citizenDetails/citizenDetailsService';
import {CounterpartyType} from '../../../../common/models/counterpartyType';
import {GenericForm} from '../../../../common/form/models/genericForm';

const citizenDetailsController = express.Router();

const CITIZEN_DETAILS_COMPANY_VIEW_PATH = 'features/response/citizenDetails/citizen-details-company';
const CITIZEN_DETAILS_VIEW_PATH = 'features/response/citizenDetails/citizen-details';

const getViewpathWithType = (type: CounterpartyType) => {
  if (type === CounterpartyType.ORGANISATION || type === CounterpartyType.COMPANY) {
    return CITIZEN_DETAILS_COMPANY_VIEW_PATH;
  }
  return CITIZEN_DETAILS_VIEW_PATH;
};

function renderPage(res: express.Response, req: express.Request, respondent: Respondent, citizenAddress: GenericForm<CitizenAddress>, citizenCorrespondenceAddress: GenericForm<CitizenCorrespondenceAddress>): void {
  const partyName = respondent?.partyName;
  const type = respondent?.type;
  const contactPerson = respondent?.contactPerson;

  const viewPath = getViewpathWithType(type);
  res.render(viewPath, {
    respondent,
    citizenAddress,
    citizenCorrespondenceAddress,
    partyName: partyName,
    contactPerson: contactPerson,
    type: type,
  });
}

const redirect = async (responseDataRedis: Respondent, req: express.Request, res: express.Response) => {
  if (responseDataRedis?.type === CounterpartyType.SOLE_TRADER || responseDataRedis?.type === CounterpartyType.INDIVIDUAL) {
    res.redirect(constructResponseUrlWithIdParams(req.params.id, DOB_URL));
  } else {
    res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_PHONE_NUMBER_URL));
  }
};

citizenDetailsController.get(CITIZEN_DETAILS_URL, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const respondent: Respondent = await getRespondentInformation(req.params.id);

    const citizenAddress = new GenericForm<CitizenAddress>(new CitizenAddress(
      respondent?.primaryAddress ? respondent.primaryAddress.AddressLine1 : undefined,
      respondent?.primaryAddress ? respondent.primaryAddress.AddressLine2 : undefined,
      respondent?.primaryAddress ? respondent.primaryAddress.AddressLine3 : undefined,
      respondent?.primaryAddress ? respondent.primaryAddress.PostTown : undefined,
      respondent?.primaryAddress ? respondent.primaryAddress.PostCode : undefined));

    const citizenCorrespondenceAddress = new GenericForm<CitizenCorrespondenceAddress>(new CitizenCorrespondenceAddress(
      respondent?.correspondenceAddress ? respondent.correspondenceAddress.AddressLine1 : undefined,
      respondent?.correspondenceAddress ? respondent.correspondenceAddress.AddressLine2 : undefined,
      respondent?.correspondenceAddress ? respondent.correspondenceAddress.AddressLine3 : undefined,
      respondent?.correspondenceAddress ? respondent.correspondenceAddress.PostTown : undefined,
      respondent?.correspondenceAddress ? respondent.correspondenceAddress.PostCode : undefined));

    renderPage(res, req, respondent, citizenAddress, citizenCorrespondenceAddress);
  } catch (error) {
    next(error);
  }
});

citizenDetailsController.post(CITIZEN_DETAILS_URL, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const responseDataRedis: Respondent = await getRespondentInformation(req.params.id);
  try {
    const citizenAddress = new GenericForm<CitizenAddress>(new CitizenAddress(
      req.body.primaryAddressLine1,
      req.body.primaryAddressLine2,
      req.body.primaryAddressLine3,
      req.body.primaryCity,
      req.body.primaryPostCode,
    ));

    let citizenCorrespondenceAddress = new GenericForm<CitizenCorrespondenceAddress>(new CitizenCorrespondenceAddress(
      req.body.correspondenceAddressLine1,
      req.body.correspondenceAddressLine2,
      req.body.correspondenceAddressLine3,
      req.body.correspondenceCity,
      req.body.correspondencePostCode,
    ));

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
