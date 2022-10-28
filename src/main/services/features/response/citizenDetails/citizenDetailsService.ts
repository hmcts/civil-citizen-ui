import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {Party} from 'models/party';
import {Address, convertToAddress} from 'common/form/models/address';
import {CitizenCorrespondenceAddress} from 'common/form/models/citizenCorrespondenceAddress';
import {YesNo} from 'common/form/models/yesNo';

export const getRespondentInformation = async (claimId: string): Promise<Party> => {
  const responseData = await getCaseDataFromStore(claimId);
  if (responseData.respondent1) {
    return responseData.respondent1;
  }
  return new Party();
};

export const getCorrespondenceAddressForm = (value?: Record<string, string>): CitizenCorrespondenceAddress => {
  let citizenCorrespondenceAddress = CitizenCorrespondenceAddress.fromObject(value);
  if (value.postToThisAddress === YesNo.NO) {
    citizenCorrespondenceAddress = undefined;
  }
  if (citizenCorrespondenceAddress) {
    return citizenCorrespondenceAddress;
  }
  return new CitizenCorrespondenceAddress();
};

export const saveRespondent = async (claimId: string, citizenAddress: Address, citizenCorrespondenceAddress: CitizenCorrespondenceAddress, party: Party): Promise<void> => {
  const responseData = await getCaseDataFromStore(claimId);
  if (!responseData.respondent1) {
    responseData.respondent1 = new Party();
  }
  responseData.respondent1.partyDetails.primaryAddress = citizenAddress;
  responseData.respondent1.partyDetails.correspondenceAddress = convertToAddress(citizenCorrespondenceAddress);
  responseData.respondent1.partyDetails.partyPhone = party?.partyDetails.partyPhone;
  responseData.respondent1.contactPerson = party?.contactPerson;
  responseData.respondent1.postToThisAddress = party?.postToThisAddress;

  await saveDraftClaim(claimId, responseData);
};
