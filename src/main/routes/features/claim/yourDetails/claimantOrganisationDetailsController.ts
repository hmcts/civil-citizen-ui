import * as express from 'express';
import {CLAIMANT_ORGANISATION_DETAILS_URL, CLAIMANT_PHONE_NUMBER_URL} from '../../../urls';
import {GenericForm} from 'common/form/models/genericForm';
import {CitizenAddress} from 'common/form/models/citizenAddress';
import {CitizenCorrespondenceAddress} from 'common/form/models/citizenCorrespondenceAddress';
import {YesNo} from 'common/form/models/yesNo';
import {
  getClaimantPartyInformation,
  getCorrespondenceAddressForm,
  saveClaimantParty,
} from '../../../../services/features/claim/yourDetails/claimantDetailsService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Party} from 'models/party';
import {AppRequest} from 'models/AppRequest';

const claimantIndividualDetailsController = express.Router();
const claimantIndividualDetailsPath = 'features/claim/yourDetails/claimant-organisation-details';

function renderPage(res: express.Response, req: express.Request, party: GenericForm<Party>, claimantIndividualAddress: GenericForm<CitizenAddress>, claimantIndividualCorrespondenceAddress: GenericForm<CitizenCorrespondenceAddress>): void {

  res.render(claimantIndividualDetailsPath, {
    party,
    claimantIndividualAddress,
    claimantIndividualCorrespondenceAddress,
  });
}

claimantIndividualDetailsController.get(CLAIMANT_ORGANISATION_DETAILS_URL, async (req: AppRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const caseId = req.session?.user?.id;
    const claimant: Party = await getClaimantPartyInformation(caseId);
    const claimantIndividualAddress = new GenericForm<CitizenAddress>(CitizenAddress.fromJson(claimant.primaryAddress));
    const claimantIndividualCorrespondenceAddress = new GenericForm<CitizenCorrespondenceAddress>(CitizenCorrespondenceAddress.fromJson(claimant.correspondenceAddress));
    const party = new GenericForm(claimant);

    renderPage(res, req, party, claimantIndividualAddress, claimantIndividualCorrespondenceAddress);
  } catch (error) {
    next(error);
  }
});

claimantIndividualDetailsController.post(CLAIMANT_ORGANISATION_DETAILS_URL, async (req: any, res: express.Response, next: express.NextFunction) => {
  const caseId = req.session?.user?.id;
  const claimant: Party = await getClaimantPartyInformation(caseId);
  try {
    const claimantIndividualAddress = new GenericForm<CitizenAddress>(CitizenAddress.fromObject(req.body));
    const claimantIndividualCorrespondenceAddress = new GenericForm<CitizenCorrespondenceAddress>(getCorrespondenceAddressForm(req.body));
    const party = new GenericForm(new Party(req.body.partyName, req.body.contactPerson));

    party.validateSync();
    claimantIndividualAddress.validateSync();

    if (req.body.provideCorrespondenceAddress === YesNo.YES) {
      claimantIndividualCorrespondenceAddress.validateSync();
      claimant.provideCorrespondenceAddress = YesNo.YES;
    }

    if (party.hasErrors() || claimantIndividualAddress.hasErrors() || claimantIndividualCorrespondenceAddress.hasErrors()) {
      renderPage(res, req, party, claimantIndividualAddress, claimantIndividualCorrespondenceAddress);
    } else {
      await saveClaimantParty(caseId, claimantIndividualAddress.model, claimantIndividualCorrespondenceAddress.model, req.body.provideCorrespondenceAddress, party.model);
      res.redirect(constructResponseUrlWithIdParams(caseId, CLAIMANT_PHONE_NUMBER_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default claimantIndividualDetailsController;
