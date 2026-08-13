import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/claim';
import {Claim} from 'common/models/claim';
import {updateDraftClaim, getDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {Party} from 'models/party';
import {PartyDetails} from 'form/models/partyDetails';

export const getClaimantInformation = async (claimId: string): Promise<Party> => {
  const responseData = await getCaseDataFromStore(claimId);
  return Object.assign(new Party(), responseData?.applicant1);
};
//TODO remove that method and use saveClaimantProperty
export const saveClaimant = async (req: AppRequest, partyDetails: PartyDetails): Promise<void> => {
  const responseData = await getCaseDataFromStore(claimId);
  if (!responseData?.applicant1) {
    responseData.applicant1 = new Party();
    responseData.applicant1.partyDetails = new PartyDetails({});
  }
  responseData.applicant1.partyDetails.provideCorrespondenceAddress = partyDetails?.provideCorrespondenceAddress;
  responseData.applicant1.partyDetails.primaryAddress = partyDetails?.primaryAddress;
  responseData.applicant1.partyDetails.correspondenceAddress = partyDetails?.correspondenceAddress;
  responseData.applicant1.partyDetails.title = partyDetails?.title;
  responseData.applicant1.partyDetails.firstName = partyDetails?.firstName;
  responseData.applicant1.partyDetails.lastName = partyDetails?.lastName;
  responseData.applicant1.partyDetails.partyName = partyDetails?.partyName;
  responseData.applicant1.partyDetails.contactPerson = partyDetails?.contactPerson;
  responseData.applicant1.partyDetails.soleTraderTradingAs = partyDetails?.soleTraderTradingAs;

  await updateDraftClaim(req, responseData, req.session?.draftId);
};

export const saveClaimantProperty = async (req: AppRequest, propertyName: string, value: any): Promise<void> => {
  const claim = await getClaimFromDraft(req);
  if (claim.applicant1) {
    claim.applicant1[propertyName as keyof Party] = value;
  } else {
    const claimant = new Party();
    claimant[propertyName as keyof Party] = value;
    claim.applicant1 = claimant;
  }
  await updateDraftClaim(req, claim, req.session?.draftId);
};
