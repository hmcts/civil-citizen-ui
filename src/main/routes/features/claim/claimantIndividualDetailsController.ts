import * as express from 'express';
import {CLAIM_CLAIMANT_INDIVIDUAL_DETAILS_URL, CLAIM_CLAIMANT_DOB} from '../../urls';
import {Respondent} from 'models/respondent';
import {getRespondentInformation} from '../../../services/features/response/citizenDetails/citizenDetailsService';
import {GenericForm} from 'common/form/models/genericForm';
import {CitizenAddress} from 'common/form/models/citizenAddress';
import {CitizenCorrespondenceAddress} from 'common/form/models/citizenCorrespondenceAddress';

const claimantIndividualDetailsController = express.Router();
const claimantIndividualDetailsPath = 'features/claim/claimant-individual-details';

function renderPage(res: express.Response, req: express.Request, respondent: Respondent,  citizenAddress: GenericForm<CitizenAddress>, citizenCorrespondenceAddress: GenericForm<CitizenCorrespondenceAddress>): void {
  const partyName = respondent?.partyName;
  const type = respondent?.type;
  const contactPerson = respondent?.contactPerson;

  res.render(claimantIndividualDetailsPath, {
    respondent,
    citizenAddress,
    citizenCorrespondenceAddress,
    partyName: partyName,
    contactPerson: contactPerson,
    type: type,
    urlNextView: CLAIM_CLAIMANT_DOB,
  });
}

claimantIndividualDetailsController.get(CLAIM_CLAIMANT_INDIVIDUAL_DETAILS_URL, async (req:express.Request, res:express.Response, next: express.NextFunction) => {
  try {
    // TODO : change the hard coded case id to the userID
    const respondent: Respondent = await getRespondentInformation('1645882162449409');

    const claimantIndividualAddress = new GenericForm<CitizenAddress>(new CitizenAddress(
      respondent?.primaryAddress ? respondent.primaryAddress.AddressLine1 : undefined,
      respondent?.primaryAddress ? respondent.primaryAddress.AddressLine2 : undefined,
      respondent?.primaryAddress ? respondent.primaryAddress.AddressLine3 : undefined,
      respondent?.primaryAddress ? respondent.primaryAddress.PostTown : undefined,
      respondent?.primaryAddress ? respondent.primaryAddress.PostCode : undefined));

    const claimantIndividualCorrespondenceAddress = new GenericForm<CitizenCorrespondenceAddress>(new CitizenCorrespondenceAddress(
      respondent?.correspondenceAddress ? respondent.correspondenceAddress.AddressLine1 : undefined,
      respondent?.correspondenceAddress ? respondent.correspondenceAddress.AddressLine2 : undefined,
      respondent?.correspondenceAddress ? respondent.correspondenceAddress.AddressLine3 : undefined,
      respondent?.correspondenceAddress ? respondent.correspondenceAddress.PostTown : undefined,
      respondent?.correspondenceAddress ? respondent.correspondenceAddress.PostCode : undefined));

    renderPage(res, req, respondent, claimantIndividualAddress, claimantIndividualCorrespondenceAddress);
  } catch (error) {
    next(error);
  }
});

claimantIndividualDetailsController.post(CLAIM_CLAIMANT_INDIVIDUAL_DETAILS_URL, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  //const responseDataRedis: Respondent = await getRespondentInformation(req.params.id);

});

export default claimantIndividualDetailsController;
