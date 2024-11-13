const config = require('../../../../config');

const admitAllDefendantResponse = require('./admitAllDefendantResponse.js');
const partAdmitSmallClaims = require('./partAdmitSmallClaimsDefendantResponse');
const partAdmitFastTrack = require('./partAdmitFastTrackDefendantResponse');
const rejectAllSmallClaims = require('./rejectAllSmallClaimsDefendantResponse');
const rejectAllFastTrack = require('./rejectAllFastTrackDefendantResponse');
const rejectAllSmallClaimsCarm = require('./defendantResponseCarm');
const rejectAllIntermediateClaim = require('./defendantResponseIntermediateClaim');
const rejectAllMultiClaim = require('./defendantResponseMultiClaim');

module.exports = {
  createDefendantResponse: (totalClaimAmount, responseType, claimType, partyType, language, respondentLanguage) => {
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
          return rejectAllSmallClaims.rejectAllDisputeAllWithIndividual(totalClaimAmount, language, respondentLanguage);
        }
      case config.defenceType.rejectAllAlreadyPaidNotFullWithIndividual:
        if (claimType === 'FastTrack') {
          return rejectAllFastTrack.rejectAllAlreadypaidNotFullWithIndividual(totalClaimAmount);
        } else {
          return rejectAllSmallClaims.rejectAllAlreadypaidNotFullWithIndividual(totalClaimAmount);
        }
      case config.defenceType.rejectAllAlreadyPaidInFullWithIndividual:
        if (claimType === 'FastTrack') {
          return rejectAllFastTrack.rejectAllAlreadypaidInFullWithIndividual(totalClaimAmount);
        } else {
          return rejectAllSmallClaims.rejectAllAlreadypaidInFullWithIndividual(totalClaimAmount);
        }
      case config.defenceType.rejectAllIntermediateTrackMinti:
        return rejectAllIntermediateClaim.citizenDefendantResponseCompany(totalClaimAmount);
      case config.defenceType.rejectAllMultiTrackMinti:
        return rejectAllMultiClaim.citizenDefendantResponseCompany(totalClaimAmount);
      case config.defenceType.rejectAllSmallClaimsCarm:
        if (partyType === 'DefendantCompany') {
          return rejectAllSmallClaimsCarm.citizenDefendantResponseCarmCompany(totalClaimAmount);
        } else if (partyType === 'DefendantSoleTrader') {
          return rejectAllSmallClaimsCarm.citizenDefendantResponseCarmSoleTrader(totalClaimAmount);
        } else if (partyType === 'DefendantOrganisation') {
          return rejectAllSmallClaimsCarm.citizenDefendantResponseCarmOrganisation(totalClaimAmount);
        } else if (partyType === 'SoleTraderVCompany') {
          return rejectAllSmallClaimsCarm.LrDefendantResponseCarmCompany(totalClaimAmount);
        }
    }
  },
};
