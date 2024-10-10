import {CCDClaim} from 'models/civilClaimResponse';
import {ConfirmYourDetailsEvidence} from 'form/models/confirmYourDetailsEvidence';

export const convertToCUIEvidenceConfirmDetails = (ccdClaim: CCDClaim) : ConfirmYourDetailsEvidence => {
  if (ccdClaim) {
    const confirmDetails: ConfirmYourDetailsEvidence = new ConfirmYourDetailsEvidence();
    if (ccdClaim.respondent1LiPResponse?.respondent1DQEvidenceConfirmDetails?.firstName) {
      confirmDetails.firstName = ccdClaim.respondent1LiPResponse.respondent1DQEvidenceConfirmDetails.firstName;
      confirmDetails.lastName = ccdClaim.respondent1LiPResponse.respondent1DQEvidenceConfirmDetails.lastName;
      confirmDetails.emailAddress = ccdClaim.respondent1LiPResponse.respondent1DQEvidenceConfirmDetails.email;
      confirmDetails.phoneNumber = ccdClaim.respondent1LiPResponse.respondent1DQEvidenceConfirmDetails.phone ? Number(ccdClaim.respondent1LiPResponse.respondent1DQEvidenceConfirmDetails.phone) : undefined;
      confirmDetails.jobTitle = ccdClaim.respondent1LiPResponse.respondent1DQEvidenceConfirmDetails.jobTitle;
    }
    return confirmDetails;
  }
};
