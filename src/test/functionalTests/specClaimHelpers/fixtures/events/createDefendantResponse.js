const config = require('../../../../config');

const admitAllDefendantResponse = require('./admitAllDefendantResponse.js');
const partAdmitSmallClaims = require('./partAdmitSmallClaims.js');
const partAdmitFastTrack = require('./partAdmitFastTrack.js');
const rejectAllSmallClaims = require('./rejectAllSmallClaims.js');
const rejectAllFastTrack = require('./rejectAllSmallClaims.js');

module.exports = {
  createDefendantResponse: (totalClaimAmount, responseType, claimType) => {
    switch (responseType) {
      case config.defenceType.admitAllPayImmediateWithIndividual:
        return admitAllDefendantResponse.admitAllPayImmediateWithIndividual(totalClaimAmount);
      case config.defenceType.admitAllPayBySetDateWithIndividual:
        return admitAllDefendantResponse.admitAllPayBySetDateWithIndividual(totalClaimAmount);
      case config.defenceType.admitAllPayByInstallmentWithIndividual:
        return admitAllDefendantResponse.admitAllPayByInstallmentWithIndividual(totalClaimAmount);
      case config.defenceType.partAdmitAmountPaidWithIndividual:
        if (claimType === 'FastTrack') {
          return partAdmitFastTrack.partAdmitAmountPaidWithIndividual(totalClaimAmount);
        } else {
          return partAdmitSmallClaims.partAdmitAmountPaidWithIndividual(totalClaimAmount);
        }
      case config.defenceType.partAdmitHaventPaidPartiallyWantsToPayImmediatelyWithIndividual:
        if (claimType === 'FastTrack') {
          return partAdmitFastTrack.partAdmitHaventPaidPartiallyWantsToPayImmediatelyWithIndividual(totalClaimAmount);
        } else {
          return partAdmitSmallClaims.partAdmitHaventPaidPartiallyWantsToPayImmediatelyWithIndividual(totalClaimAmount);
        }
      case config.defenceType.partAdmitWithPartPaymentOnSpecificDateWithIndividual:
        if (claimType === 'FastTrack') {
          return partAdmitFastTrack.partAdmitWithPartPaymentOnSpecificDateWithIndividual(totalClaimAmount);
        } else {
          return partAdmitSmallClaims.partAdmitWithPartPaymentOnSpecificDateWithIndividual(totalClaimAmount);
        }
      case config.defenceType.partAdmitWithPartPaymentAsPerInstallmentPlanWithIndividual:
        if (claimType === 'FastTrack') {
          return partAdmitFastTrack.partAdmitWithPartPaymentAsPerInstallmentPlanWithIndividual(totalClaimAmount);
        } else {
          return partAdmitSmallClaims.partAdmitWithPartPaymentAsPerInstallmentPlanWithIndividual(totalClaimAmount);
        }
      case config.defenceType.rejectAllDisputeAllWithIndividual:
        if (claimType === 'FastTrack') {
          return rejectAllFastTrack.rejectAllDisputeAllWithIndividual(totalClaimAmount);
        } else {
          return rejectAllSmallClaims.rejectAllDisputeAllWithIndividual(totalClaimAmount);
        }
      case config.defenceType.rejectAllAlreadyPaidWithIndividual:
        if (claimType === 'FastTrack') {
          return rejectAllFastTrack.rejectAllAlreadypaidWithIndividual(totalClaimAmount);
        } else {
          return rejectAllSmallClaims.rejectAllAlreadypaidWithIndividual(totalClaimAmount);
        }
    }
  },
};