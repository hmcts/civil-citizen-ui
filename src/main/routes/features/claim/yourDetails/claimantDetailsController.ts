import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  CLAIMANT_COMPANY_DETAILS_URL,
  CLAIMANT_DOB_URL,
  CLAIMANT_INDIVIDUAL_DETAILS_URL,
  CLAIMANT_ORGANISATION_DETAILS_URL,
  CLAIMANT_PHONE_NUMBER_URL,
  CLAIMANT_SOLE_TRADER_DETAILS_URL,
} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {
  getClaimantInformation,
  saveClaimantProperty,
} from 'services/features/claim/yourDetails/claimantDetailsService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Party} from 'models/party';
import {AppRequest} from 'models/AppRequest';
import {PartyType} from 'models/partyType';
import {generateCorrespondenceAddressErrorMessages, PartyDetails} from 'form/models/partyDetails';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {isCarmEnabledForCase} from 'common/utils/carmToggleUtils';

const claimantDetailsController = Router();
const claimantOrganisationDetailsPath = 'features/claim/yourDetails/claimant-organisation-details';
const claimantIndividualDetailsPath = 'features/claim/yourDetails/claimant-individual-details';

const detailsURLs = [
  CLAIMANT_ORGANISATION_DETAILS_URL,
  CLAIMANT_INDIVIDUAL_DETAILS_URL,
  CLAIMANT_COMPANY_DETAILS_URL,
  CLAIMANT_SOLE_TRADER_DETAILS_URL,
];

function renderPage(res: Response, req: Request, claimantDetails: GenericForm<PartyDetails>, partyType: PartyType, carmEnabled: boolean): void {
  if (partyType === PartyType.COMPANY || partyType === PartyType.ORGANISATION) {
    res.render(claimantOrganisationDetailsPath, {
      party: claimantDetails,
      type: partyType,
      carmEnabled: carmEnabled,
    });
  } else {
    res.render(claimantIndividualDetailsPath, {
      party: claimantDetails,
      type: partyType,
    });
  }
}

claimantDetailsController.get(detailsURLs, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const caseId = req.session?.user?.id;
    const claimant: Party = await getClaimantInformation(caseId);
    const claimantDetails = new GenericForm<PartyDetails>(claimant.partyDetails);
    const claim: Claim = await getCaseDataFromStore(caseId);
    const carmEnabled = await isCarmEnabledForCase(claim.draftClaimCreatedAt);
    renderPage(res, req, claimantDetails, claimant.type, carmEnabled);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

claimantDetailsController.post(detailsURLs, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  const caseId = (<AppRequest>req).session?.user?.id;
  const claim: Claim = await getCaseDataFromStore(caseId);
  const carmEnabled = await isCarmEnabledForCase(claim.draftClaimCreatedAt);

  try {
    const claimant = await getClaimantInformation(caseId);
    const partyDetails = new GenericForm<PartyDetails>(new PartyDetails(req.body, carmEnabled));

    partyDetails.validateSync();

    if (partyDetails.hasErrors()) {
      generateCorrespondenceAddressErrorMessages(partyDetails);
      renderPage(res, req, partyDetails, claimant.type, carmEnabled);
    } else {
      await saveClaimantProperty(caseId, 'partyDetails', partyDetails.model);

      if (claimant.type === PartyType.COMPANY || claimant.type === PartyType.ORGANISATION) {
        res.redirect(constructResponseUrlWithIdParams(caseId, CLAIMANT_PHONE_NUMBER_URL));
      } else {
        res.redirect(constructResponseUrlWithIdParams(caseId, CLAIMANT_DOB_URL));
      }
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default claimantDetailsController;
