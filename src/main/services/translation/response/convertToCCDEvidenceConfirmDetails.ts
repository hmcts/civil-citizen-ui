import {ConfirmYourDetailsEvidence} from 'form/models/confirmYourDetailsEvidence';

export const convertToCCDEvidenceConfirmDetails = (confirmDetails: ConfirmYourDetailsEvidence) => {
  if (confirmDetails?.firstName) {
    return {
      firstName: confirmDetails.firstName,
      lastName: confirmDetails.lastName,
      email: confirmDetails.emailAddress,
      phone:  confirmDetails.phoneNumber?.toString(),
      jobTitle: confirmDetails.jobTitle,
    };
  }
};
