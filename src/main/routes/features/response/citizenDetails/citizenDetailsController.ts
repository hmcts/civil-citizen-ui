import * as express from 'express';
import { Validator } from 'class-validator';
import config from 'config';
import { Form } from '../../../../common/form/models/form';
import { CITIZEN_DETAILS_URL } from '../../../urls';
import { CivilServiceClient } from '../../../../app/client/civilServiceClient';
import {Claim} from '../../../../common/models/claim';
import { CitizenAddress } from '../../../../common/form/models/citizenAddress';
import { CitizenCorrespondenceAddress } from '../../../../common/form/models/citizenCorrespondenceAddress';
import {AppRequest} from "models/AppRequest";
const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('citizenDetailsController');

const router = express.Router();

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
let citizenFullName: object;

let claim: Claim = new Claim();

// -- GET Citizen Details
router.get(CITIZEN_DETAILS_URL, async (req: express.Request, res: express.Response) => {
  let formAddressModel;
  let formCorrespondenceModel;
  // -- Retrive form service
  claim = await civilServiceClient.retrieveClaimDetails('1646649855553790', <AppRequest>req);

  citizenFullName = {
    individualTitle: claim.respondent1.individualTitle,
    individualFirstName: claim.respondent1.individualFirstName,
    individualLastName: claim.respondent1.individualLastName,
  };

  // -- Retrive from Redis
  const draftStoreClient = req.app.locals.draftStoreClient;

  await draftStoreClient.get(claim.legacyCaseReference).then((data: string) => {
    if (data) {
      try {
        const _data = JSON.parse(data);
        formAddressModel = new CitizenAddress(
          _data.primaryAddressLine1,
          _data.primaryAddressLine2,
          _data.primaryAddressLine3,
          _data.primaryCity,
          _data.primaryPostCode);

        formCorrespondenceModel = new CitizenCorrespondenceAddress(
          _data.correspondenceAddressLine1,
          _data.correspondenceAddressLine2,
          _data.correspondenceAddressLine3,
          _data.correspondenceCity,
          _data.correspondencePostCode);
      } catch (err) {
        logger.error(`${err.stack || err}`);
      }
    } else {
      formAddressModel = new CitizenAddress(
        claim.respondent1.primaryAddress.addressLine1,
        claim.respondent1.primaryAddress.addressLine2,
        claim.respondent1.primaryAddress.addressLine3,
        claim.respondent1.primaryAddress.postTown,
        claim.respondent1.primaryAddress.postCode);

      formCorrespondenceModel = new CitizenCorrespondenceAddress(
        claim.respondent1.correspondenceAddress.addressLine1,
        claim.respondent1.correspondenceAddress.addressLine2,
        claim.respondent1.correspondenceAddress.addressLine3,
        claim.respondent1.correspondenceAddress.postTown,
        claim.respondent1.correspondenceAddress.postCode);
    }
  });

  res.render('features/response/citizenDetails/citizen-details', {
    citizenFullName: citizenFullName,
    citizenAddress: formAddressModel,
    citizenCorrespondenceAddress: formCorrespondenceModel,
    postToThisAddress: 'no',
  });
});


// -- POST Citizen Address
router.post(CITIZEN_DETAILS_URL, async (req: express.Request, res: express.Response) => {
  const draftStoreClient = req.app.locals.draftStoreClient;
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

  if ((citizenAddress.  errors && citizenAddress.errors.length > 0)
      || citizenCorrespondenceAddress.errors && citizenCorrespondenceAddress.errors.length > 0) {
    res.render('features/response/citizenDetails/citizen-details', {
      citizenFullName: citizenFullName,
      citizenAddress: citizenAddress,
      citizenCorrespondenceAddress: citizenCorrespondenceAddress,
      errorList: errorList.getErrors(),
      addressLine1Error: errorList.getTextError(citizenAddress.getErrors(), 'primaryAddressLine1'),
      addressCityError: errorList.getTextError(citizenAddress.getErrors(), 'primaryCity'),
      addressPostCodeError: errorList.getTextError(citizenAddress.getErrors(), 'primaryPostCode'),
      correspondenceAddressLine1Error: req.body.postToThisAddress == 'yes' ? errorList.getTextError(citizenCorrespondenceAddress.getErrors(), 'correspondenceAddressLine1') : '',
      correspondenceCityError: req.body.postToThisAddress == 'yes' ? errorList.getTextError(citizenCorrespondenceAddress.getErrors(), 'correspondenceCity') : '',
      correspondencePostCodeError: req.body.postToThisAddress == 'yes' ? errorList.getTextError(citizenCorrespondenceAddress.getErrors(), 'correspondencePostCode') : '',
      postToThisAddress: req.body.postToThisAddress,
    });
  } else {
    await draftStoreClient.set(claim.legacyCaseReference, JSON.stringify(
      {
        primaryAddressLine1: req.body.primaryAddressLine1,
        primaryAddressLine2: req.body.primaryAddressLine2,
        primaryAddressLine3: req.body.primaryAddressLine3,
        primaryCity: req.body.primaryCity,
        primaryPostCode: req.body.primaryPostCode,
        correspondenceAddressLine1: req.body.correspondenceAddressLine1,
        correspondenceAddressLine2: req.body.correspondenceAddressLine2,
        correspondenceAddressLine3: req.body.correspondenceAddressLine3,
        correspondenceCity: req.body.correspondenceCity,
        correspondencePostCode: req.body.correspondencePostCode,
      },
    )).then(() => {
      res.redirect('/case/1643033241924739/response/your-dob');
    });
  }
});


export default router;
