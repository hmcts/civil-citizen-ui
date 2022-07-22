import * as express from 'express';
import {Validator} from 'class-validator';
import {Form} from '../../../../common/form/models/form';
import {CITIZEN_DETAILS_URL, DOB_URL, CITIZEN_PHONE_NUMBER_URL} from '../../../urls';
import {CitizenAddress} from '../../../../common/form/models/citizenAddress';
import {CitizenCorrespondenceAddress} from '../../../../common/form/models/citizenCorrespondenceAddress';
import {Respondent} from '../../../../common/models/respondent';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {YesNo} from '../../../../common/form/models/yesNo';
import {getRespondentInformation, saveRespondent} from '../../../../services/features/response/citizenDetails/citizenDetailsService';
import _ from 'lodash';
import { CounterpartyType } from '../../../../common/models/counterpartyType';

const citizenDetailsController = express.Router();

let citizenFullName: object;

const CITIZEN_DETAILS_COMPANY_VIEW_PATH = 'features/response/citizenDetails/citizen-details-company';
const CITIZEN_DETAILS_VIEW_PATH = 'features/response/citizenDetails/citizen-details';

const getViewpathWithType = (type: CounterpartyType) => {
  if (type === CounterpartyType.ORGANISATION || type === CounterpartyType.COMPANY) {
    return CITIZEN_DETAILS_COMPANY_VIEW_PATH;
  }
  return CITIZEN_DETAILS_VIEW_PATH;
};

function renderPageWithError(res: express.Response, citizenAddress: CitizenAddress, citizenCorrespondenceAddress: CitizenCorrespondenceAddress, errorList: Form, req: express.Request, respondent: Respondent): void {
  const partyName = respondent?.partyName;
  const type = respondent?.type;
  const contactPerson = respondent?.contactPerson;
  const postToThisAddress = respondent?.postToThisAddress;
  const viewPath = getViewpathWithType(type);
  res.render(viewPath, {
    citizenFullName: citizenFullName,
    citizenAddress: citizenAddress,
    citizenCorrespondenceAddress: citizenCorrespondenceAddress,
    errorList: errorList.getErrors(),
    addressLine1Error: errorList.getTextError(citizenAddress.getErrors(), 'primaryAddressLine1'),
    addressCityError: errorList.getTextError(citizenAddress.getErrors(), 'primaryCity'),
    addressPostCodeError: errorList.getTextError(citizenAddress.getErrors(), 'primaryPostCode'),
    correspondenceAddressLine1Error: req.body.postToThisAddress == YesNo.YES ? errorList.getTextError(citizenCorrespondenceAddress.getErrors(), 'correspondenceAddressLine1') : '',
    correspondenceCityError: req.body.postToThisAddress == YesNo.YES ? errorList.getTextError(citizenCorrespondenceAddress.getErrors(), 'correspondenceCity') : '',
    correspondencePostCodeError: req.body.postToThisAddress == YesNo.YES ? errorList.getTextError(citizenCorrespondenceAddress.getErrors(), 'correspondencePostCode') : '',
    postToThisAddress: postToThisAddress,
    partyName: partyName,
    contactPerson: contactPerson,
    type: type,
  });
}

const redirect =  async (responseDataRedis: Respondent, req: express.Request, res: express.Response) => {
  if (responseDataRedis?.type === CounterpartyType.SOLE_TRADER || responseDataRedis?.type === CounterpartyType.INDIVIDUAL) {
    res.redirect(constructResponseUrlWithIdParams(req.params.id, DOB_URL));
  } else {
    res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_PHONE_NUMBER_URL));
  }
};

citizenDetailsController.get(CITIZEN_DETAILS_URL, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    let citizenAddressModel;
    let citizenCorrespondenceAddressModel;
    const responseDataRedis: Respondent = await getRespondentInformation(req.params.id);
    const postToThisAddress = responseDataRedis.postToThisAddress;
    if (!_.isEmpty(responseDataRedis)) {
      citizenAddressModel = new CitizenAddress(
        responseDataRedis.primaryAddress.AddressLine1,
        responseDataRedis.primaryAddress.AddressLine2,
        responseDataRedis.primaryAddress.AddressLine3,
        responseDataRedis.primaryAddress.PostTown,
        responseDataRedis.primaryAddress.PostCode);
      citizenCorrespondenceAddressModel = responseDataRedis.correspondenceAddress ? new CitizenCorrespondenceAddress(
        responseDataRedis.correspondenceAddress.AddressLine1,
        responseDataRedis.correspondenceAddress.AddressLine2,
        responseDataRedis.correspondenceAddress.AddressLine3,
        responseDataRedis.correspondenceAddress.PostTown,
        responseDataRedis.correspondenceAddress.PostCode) : undefined;
    }
    citizenFullName = {
      individualTitle: responseDataRedis?.individualTitle || 'individualTitle Test',
      individualFirstName: responseDataRedis?.individualFirstName || 'individualFirstName test',
      individualLastName: responseDataRedis?.individualLastName || 'individualLastName test',
    };

    const viewPath = getViewpathWithType(responseDataRedis?.type);
    res.render(viewPath, {
      citizenFullName: citizenFullName,
      citizenAddress: citizenAddressModel,
      citizenCorrespondenceAddress: citizenCorrespondenceAddressModel,
      postToThisAddress: postToThisAddress,
      partyName: responseDataRedis?.partyName,
      contactPerson: responseDataRedis?.contactPerson,
      type: responseDataRedis?.type,
    });
  } catch (error) {
    next(error);
  }
});

citizenDetailsController.post(CITIZEN_DETAILS_URL, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const responseDataRedis: Respondent = await getRespondentInformation(req.params.id);
  try {
    const citizenAddress = new CitizenAddress(
      req.body.primaryAddressLine1,
      req.body.primaryAddressLine2,
      req.body.primaryAddressLine3,
      req.body.primaryCity,
      req.body.primaryPostCode,
    );

    let citizenCorrespondenceAddress = new CitizenCorrespondenceAddress(
      req.body.correspondenceAddressLine1,
      req.body.correspondenceAddressLine2,
      req.body.correspondenceAddressLine3,
      req.body.correspondenceCity,
      req.body.correspondencePostCode,
    );

    const contactPerson = req.body.contactPerson;
    const postToThisAddress = req.body.postToThisAddress;

    const validator = new Validator();
    const errorList = new Form();
    if (postToThisAddress === YesNo.YES) {
      citizenAddress.errors = validator.validateSync(citizenAddress);
      citizenCorrespondenceAddress.errors = validator.validateSync(citizenCorrespondenceAddress);
      errorList.errors = citizenAddress.errors.concat(citizenCorrespondenceAddress.errors);
    } else {
      citizenAddress.errors = validator.validateSync(citizenAddress);
      errorList.errors = citizenAddress.errors;
      citizenCorrespondenceAddress = new CitizenCorrespondenceAddress();
    }
    if ((citizenAddress?.errors?.length > 0)
      || (citizenCorrespondenceAddress?.errors?.length > 0)) {
      renderPageWithError(res, citizenAddress, citizenCorrespondenceAddress, errorList, req, responseDataRedis);
    } else {
      await saveRespondent(req.params.id, citizenAddress, citizenCorrespondenceAddress, postToThisAddress, contactPerson);
      redirect(responseDataRedis, req, res);
    }
  } catch (error) {
    next(error);
  }
});

export default citizenDetailsController;
