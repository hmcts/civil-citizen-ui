import * as express from 'express';
import { Validator } from 'class-validator';
import config from 'config';
import { Form } from '../../../../common/form/models/form';
import {CLAIM_DETAILS_URL, CITIZEN_DETAILS_URL } from '../../../urls';
import { CivilServiceClient } from '../../../../app/client/civilServiceClient';
import {Claim} from '../../../../common/models/claim';
import { CitizenAddress } from '../../../../common/form/models/citizenAddress';
import { CitizenCorrespondenceAddress } from '../../../../common/form/models/citizenCorrespondenceAddress';

const router = express.Router();

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

let claim: Claim = new Claim();

function renderPage(res: express.Response, claimDetails: Claim): void {
  res.render('features/response/claim-details', {
    claim: claimDetails,
  });
}

const getCitizenFullName = () => {
  const citizenFullName = {
    individualTitle: claim.respondent1.individualTitle,
    individualFirstName: claim.respondent1.individualFirstName,
    individualLastName: claim.respondent1.individualLastName,
  };

  return citizenFullName;
}

// -- GET Claim Details
router.get(CLAIM_DETAILS_URL, async (req: express.Request, res: express.Response) => {
  claim = await civilServiceClient.retrieveClaimDetails('1643033241924739');
  renderPage(res, claim);
});

// -- GET Citizen Details
router.get(CITIZEN_DETAILS_URL, async (req: express.Request, res: express.Response) => {
  let formAddressModel;
  let formCorrespondenceModel;
  // -- Retrive form service
  claim = await civilServiceClient.retrieveClaimDetails('1643033241924739');
  // -- Retrive from Redis
  const draftStoreClient = req.app.locals.draftStoreClient;

  await draftStoreClient.get(claim.legacyCaseReference).then((data: any) => {
    console.log('DATA: ', JSON.parse(data));
    if (data) {
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
    citizenFullName: getCitizenFullName(),
    citizenAddress: formAddressModel,
    citizenCorrespondenceAddress: formCorrespondenceModel,
  });
});


// -- POST Citizen Address
router.post(CITIZEN_DETAILS_URL, async (req: express.Request, res: express.Response) => {
  console.log('BODY: ', req.body);
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
  citizenAddress.errors = validator.validateSync(citizenAddress);
  citizenCorrespondenceAddress.errors = validator.validateSync(citizenCorrespondenceAddress);

  const errorList = new Form();
  errorList.errors = citizenAddress.errors.concat(citizenCorrespondenceAddress.errors);
  console.log("ERRORList", citizenAddress.getErrors())

  if ((citizenAddress.errors && citizenAddress.errors.length > 0)
      || citizenCorrespondenceAddress.errors && citizenCorrespondenceAddress.errors.length > 0) {
    res.render('features/response/citizenDetails/citizen-details', {
      citizenFullName: getCitizenFullName(),
      citizenAddress: citizenAddress,
      citizenCorrespondenceAddress: citizenCorrespondenceAddress,
      errorList: errorList.getErrors(),
      addressLine1Error: errorList.getTextError(citizenAddress.getErrors(), 'primaryAddressLine1'),
      addressCityError: errorList.getTextError(citizenAddress.getErrors(), 'primaryCity'),
      addressPostCodeError: errorList.getTextError(citizenAddress.getErrors(), 'primaryPostCode'),
      correspondenceAddressLine1Error: errorList.getTextError(citizenCorrespondenceAddress.getErrors(), 'correspondenceAddressLine1'),
      correspondenceCityError: errorList.getTextError(citizenCorrespondenceAddress.getErrors(), 'correspondenceCity'),
      correspondencePostCodeError: errorList.getTextError(citizenCorrespondenceAddress.getErrors(), 'correspondencePostCode')
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
