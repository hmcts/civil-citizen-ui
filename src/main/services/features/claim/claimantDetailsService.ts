import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {Respondent} from '../../../common/models/respondent';
import {Claim, Party} from '../../../common/models/claim';
import {PrimaryAddress} from '../../../common/models/primaryAddress';
import {CorrespondenceAddress} from '../../../common/models/correspondenceAddress';
import {CitizenAddress} from '../../../common/form/models/citizenAddress';
import {CitizenCorrespondenceAddress} from '../../../common/form/models/citizenCorrespondenceAddress';
import {GenericForm} from '../../../common/form/models/genericForm';
import {YesNo} from '../../../common/form/models/yesNo';
import {PartyDetails} from '../../../common/form/models/partyDetails';

export const getClaimantInformation = async (claimId: string): Promise<Party> => {
  const responseData = await getCaseDataFromStore(claimId);
  if (responseData?.applicant1) {
    return responseData.applicant1;
  }
  return {};
};

export const saveClaimant = async (claimId: string, citizenAddress: GenericForm<CitizenAddress>, citizenCorrespondenceAddress: GenericForm<CitizenCorrespondenceAddress>, postToThisAddress: YesNo, claimantDetails: GenericForm<PartyDetails>): Promise<void> => {
  const responseData = await getCaseDataFromStore(claimId) || new Claim();
  if (!responseData.applicant1) {
    responseData.applicant1 = new Respondent();
  }
  responseData.applicant1.postToPrimaryAddress = postToThisAddress;
  responseData.applicant1.primaryAddress = buildPrimaryAddress(citizenAddress);
  responseData.applicant1.correspondenceAddress = citizenCorrespondenceAddress.model.isEmpty() ? undefined : buildCorrespondenceAddress(citizenCorrespondenceAddress);
  responseData.applicant1.individualTitle = claimantDetails.model.title;
  responseData.applicant1.individualFirstName = claimantDetails.model.firstName;
  responseData.applicant1.individualLastName = claimantDetails.model.lastName;

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

