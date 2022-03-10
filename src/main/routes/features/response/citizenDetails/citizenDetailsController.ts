import * as express from 'express';
import { Validator } from 'class-validator';
import config from 'config';
import { Form } from '../../../../common/form/models/form';
import { CITIZEN_DETAILS_URL } from '../../../urls';
import { CivilServiceClient } from '../../../../app/client/civilServiceClient';
import {Claim} from '../../../../common/models/claim';
import { CitizenAddress } from '../../../../common/form/models/citizenAddress';
import { CitizenCorrespondenceAddress } from '../../../../common/form/models/citizenCorrespondenceAddress';
import { DraftStoreService } from '../../../../modules/draft-store/draftStoreService';

import {AppRequest} from 'models/AppRequest';
import { CivilClaimResponse } from 'common/models/civilClaimResponse';
const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('citizenDetailsController');

const router = express.Router();

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
let citizenFullName: object;

let claim: Claim = new Claim();
const draftStoreClient = new DraftStoreService();

// -- GET Citizen Details
router.get(CITIZEN_DETAILS_URL, async (req: express.Request, res: express.Response) => {
  try {


    let formAddressModel;
    let formCorrespondenceModel;

    // -- Retrive form service
    claim = await civilServiceClient.retrieveClaimDetails(req.params.id, <AppRequest>req);
    if(claim){
      citizenFullName = {
        individualTitle: claim.respondent1.individualTitle,
        individualFirstName: claim.respondent1.individualFirstName,
        individualLastName: claim.respondent1.individualLastName,
      };
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

    // -- Retrive from Redis
    await draftStoreClient.getDraftClaimFromStore(claim.legacyCaseReference).then((data: CivilClaimResponse) => {
      if (data) {
        formAddressModel = new CitizenAddress(
          data.case_data.respondent1.primaryAddress.addressLine1,
          data.case_data.respondent1.primaryAddress.addressLine2,
          data.case_data.respondent1.primaryAddress.addressLine3,
          data.case_data.respondent1.primaryAddress.postTown,
          data.case_data.respondent1.primaryAddress.postCode);

        formCorrespondenceModel = new CitizenCorrespondenceAddress(
          data.case_data.respondent1.correspondenceAddress.addressLine1,
          data.case_data.respondent1.correspondenceAddress.addressLine2,
          data.case_data.respondent1.correspondenceAddress.addressLine3,
          data.case_data.respondent1.correspondenceAddress.postTown,
          data.case_data.respondent1.correspondenceAddress.postCode);

      }
    }).catch((err) => {
      throw Error(err);
      logger.error(`${err.stack || err}`);
    });

    res.render('features/response/citizenDetails/citizen-details', {
      citizenFullName: citizenFullName,
      citizenAddress: formAddressModel,
      citizenCorrespondenceAddress: formCorrespondenceModel,
      postToThisAddress: 'no',
    });
  } catch (err) {
    throw Error(err);
    logger.error(`${err.stack || err}`);
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

  if ((citizenAddress.  errors && citizenAddress.errors.length > 0)
      || (citizenCorrespondenceAddress.errors && citizenCorrespondenceAddress.errors.length > 0)) {
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
    claim.respondent1.primaryAddress.addressLine1 = citizenAddress.primaryAddressLine1;
    claim.respondent1.primaryAddress.addressLine2 = citizenAddress.primaryAddressLine2;
    claim.respondent1.primaryAddress.addressLine3 = citizenAddress.primaryAddressLine3;
    claim.respondent1.primaryAddress.postTown = citizenAddress.primaryCity;
    claim.respondent1.primaryAddress.postCode = citizenAddress.primaryPostCode;
    claim.respondent1.correspondenceAddress.addressLine1 = req.body.correspondenceAddressLine1;
    claim.respondent1.correspondenceAddress.addressLine2 = req.body.correspondenceAddressLine2;
    claim.respondent1.correspondenceAddress.addressLine3 = req.body.correspondenceAddressLine3;
    claim.respondent1.correspondenceAddress.postTown = req.body.correspondenceCity;
    claim.respondent1.correspondenceAddress.postCode = req.body.correspondencePostCode;
    await draftStoreClient.saveDraftClaim(req.params.id, claim);
    res.redirect('/case/1643033241924739/response/your-dob');
  }
});



export default router;
