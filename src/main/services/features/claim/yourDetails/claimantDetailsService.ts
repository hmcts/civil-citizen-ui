import {AppRequest} from 'common/models/AppRequest';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {PartyDetails} from 'form/models/partyDetails';

export const getClaimantInformation = async (req: AppRequest): Promise<Party> => {
  const draftResult = await getDraftClaim(req);
  const claim = Object.assign(new Claim(), draftResult?.claimResponse?.case_data as unknown as Claim);
  return Object.assign(new Party(), claim.applicant1);
};
//TODO remove that method and use saveClaimantProperty
export const saveClaimant = async (req: AppRequest, partyDetails: PartyDetails): Promise<void> => {
  const draftResult = await getDraftClaim(req);
  if (!draftResult) {
    throw new Error('[claimantDetailsService] no draft claim found to update');
  }

  const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
  const draftId = req.session?.draftId || draftResult.rawResponse?.draftId;

  if (!claim.applicant1) {
    claim.applicant1 = new Party();
    claim.applicant1.partyDetails = new PartyDetails({});
  }
  claim.applicant1.partyDetails.provideCorrespondenceAddress = partyDetails?.provideCorrespondenceAddress;
  claim.applicant1.partyDetails.primaryAddress = partyDetails?.primaryAddress;
  claim.applicant1.partyDetails.correspondenceAddress = partyDetails?.correspondenceAddress;
  claim.applicant1.partyDetails.title = partyDetails?.title;
  claim.applicant1.partyDetails.firstName = partyDetails?.firstName;
  claim.applicant1.partyDetails.lastName = partyDetails?.lastName;
  claim.applicant1.partyDetails.partyName = partyDetails?.partyName;
  claim.applicant1.partyDetails.contactPerson = partyDetails?.contactPerson;
  claim.applicant1.partyDetails.soleTraderTradingAs = partyDetails?.soleTraderTradingAs;

  if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
    claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
  }

  await updateDraftClaim(req, claim, draftId);
};

export const saveClaimantProperty = async (req: AppRequest, propertyName: string, value: unknown): Promise<void> => {
  const draftResult = await getDraftClaim(req);
  if (!draftResult) {
    throw new Error('[claimantDetailsService] no draft claim found to update');
  }
  const claim: Claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
  const draftId = req.session?.draftId || draftResult.rawResponse?.draftId;

  if (claim.applicant1) {
    (claim.applicant1 as unknown as Record<string, unknown>)[propertyName as keyof Party] = value;
  } else {
    const claimant = new Party();
    (claimant as unknown as Record<string, unknown>)[propertyName as keyof Party] = value;
    claim.applicant1 = claimant;
  }

  if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
    claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
  }

  await updateDraftClaim(req, claim, draftId);
};
