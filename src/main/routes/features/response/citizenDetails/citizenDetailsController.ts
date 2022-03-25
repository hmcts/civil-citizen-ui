import * as express from 'express';
import {Validator} from 'class-validator';
import {Form} from '../../../../common/form/models/form';
import {CITIZEN_DETAILS_URL, DOB_URL} from '../../../urls';
import {CitizenAddress} from '../../../../common/form/models/citizenAddress';
import {CitizenCorrespondenceAddress} from '../../../../common/form/models/citizenCorrespondenceAddress';
import {Respondent} from '../../../../common/models/respondent';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {CitizenDetailsService} from 'modules/citizenDetails/citizenDetailsService';
import {YesNo} from '../../../../common/form/models/yesNo';

const router = express.Router();
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('citizenDetailsController');

let citizenFullName: object;
const citizenDetailsService = new CitizenDetailsService();
const CITIZEN_DETAILS_VIEW_PATH = 'features/response/citizenDetails/citizen-details';

router.get(CITIZEN_DETAILS_URL, async (req: express.Request, res: express.Response) => {
  try {
    let formAddressModel;
    let formCorrespondenceModel;
    const responseDataRedis: Respondent = await citizenDetailsService.getRespondentInformation(req.params.id);
    if(!responseDataRedis){
      formAddressModel = new CitizenAddress(
        responseDataRedis.primaryAddress.addressLine1,
        responseDataRedis.primaryAddress.addressLine2,
        responseDataRedis.primaryAddress.addressLine3,
        responseDataRedis.primaryAddress.postTown,
        responseDataRedis.primaryAddress.postCode);
      formCorrespondenceModel = new CitizenCorrespondenceAddress(
        responseDataRedis.correspondenceAddress.AddressLine1,
        responseDataRedis.correspondenceAddress.AddressLine2,
        responseDataRedis.correspondenceAddress.AddressLine3,
        responseDataRedis.correspondenceAddress.PostTown,
        responseDataRedis.correspondenceAddress.PostCode);
    }
    citizenFullName = {
      individualTitle: responseDataRedis?.individualTitle || 'individualTitle Test',
      individualFirstName: responseDataRedis?.individualFirstName || 'individualFirstName test',
      individualLastName: responseDataRedis?.individualLastName || 'individualLastName test',
    };
    res.render(CITIZEN_DETAILS_VIEW_PATH, {
      citizenFullName: citizenFullName,
      citizenAddress: formAddressModel,
      citizenCorrespondenceAddress: formCorrespondenceModel,
      postToThisAddress: formCorrespondenceModel ? YesNo.YES : YesNo.NO,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).send({error: error.message});
  }
});

// -- POST Citizen Address
router.post(CITIZEN_DETAILS_URL, async (req: express.Request, res: express.Response) => {
  const citizenAddress = new CitizenAddress(
    req.body.primaryAddressLine1,
    req.body.primaryAddressLine2,
    req.body.primaryAddressLine3,
    req.body.primaryCity,
    req.body.primaryPostCode,
  );
  const citizenCorrespondenceAddress = new CitizenCorrespondenceAddress(
    req.body.correspondenceAddressLine1,
    req.body.correspondenceAddressLine2,
    req.body.correspondenceAddressLine3,
    req.body.correspondenceCity,
    req.body.correspondencePostCode,
  );
  const validator = new Validator();
  const errorList = new Form();
  if (req.body.postToThisAddress === 'yes') {
    citizenAddress.errors = validator.validateSync(citizenAddress);
    citizenCorrespondenceAddress.errors = validator.validateSync(citizenCorrespondenceAddress);
    errorList.errors = citizenAddress.errors.concat(citizenCorrespondenceAddress.errors);
  } else {
    citizenAddress.errors = validator.validateSync(citizenAddress);
    errorList.errors = citizenAddress.errors;
  }
  if ((citizenAddress.errors && citizenAddress.errors.length > 0)
    || (citizenCorrespondenceAddress.errors && citizenCorrespondenceAddress.errors.length > 0)) {
    renderPageWithError(res, citizenAddress, citizenCorrespondenceAddress, errorList, req);
  } else {

    /*const respondent = new Respondent();
    respondent.primaryAddress = new PrimaryAddress();
    respondent.primaryAddress.AddressLine1 = citizenAddress.primaryAddressLine1;
    respondent.primaryAddress.AddressLine2 = citizenAddress.primaryAddressLine2;
    respondent.primaryAddress.AddressLine3 = citizenAddress.primaryAddressLine3;
    respondent.primaryAddress.PostTown = citizenAddress.primaryCity;
    respondent.primaryAddress.PostCode = citizenAddress.primaryPostCode;
    if (req.body.correspondenceAddressLine1 && req.body.correspondenceCity && req.body.correspondencePostCode) {
      respondent.correspondenceAddress = new CorrespondenceAddress();
      respondent.correspondenceAddress.AddressLine1 = req.body.correspondenceAddressLine1;
      respondent.correspondenceAddress.AddressLine2 = req.body.correspondenceAddressLine2;
      respondent.correspondenceAddress.AddressLine3 = req.body.correspondenceAddressLine3;
      respondent.correspondenceAddress.PostTown = req.body.correspondenceCity;
      respondent.correspondenceAddress.PostCode = req.body.correspondencePostCode;
    }
    //claim.respondent1 = respondent;
    //await saveDraftClaim(req.params.id, claim);*/
    await  saveRespondent(citizenAddress,citizenCorrespondenceAddress);
    res.redirect(constructResponseUrlWithIdParams(req.params.id, DOB_URL));
  }
});

function renderPageWithError(res: express.Response, citizenAddress: CitizenAddress, citizenCorrespondenceAddress: CitizenCorrespondenceAddress, errorList: Form, req: express.Request) {
  res.render(CITIZEN_DETAILS_VIEW_PATH, {
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
    postToThisAddress: req.body.postToThisAddress,
  });
}

export default router;
