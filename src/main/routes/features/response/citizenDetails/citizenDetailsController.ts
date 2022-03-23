import * as express from 'express';
import {Validator} from 'class-validator';
import config from 'config';
import {Form} from '../../../../common/form/models/form';
import {CITIZEN_DETAILS_URL, DOB_URL} from '../../../urls';
import {CivilServiceClient} from '../../../../app/client/civilServiceClient';
import {Claim} from '../../../../common/models/claim';
import {CitizenAddress} from '../../../../common/form/models/citizenAddress';
import {CitizenCorrespondenceAddress} from '../../../../common/form/models/citizenCorrespondenceAddress';
import {AppRequest} from 'models/AppRequest';
import {CivilClaimResponse} from '../../../../common/models/civilClaimResponse';
import {Respondent} from '../../../../common/models/respondent';
import {PrimaryAddress} from '../../../../common/models/primaryAddress';
import {CorrespondenceAddress} from '../../../../common/models/correspondenceAddress';
import _ from 'lodash';
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('citizenDetailsController');
const router = express.Router();
import {getDraftClaimFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
let citizenFullName: object;
let claim: Claim = new Claim();
// -- GET Citizen Details
router.get(CITIZEN_DETAILS_URL, async (req: express.Request, res: express.Response) => {
  try {
    let formAddressModel;
    let formCorrespondenceModel;
    // -- Retrive from redis
    await getDraftClaimFromStore(req.params.id).then((data: CivilClaimResponse) => {
      if (!_.isEmpty(data)) {
        formAddressModel = new CitizenAddress(
          data.case_data.respondent1.primaryAddress.AddressLine1,
          data.case_data.respondent1.primaryAddress.AddressLine2,
          data.case_data.respondent1.primaryAddress.AddressLine3,
          data.case_data.respondent1.primaryAddress.PostTown,
          data.case_data.respondent1.primaryAddress.PostCode);
        formCorrespondenceModel = new CitizenCorrespondenceAddress(
          data.case_data.respondent1.correspondenceAddress.AddressLine1,
          data.case_data.respondent1.correspondenceAddress.AddressLine2,
          data.case_data.respondent1.correspondenceAddress.AddressLine3,
          data.case_data.respondent1.correspondenceAddress.PostTown,
          data.case_data.respondent1.correspondenceAddress.PostCode);
        claim = data.case_data;
      }
    }).catch((err: unknown) => {
      logger.error(`${(err as Error).stack || err}`);
    });
    if (!claim.legacyCaseReference) {
      // -- Retrive from civil-service
      claim = await civilServiceClient.retrieveClaimDetails(req.params.id, <AppRequest>req);
      if (claim) {
        if (claim.respondent1.primaryAddress) {
          //TODO create a new method
          formAddressModel = new CitizenAddress(
            claim.respondent1.primaryAddress.AddressLine1,
            claim.respondent1.primaryAddress.AddressLine2,
            claim.respondent1.primaryAddress.AddressLine3,
            claim.respondent1.primaryAddress.PostTown,
            claim.respondent1.primaryAddress.PostCode);
        }
        if (claim.respondent1.correspondenceAddress) {
          formCorrespondenceModel = new CitizenCorrespondenceAddress(
            claim.respondent1.correspondenceAddress.AddressLine1,
            claim.respondent1.correspondenceAddress.AddressLine2,
            claim.respondent1.correspondenceAddress.AddressLine3,
            claim.respondent1.correspondenceAddress.PostTown,
            claim.respondent1.correspondenceAddress.PostCode);
        } else {
          formCorrespondenceModel = new CitizenCorrespondenceAddress();
        }
      } else {
        claim = new Claim();
      }
    }
    citizenFullName = {
      individualTitle: claim?.respondent1?.individualTitle || 'individualTitle Test',
      individualFirstName: claim?.respondent1?.individualFirstName || 'individualFirstName test',
      individualLastName: claim?.respondent1?.individualLastName || 'individualLastName test',
    };
    res.render('features/response/citizenDetails/citizen-details', {
      citizenFullName: citizenFullName,
      citizenAddress: formAddressModel,
      citizenCorrespondenceAddress: formCorrespondenceModel,
      postToThisAddress: formCorrespondenceModel ? 'yes' : 'no',
    });
  } catch (err: unknown) {
    logger.error(`${(err as Error).stack || err}`);
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
    const respondent = new Respondent();
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
    claim.respondent1 = respondent;
    await saveDraftClaim(req.params.id, claim);
    res.redirect(constructResponseUrlWithIdParams(req.params.id, DOB_URL));
  }
});

export default router;
