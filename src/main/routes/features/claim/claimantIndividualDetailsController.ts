import * as express from 'express';
import {CLAIMANT_DOB_URL, CLAIM_CLAIMANT_INDIVIDUAL_DETAILS_URL} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {CitizenAddress} from '../../../common/form/models/citizenAddress';
import {CitizenCorrespondenceAddress} from '../../../common/form/models/citizenCorrespondenceAddress';
import {YesNo} from '../../../common/form/models/yesNo';
import {
  getClaimantInformation,
  getCorrespondenceAddressForm,
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

    const claimantIndividualAddress = new GenericForm<CitizenAddress>(CitizenAddress.fromJson(claimant.primaryAddress));
    const claimantIndividualCorrespondenceAddress = new GenericForm<CitizenCorrespondenceAddress>(CitizenCorrespondenceAddress.fromJson(claimant.correspondenceAddress));
    const claimantDetails = new GenericForm<PartyDetails>(PartyDetails.fromJson(claimant));

    renderPage(res, req, claimant, claimantIndividualAddress, claimantIndividualCorrespondenceAddress, claimantDetails);
  } catch (error) {
    next(error);
  }
});

claimantIndividualDetailsController.post(CLAIM_CLAIMANT_INDIVIDUAL_DETAILS_URL, async (req: any, res: express.Response, next: express.NextFunction) => {
  const caseId = req.session?.user?.id;
  const claimant: Party = await getClaimantInformation(caseId);
  try {
    const claimantIndividualAddress = new GenericForm<CitizenAddress>(CitizenAddress.fromObject(req.body));
    const claimantIndividualCorrespondenceAddress = new GenericForm<CitizenCorrespondenceAddress>(getCorrespondenceAddressForm(req.body));
    const claimantDetails = new GenericForm<PartyDetails>(PartyDetails.fromObject(req.body));

    claimantDetails.validateSync();
    claimantIndividualAddress.validateSync();

    if (req.body.provideCorrespondenceAddress === YesNo.YES) {
      claimantIndividualCorrespondenceAddress.validateSync();
      claimant.provideCorrespondenceAddress = YesNo.YES;
    }

    if (claimantDetails.hasErrors() || claimantIndividualAddress.hasErrors() || claimantIndividualCorrespondenceAddress.hasErrors()) {
      renderPage(res, req, claimant, claimantIndividualAddress, claimantIndividualCorrespondenceAddress, claimantDetails);
    } else {
      await saveClaimant(caseId, claimantIndividualAddress.model, claimantIndividualCorrespondenceAddress.model, req.body.provideCorrespondenceAddress, claimantDetails.model);
      res.redirect(constructResponseUrlWithIdParams(caseId, CLAIMANT_DOB_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default claimantIndividualDetailsController;
