const config = require('../../../../config');

const admitAllDefendantResponse = require('./admitAllDefendantResponse.js');
const partAdmitDefendantResponse = require('./partAdmitDefendantResponse.js');
const rejectAllDefendantResponse = require('./rejectAllDefendantResponse.js');

module.exports = {
  createDefendantResponse: (totalClaimAmount, responseType) => {
    if (responseType === config.defenceType.rejectAllDisputeAllWithIndividual) {
      return rejectAllDefendantResponse.rejectAllDisputeAllWithIndividual(totalClaimAmount);
    } else if (responseType === config.defenceType.admitAllPayImmediateWithIndividual) {
      return admitAllDefendantResponse.admitAllPayImmediateWithIndividual(totalClaimAmount);
    } else if (responseType === config.defenceType.admitAllPayBySetDateWithIndividual) {
      return admitAllDefendantResponse.admitAllPayBySetDateWithIndividual(totalClaimAmount);
    } else if (responseType === config.defenceType.admitAllPayByInstallmentWithIndividual){
      return admitAllDefendantResponse.admitAllPayByInstallmentWithIndividual(totalClaimAmount);
    } else if (responseType === config.defenceType.partAdmitAmountPaidWithIndividual) {
      return partAdmitDefendantResponse.partAdmitAmountPaidWithIndividual(totalClaimAmount);
    } else if (responseType === config.defenceType.partAdmitHaventPaidPartiallyWantsToPayImmediatelyWithIndividual) {
      partAdmitDefendantResponse.partAdmitHaventPaidPartiallyWantsToPayImmediatelyWithIndividual(totalClaimAmount);
    } else if (responseType === config.defenceType.partAdmitWithPartPaymentOnSpecificDateWithIndividual) {
      return partAdmitDefendantResponse.partAdmitWithPartPaymentOnSpecificDateWithIndividual(totalClaimAmount);
    } else if (responseType === config.defenceType.partAdmitWithPartPaymentAsPerInstallmentPlanWithIndividual) {
      return partAdmitDefendantResponse.partAdmitWithPartPaymentAsPerInstallmentPlanWithIndividual(totalClaimAmount);
    }
  },
};
