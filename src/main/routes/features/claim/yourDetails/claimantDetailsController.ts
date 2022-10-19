import {NextFunction, Request, Response, Router} from 'express';
import {
  CLAIMANT_COMPANY_DETAILS_URL,
  CLAIMANT_DOB_URL,
  CLAIMANT_INDIVIDUAL_DETAILS_URL,
  CLAIMANT_ORGANISATION_DETAILS_URL,
  CLAIMANT_PHONE_NUMBER_URL,
  CLAIMANT_SOLE_TRADER_DETAILS_URL,
} from '../../../urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {Address} from '../../../../common/form/models/address';
import {CitizenCorrespondenceAddress} from '../../../../common/form/models/citizenCorrespondenceAddress';
import {YesNo} from '../../../../common/form/models/yesNo';
import {
  getClaimantPartyInformation,
  getCorrespondenceAddressForm,
  saveClaimantParty,
} from '../../../../services/features/claim/yourDetails/claimantDetailsService';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {Party} from '../../../../common/models/party';
import {AppRequest} from '../../../../common/models/AppRequest';
import {PartyType} from '../../../../common/models/partyType';
import {getPartyTypeDependingOnRoute} from '../../../../services/features/claim/claimantOrDefendantTypeService';
import {PartyDetails} from '../../../../common/form/models/partyDetails';

const claimantDetailsController = Router();
const claimantOrganisationDetailsPath = 'features/claim/yourDetails/claimant-organisation-details';
const claimantIndividualDetailsPath = 'features/claim/yourDetails/claimant-individual-details';

const detailsURLs = [
  CLAIMANT_ORGANISATION_DETAILS_URL,
  CLAIMANT_INDIVIDUAL_DETAILS_URL,
  CLAIMANT_COMPANY_DETAILS_URL,
  CLAIMANT_SOLE_TRADER_DETAILS_URL,
];

function renderPage(res: Response, req: Request, party: GenericForm<Party>, claimantIndividualAddress: GenericForm<Address>, claimantIndividualCorrespondenceAddress: GenericForm<CitizenCorrespondenceAddress>, claimantDetails: GenericForm<PartyDetails>, partyType: PartyType): void {
  if (partyType === PartyType.COMPANY || partyType === PartyType.ORGANISATION) {
    res.render(claimantOrganisationDetailsPath, {
      party,
      claimantIndividualAddress,
      claimantIndividualCorrespondenceAddress,
      type: partyType,
    });
  } else {
    res.render(claimantIndividualDetailsPath, {
      claimant: party,
      claimantIndividualAddress,
      claimantIndividualCorrespondenceAddress,
      claimantDetails,
      type: partyType,
    });
  }
}

claimantDetailsController.get(detailsURLs, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const partyType = getPartyTypeDependingOnRoute(req.url);
    const caseId = req.session?.user?.id;
    const claimant: Party = await getClaimantPartyInformation(caseId);
    const claimantIndividualAddress = new GenericForm<Address>(Address.fromJson(claimant.primaryAddress));
    const claimantIndividualCorrespondenceAddress = new GenericForm<CitizenCorrespondenceAddress>(CitizenCorrespondenceAddress.fromJson(claimant.correspondenceAddress));
    const claimantDetails = new GenericForm<PartyDetails>(new PartyDetails(claimant));
    const party = new GenericForm(claimant);

    renderPage(res, req, party, claimantIndividualAddress, claimantIndividualCorrespondenceAddress, claimantDetails, partyType);
  } catch (error) {
    next(error);
  }
});

claimantDetailsController.post(detailsURLs, async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  const partyType = getPartyTypeDependingOnRoute(req.url);
  const caseId = (<AppRequest>req).session?.user?.id;
  const claimant: Party = await getClaimantPartyInformation(caseId);
  let party = new GenericForm(new Party());
  try {
    const claimantIndividualAddress = new GenericForm<Address>(Address.fromObject(req.body));
    const claimantIndividualCorrespondenceAddress = new GenericForm<CitizenCorrespondenceAddress>(getCorrespondenceAddressForm(req.body));
    if (partyType === PartyType.COMPANY || partyType === PartyType.ORGANISATION) {
      party = new GenericForm(new Party(req.body.partyName, req.body.contactPerson));
      party.validateSync();
    }
    const claimantDetails = new GenericForm<PartyDetails>(new PartyDetails(req.body));

    claimantDetails.validateSync();
    claimantIndividualAddress.validateSync();

    if (req.body.provideCorrespondenceAddress === YesNo.YES) {
      claimantIndividualCorrespondenceAddress.validateSync();
      claimant.provideCorrespondenceAddress = YesNo.YES;
    }

    if (claimantDetails.hasErrors() || party.hasErrors() || claimantIndividualAddress.hasErrors() || claimantIndividualCorrespondenceAddress.hasErrors()) {
      renderPage(res, req, party, claimantIndividualAddress, claimantIndividualCorrespondenceAddress, claimantDetails, partyType);
    } else {
      await saveClaimantParty(caseId, claimantIndividualAddress.model, claimantIndividualCorrespondenceAddress.model, req.body.provideCorrespondenceAddress, party.model);

      if (partyType === PartyType.COMPANY || partyType === PartyType.ORGANISATION) {
        res.redirect(constructResponseUrlWithIdParams(caseId, CLAIMANT_PHONE_NUMBER_URL));
      } else {
        res.redirect(constructResponseUrlWithIdParams(caseId, CLAIMANT_DOB_URL));
      }
    }
  } catch (error) {
    next(error);
  }
});

export default claimantDetailsController;
