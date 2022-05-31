import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {Respondent} from '../../../../common/models/respondent';
import {Claim} from '../../../../common/models/claim';
import {PrimaryAddress} from '../../../../common/models/primaryAddress';
import {CorrespondenceAddress} from '../../../../common/models/correspondenceAddress';
import {CitizenAddress} from '../../../../common/form/models/citizenAddress';
import {CitizenCorrespondenceAddress} from '../../../../common/form/models/citizenCorrespondenceAddress';


export const getRespondentInformation = async (claimId: string): Promise<Respondent> => {
  const responseData = await getCaseDataFromStore(claimId);
  if (responseData?.respondent1) {
    return responseData.respondent1;
  }
  return new Respondent();
};

export const saveRespondent = async (claimId: string, citizenAddress: CitizenAddress, citizenCorrespondenceAddress: CitizenCorrespondenceAddress, contactPerson = ''): Promise<void> => {
  const responseData = await getCaseDataFromStore(claimId) || new Claim();
  if (!responseData.respondent1) {
    responseData.respondent1 = new Respondent();
  }
  responseData.respondent1.contactPerson = contactPerson;
  responseData.respondent1.primaryAddress = buildPrimaryAddress(citizenAddress);
  responseData.respondent1.correspondenceAddress = citizenCorrespondenceAddress.isEmpty() ? undefined : buildCorrespondenceAddress(citizenCorrespondenceAddress);

  await saveDraftClaim(claimId, responseData);
};

const buildPrimaryAddress = (citizenAddress: CitizenAddress): PrimaryAddress => {

  return {
    AddressLine1: citizenAddress.primaryAddressLine1,
    AddressLine2: citizenAddress.primaryAddressLine2,
    AddressLine3: citizenAddress.primaryAddressLine3,
    PostTown: citizenAddress.primaryCity,
    PostCode: citizenAddress.primaryPostCode,
  };
};

const buildCorrespondenceAddress = (citizenCorrespondenceAddress: CitizenCorrespondenceAddress): CorrespondenceAddress => {
  return {
    AddressLine1: citizenCorrespondenceAddress.correspondenceAddressLine1,
    AddressLine2: citizenCorrespondenceAddress.correspondenceAddressLine2,
    AddressLine3: citizenCorrespondenceAddress.correspondenceAddressLine3,
    PostTown: citizenCorrespondenceAddress.correspondenceCity,
    PostCode: citizenCorrespondenceAddress.correspondencePostCode,
  };
};

