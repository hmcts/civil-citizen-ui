import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {Respondent} from '../../../../common/models/respondent';
import {Claim} from '../../../../common/models/claim';
import {PrimaryAddress} from '../../../../common/models/primaryAddress';
import {CorrespondenceAddress} from '../../../../common/models/correspondenceAddress';
import {CitizenAddress} from '../../../../common/form/models/citizenAddress';
import {CitizenCorrespondenceAddress} from '../../../../common/form/models/citizenCorrespondenceAddress';
import {GenericForm} from '../../../../common/form/models/genericForm';


export const getRespondentInformation = async (claimId: string): Promise<Respondent> => {
  const responseData = await getCaseDataFromStore(claimId);
  if (responseData?.respondent1) {
    return responseData.respondent1;
  }
  return new Respondent();
};

export const saveRespondent = async (claimId: string, citizenAddress: GenericForm<CitizenAddress>, citizenCorrespondenceAddress: GenericForm<CitizenCorrespondenceAddress>, contactPerson = ''): Promise<void> => {
  const responseData = await getCaseDataFromStore(claimId) || new Claim();
  if (!responseData.respondent1) {
    responseData.respondent1 = new Respondent();
  }
  responseData.respondent1.contactPerson = contactPerson;
  responseData.respondent1.primaryAddress = buildPrimaryAddress(citizenAddress);
  responseData.respondent1.correspondenceAddress = citizenCorrespondenceAddress.model.isEmpty() ? undefined : buildCorrespondenceAddress(citizenCorrespondenceAddress);

  await saveDraftClaim(claimId, responseData);
};

const buildPrimaryAddress = (citizenAddress: GenericForm<CitizenAddress>): PrimaryAddress => {

  return {
    AddressLine1: citizenAddress.model.primaryAddressLine1,
    AddressLine2: citizenAddress.model.primaryAddressLine2,
    AddressLine3: citizenAddress.model.primaryAddressLine3,
    PostTown: citizenAddress.model.primaryCity,
    PostCode: citizenAddress.model.primaryPostCode,
  };
};

const buildCorrespondenceAddress = (citizenCorrespondenceAddress: GenericForm<CitizenCorrespondenceAddress>): CorrespondenceAddress => {
  return {
    AddressLine1: citizenCorrespondenceAddress.model.correspondenceAddressLine1,
    AddressLine2: citizenCorrespondenceAddress.model.correspondenceAddressLine2,
    AddressLine3: citizenCorrespondenceAddress.model.correspondenceAddressLine3,
    PostTown: citizenCorrespondenceAddress.model.correspondenceCity,
    PostCode: citizenCorrespondenceAddress.model.correspondencePostCode,
  };
};

