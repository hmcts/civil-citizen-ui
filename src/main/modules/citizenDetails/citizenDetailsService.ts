import {
  getCaseDataFromStore,
  saveDraftClaim,
} from '../../modules/draft-store/draftStoreService';
import _, {get} from 'lodash';
import {Respondent} from '../../common/models/respondent';
import {Claim} from '../../common/models/claim';
import {PrimaryAddress} from '../../common/models/primaryAddress';
import {CorrespondenceAddress} from '../../common/models/correspondenceAddress';
import {CitizenAddress} from '../../common/form/models/citizenAddress';
import {CitizenCorrespondenceAddress} from '../../common/form/models/citizenCorrespondenceAddress';


export const getRespondentInformation = async (claimId: string): Promise<Respondent> => {
  const responseData = await getCaseDataFromStore(claimId);
  if (get(responseData, 'respondent1')) {
    return responseData.respondent1;
  }
  return new Respondent();
};

export const saveRespondent = async(claimId: string, citizenAddress: CitizenAddress, citizenCorrespondenceAddress: CitizenCorrespondenceAddress) : Promise<void> => {
  const responseData = await getCaseDataFromStore(claimId) || new Claim();
  if (!get(responseData, 'respondent1')) {
    const respondent = new Respondent();
    respondent.primaryAddress = buildPrimaryAddress(citizenAddress);
    respondent.correspondenceAddress = _.isEmpty(citizenCorrespondenceAddress) ?  buildCorrespondenceAddress(citizenCorrespondenceAddress) : undefined;
    responseData.respondent1 = respondent;
  } else {
    responseData.respondent1.primaryAddress = buildPrimaryAddress(citizenAddress);
    responseData.respondent1.correspondenceAddress = _.isEmpty(citizenCorrespondenceAddress) ? buildCorrespondenceAddress(citizenCorrespondenceAddress) : undefined;
  }
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

