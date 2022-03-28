import * as express from 'express';
import {Validator} from 'class-validator';
import {Form} from '../../../../common/form/models/form';
import {CITIZEN_DETAILS_URL, DOB_URL} from '../../../urls';
import {CitizenAddress} from '../../../../common/form/models/citizenAddress';
import {CitizenCorrespondenceAddress} from '../../../../common/form/models/citizenCorrespondenceAddress';
import {Respondent} from '../../../../common/models/respondent';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {YesNo} from '../../../../common/form/models/yesNo';
import {getRespondentInformation, saveRespondent} from '../../../../modules/citizenDetails/citizenDetailsService';
import _ from 'lodash';


const router = express.Router();
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('citizenDetailsController');

let citizenFullName: object;

const CITIZEN_DETAILS_VIEW_PATH = 'features/response/citizenDetails/citizen-details';

function renderPageWithError(res: express.Response, citizenAddress: CitizenAddress, citizenCorrespondenceAddress: CitizenCorrespondenceAddress, errorList: Form, req: express.Request): void {
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

router.get(CITIZEN_DETAILS_URL, async (req: express.Request, res: express.Response) => {
  try {
    let formAddressModel;
    let formCorrespondenceModel;
    const responseDataRedis: Respondent = await getRespondentInformation(req.params.id);
    if (!_.isEmpty(responseDataRedis)) {
      formAddressModel = new CitizenAddress(
        responseDataRedis.primaryAddress.AddressLine1,
        responseDataRedis.primaryAddress.AddressLine2,
        responseDataRedis.primaryAddress.AddressLine3,
        responseDataRedis.primaryAddress.PostTown,
        responseDataRedis.primaryAddress.PostCode);
      formCorrespondenceModel = responseDataRedis.correspondenceAddress ? new CitizenCorrespondenceAddress(
        responseDataRedis.correspondenceAddress.AddressLine1,
        responseDataRedis.correspondenceAddress.AddressLine2,
        responseDataRedis.correspondenceAddress.AddressLine3,
        responseDataRedis.correspondenceAddress.PostTown,
        responseDataRedis.correspondenceAddress.PostCode) : '';
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

router.post(CITIZEN_DETAILS_URL, async (req: express.Request, res: express.Response) => {
  try {
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
    if (req.body.postToThisAddress === YesNo.YES) {
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
      await saveRespondent(req.params.id, citizenAddress, citizenCorrespondenceAddress);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, DOB_URL));
    }
  } catch (error) {
    logger.error(error);
    res.status(500).send({error: error.message});
  }
});

export default router;
