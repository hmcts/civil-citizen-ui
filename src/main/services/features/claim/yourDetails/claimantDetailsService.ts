import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {Party} from '../../../../common/models/party';
import {PartyDetails} from '../../../../common/form/models/partyDetails';

export const getClaimantInformation = async (claimId: string): Promise<Party> => {
  const responseData = await getCaseDataFromStore(claimId);
  return Object.assign(new Party(), responseData?.applicant1);
};
//TODO remove that method and use saveClaimantProperty
export const saveClaimant = async (claimId: string, partyDetails: PartyDetails): Promise<void> => {
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

  await saveDraftClaim(claimId, responseData);
};

export const saveClaimantProperty = async (userId: string, propertyName: string, value: any): Promise<void> => {
  const claim = await getCaseDataFromStore(userId);
  if (claim.applicant1) {
    claim.applicant1[propertyName as keyof Party] = value;
  } else {
    const claimant = new Party();
    claimant[propertyName as keyof Party] = value;
    claim.applicant1 = claimant;
  }
  await saveDraftClaim(userId, claim);
};
