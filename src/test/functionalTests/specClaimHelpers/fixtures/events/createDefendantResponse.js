const config = require('../../../../config');

const admitAllDefendantResponse = require('./admitAllDefendantResponse.js');
const partAdmitDefendantResponse = require('./partAdmitDefendantResponse.js');
const rejectAllDefendantResponse = require('./rejectAllDefendantResponse.js');

module.exports = {
  createDefendantResponse: (totalClaimAmount, responseType) => {
    if (responseType === config.defenceType.rejectAllDisputeAllWithIndividual) {
      rejectAllDefendantResponse.rejectAllDisputeAllWithIndividual(totalClaimAmount);
    } else if (responseType === config.defenceType.admitAllPayImmediateWithIndividual) {
      admitAllDefendantResponse.admitAllPayImmediateWithIndividual(totalClaimAmount);
    } else if (responseType === config.defenceType.admitAllPayBySetDateWithIndividual) {
      admitAllDefendantResponse.admitAllPayBySetDateWithIndividual(totalClaimAmount);
    } else if (responseType === config.defenceType.admitAllPayByInstallmentWithIndividual){
      admitAllDefendantResponse.admitAllPayByInstallmentWithIndividual(totalClaimAmount);
    } else if (responseType === config.defenceType.partAdmitAmountPaidWithIndividual) {
      partAdmitDefendantResponse.partAdmitAmountPaidWithIndividual(totalClaimAmount);
    } else if (responseType === config.defenceType.partAdmitHaventPaidPartiallyWantsToPayImmediatelyWithIndividual) {
      partAdmitDefendantResponse.partAdmitHaventPaidPartiallyWantsToPayImmediatelyWithIndividual(totalClaimAmount);
    } else if (responseType === config.defenceType.partAdmitWithPartPaymentOnSpecificDateWithIndividual) {
      partAdmitDefendantResponse.partAdmitWithPartPaymentOnSpecificDateWithIndividual(totalClaimAmount);
    } else if (responseType === config.defenceType.partAdmitWithPartPaymentAsPerInstallmentPlanWithIndividual) {
      partAdmitDefendantResponse.partAdmitWithPartPaymentAsPerInstallmentPlanWithIndividual(totalClaimAmount); 
    }
  },
};
