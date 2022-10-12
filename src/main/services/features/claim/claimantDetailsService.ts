import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {Respondent} from '../../../common/models/respondent';
import {Claim, Party} from '../../../common/models/claim';
import {convertToPrimaryAddress} from '../../../common/models/primaryAddress';
import {convertToCorrespondenceAddress} from '../../../common/models/correspondenceAddress';
import {Address} from '../../../common/form/models/address';
import {CitizenCorrespondenceAddress} from '../../../common/form/models/citizenCorrespondenceAddress';
import {YesNo} from '../../../common/form/models/yesNo';
import {PartyDetails} from '../../../common/form/models/partyDetails';

export const getClaimantInformation = async (claimId: string): Promise<Party> => {
  const responseData = await getCaseDataFromStore(claimId);
  return (responseData?.applicant1) ? responseData.applicant1 : {};
};

export const saveClaimant = async (claimId: string, citizenAddress: Address, citizenCorrespondenceAddress: CitizenCorrespondenceAddress, postToThisAddress: YesNo, claimantDetails: PartyDetails): Promise<void> => {
  const responseData = await getCaseDataFromStore(claimId) || new Claim();
  if (!responseData.applicant1) {
    responseData.applicant1 = new Respondent();
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
