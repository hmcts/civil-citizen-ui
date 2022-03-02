import * as express from 'express';
import { Validator } from 'class-validator';
import config from 'config';
import { Form } from '../../../../common/form/models/form';
import { CITIZEN_DETAILS_URL } from '../../../urls';
import { CivilServiceClient } from '../../../../app/client/civilServiceClient';
import {Claim} from '../../../../common/models/claim';
import { CitizenAddress } from '../../../../common/form/models/citizenAddress';
import { CitizenCorrespondenceAddress } from '../../../../common/form/models/citizenCorrespondenceAddress';

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
  claim = await civilServiceClient.retrieveClaimDetails('1643033241924739');

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
        formAddressModel = new CitizenAddress(
          JSON.parse(data).primaryAddressLine1,
          JSON.parse(data).primaryAddressLine2,
          JSON.parse(data).primaryAddressLine3,
          JSON.parse(data).primaryCity,
          JSON.parse(data).primaryPostCode);

        formCorrespondenceModel = new CitizenCorrespondenceAddress(
          JSON.parse(data).correspondenceAddressLine1,
          JSON.parse(data).correspondenceAddressLine2,
          JSON.parse(data).correspondenceAddressLine3,
          JSON.parse(data).correspondenceCity,
          JSON.parse(data).correspondencePostCode);
      } catch (e) {
        console.log(e);
      }
    } else {
      formAddressModel = new CitizenAddress(
        claim.respondent1.primaryAddress.AddressLine1,
        claim.respondent1.primaryAddress.AddressLine2,
        claim.respondent1.primaryAddress.AddressLine3,
        claim.respondent1.primaryAddress.PostTown,
        claim.respondent1.primaryAddress.PostCode);

      formCorrespondenceModel = new CitizenCorrespondenceAddress(
        claim.respondent1.correspondenceAddress.AddressLine1,
        claim.respondent1.correspondenceAddress.AddressLine2,
        claim.respondent1.correspondenceAddress.AddressLine3,
        claim.respondent1.correspondenceAddress.PostTown,
        claim.respondent1.correspondenceAddress.PostCode);
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

  if ((citizenAddress.errors && citizenAddress.errors.length > 0)
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
