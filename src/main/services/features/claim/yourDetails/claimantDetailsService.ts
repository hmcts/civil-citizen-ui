import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {Party} from 'models/party';
import {Claim} from 'models/claim';
import {convertToPrimaryAddress} from 'models/primaryAddress';
import {convertToCorrespondenceAddress} from 'models/correspondenceAddress';
import {CitizenAddress} from 'common/form/models/citizenAddress';
import {CitizenCorrespondenceAddress} from 'common/form/models/citizenCorrespondenceAddress';
import {YesNo} from 'common/form/models/yesNo';
import {PartyDetails} from 'common/form/models/partyDetails';

export const getClaimantInformation = async (claimId: string): Promise<Party> => {
  const responseData = await getCaseDataFromStore(claimId);
  return (responseData?.applicant1) ? responseData.applicant1 : {};
};

export const saveClaimant = async (claimId: string, citizenAddress: CitizenAddress, citizenCorrespondenceAddress: CitizenCorrespondenceAddress, postToThisAddress: YesNo, claimantDetails: PartyDetails): Promise<void> => {
  const responseData = await getCaseDataFromStore(claimId) || new Claim();
  if (!responseData.applicant1) {
    responseData.applicant1 = new Party();
  }
  responseData.applicant1.provideCorrespondenceAddress = postToThisAddress;
  responseData.applicant1.primaryAddress = convertToPrimaryAddress(citizenAddress);
  responseData.applicant1.correspondenceAddress = citizenCorrespondenceAddress.isEmpty()
    ? undefined
    : convertToCorrespondenceAddress(citizenCorrespondenceAddress);
  responseData.applicant1.individualTitle = claimantDetails.title;
  responseData.applicant1.individualFirstName = claimantDetails.firstName;
  responseData.applicant1.individualLastName = claimantDetails.lastName;

  await saveDraftClaim(claimId, responseData);
};

export const getCorrespondenceAddressForm = (value?: Record<string, string>): CitizenCorrespondenceAddress => {
  let claimantIndividualCorrespondenceAddress = CitizenCorrespondenceAddress.fromObject(value);
  if (value.provideCorrespondenceAddress === YesNo.NO) {
    claimantIndividualCorrespondenceAddress = undefined;
  }
  if (claimantIndividualCorrespondenceAddress) {
    return claimantIndividualCorrespondenceAddress;
  }
  return new CitizenCorrespondenceAddress();
};

export const getClaimantPartyInformation = async (claimId: string): Promise<Party> => {
  const responseData = await getCaseDataFromStore(claimId);
  return Object.assign(new Party(), responseData?.applicant1);
};

export const saveClaimantParty = async (claimId: string, citizenAddress: CitizenAddress, citizenCorrespondenceAddress: CitizenCorrespondenceAddress, postToThisAddress: YesNo, party: Party): Promise<void> => {
  const responseData = await getCaseDataFromStore(claimId);
  if (!responseData.applicant1) {
    responseData.applicant1 = new Party();
  }
  responseData.applicant1.provideCorrespondenceAddress = postToThisAddress;
  responseData.applicant1.primaryAddress = convertToPrimaryAddress(citizenAddress);
  responseData.applicant1.correspondenceAddress = citizenCorrespondenceAddress.isEmpty()
    ? undefined
    : convertToCorrespondenceAddress(citizenCorrespondenceAddress);
  responseData.applicant1.individualTitle = party.individualTitle;
  responseData.applicant1.individualFirstName = party.individualFirstName;
  responseData.applicant1.individualLastName = party.individualLastName;

  await saveDraftClaim(claimId, responseData);
};

