import * as express from 'express';
import {
  CLAIM_CLAIMANT_INDIVIDUAL_DETAILS_URL,
  CLAIM_CLAIMANT_DOB,
} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {CitizenAddress} from '../../../common/form/models/citizenAddress';
import {CitizenCorrespondenceAddress} from '../../../common/form/models/citizenCorrespondenceAddress';
import {YesNo} from '../../../common/form/models/yesNo';
import {
  getClaimantInformation,
  saveClaimant,
} from '../../../services/features/claim/claimantDetailsService';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {PartyDetails} from '../../../common/form/models/partyDetails';
import {Party} from '../../../common/models/claim';
import {AppRequest} from 'common/models/AppRequest';

const claimantIndividualDetailsController = express.Router();
const claimantIndividualDetailsPath = 'features/claim/claimant-individual-details';

function renderPage(res: express.Response, req: express.Request, claimant: Party,  claimantIndividualAddress: GenericForm<CitizenAddress>, claimantIndividualCorrespondenceAddress: GenericForm<CitizenCorrespondenceAddress>, claimantDetails: GenericForm<PartyDetails>): void {
  const partyName = claimant?.partyName;
  const type = claimant?.type;

  res.render(claimantIndividualDetailsPath, {
    claimant,
    claimantIndividualAddress,
    claimantIndividualCorrespondenceAddress,
    claimantDetails,
    partyName,
    type,
  });
}

claimantIndividualDetailsController.get(CLAIM_CLAIMANT_INDIVIDUAL_DETAILS_URL, async (req:AppRequest, res:express.Response, next: express.NextFunction) => {
  try {
    const caseId = req.session?.user?.id;
    const claimant: Party = await getClaimantInformation(caseId);

    const claimantIndividualAddress = new GenericForm<CitizenAddress>(new CitizenAddress(
      claimant?.primaryAddress?.AddressLine1,
      claimant?.primaryAddress?.AddressLine2,
      claimant?.primaryAddress?.AddressLine3,
      claimant?.primaryAddress?.PostTown,
      claimant?.primaryAddress?.PostCode));

    const claimantIndividualCorrespondenceAddress = new GenericForm<CitizenCorrespondenceAddress>(new CitizenCorrespondenceAddress(
      claimant?.correspondenceAddress?.AddressLine1,
      claimant?.correspondenceAddress?.AddressLine2,
      claimant?.correspondenceAddress?.AddressLine3,
      claimant?.correspondenceAddress?.PostTown,
      claimant?.correspondenceAddress?.PostCode));

    const claimantDetails = new GenericForm<PartyDetails>(new PartyDetails(
      claimant.individualTitle,
      claimant.individualFirstName,
      claimant.individualLastName,
    ));
    renderPage(res, req, claimant, claimantIndividualAddress, claimantIndividualCorrespondenceAddress, claimantDetails);
  } catch (error) {
    next(error);
  }
});

claimantIndividualDetailsController.post(CLAIM_CLAIMANT_INDIVIDUAL_DETAILS_URL, async (req: any, res: express.Response, next: express.NextFunction) => {
  const caseId = req.session?.user?.id;
  const responseDataRedis: Party = await getClaimantInformation(caseId);
  try {
    const claimantIndividualAddress = new GenericForm<CitizenAddress>(new CitizenAddress(
      req.body.primaryAddressLine1,
      req.body.primaryAddressLine2,
      req.body.primaryAddressLine3,
      req.body.primaryCity,
      req.body.primaryPostCode,
    ));

    let claimantIndividualCorrespondenceAddress = new GenericForm<CitizenCorrespondenceAddress>(new CitizenCorrespondenceAddress(
      req.body.correspondenceAddressLine1,
      req.body.correspondenceAddressLine2,
      req.body.correspondenceAddressLine3,
      req.body.correspondenceCity,
      req.body.correspondencePostCode,
    ));

    const claimantDetails = new GenericForm<PartyDetails>(new PartyDetails(
      req.body.claimantIndividualDetailsTitle,
      req.body.claimantIndividualDetailsFirstName,
      req.body.claimantIndividualDetailsLastName,
    ));

    claimantDetails.validateSync();
    claimantIndividualAddress.validateSync();

    if (req.body.provideCorrespondenceAddress === YesNo.YES) {
      claimantIndividualCorrespondenceAddress.validateSync();
      responseDataRedis.provideCorrespondenceAddress = YesNo.YES;
    }

    if (claimantDetails.hasErrors() || claimantIndividualAddress.hasErrors() || claimantIndividualCorrespondenceAddress.hasErrors()) {
      renderPage(res, req, responseDataRedis, claimantIndividualAddress, claimantIndividualCorrespondenceAddress, claimantDetails);
    } else {
      if (req.body.postToThisAddress === YesNo.NO) {
        claimantIndividualCorrespondenceAddress = new GenericForm<CitizenCorrespondenceAddress>(new CitizenCorrespondenceAddress());
      }
      await saveClaimant(caseId, claimantIndividualAddress, claimantIndividualCorrespondenceAddress, req.body.provideCorrespondenceAddress, claimantDetails);
      res.redirect(constructResponseUrlWithIdParams(caseId, CLAIM_CLAIMANT_DOB));
    }
  } catch (error) {
    next(error);
  }
});

export default claimantIndividualDetailsController;
