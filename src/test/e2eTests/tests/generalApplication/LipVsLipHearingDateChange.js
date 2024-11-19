const config = require("../../../config");
const {toggleFlag} = require("../../commons/toggleFlag");
const createGAApplication = require("../../genralApplication/createGAApplication");
const RespondentResponse = require("../../genralApplication/respondentResponse");
const responseApplicationSummary = require("../../genralApplication/responseApplicationSummary");

Feature('Lip V Lip Hearing Date Change').tag('@vjrtest');
Scenario('Claimant GA Application and respond to response with hearing date change without notice', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    toggleFlag('cuiReleaseTwoEnabled', true);
    toggleFlag('GaForLips', true);
    const claimID = 1732014426677369;
    const appId = 1732018301268558;
    createGAApplication.start(claimID);
    createGAApplication.selectApplicationType('Ask to change a hearing date');
    createGAApplication.selectAgreementFromOtherParty('No');
    createGAApplication.InformOtherParties('No');
    createGAApplication.applicationCosts(claimID, 'Change a hearing date', 'To apply to change a hearing date, the application fee is £119');
    createGAApplication.claimCosts(claimID, 'Yes');
    createGAApplication.orderJudge(claimID, 'The hearing arranged for 28-10-2025 be moved to the first available date after 29-10-2025, avoiding 29-10-2025.');
    createGAApplication.requestingReason(claimID);
    createGAApplication.addAnotherApp(claimID, 'No');
    createGAApplication.wantToUploadDocs(claimID, 'No');
    createGAApplication.hearingArrangementsInfo(claimID);
    createGAApplication.hearingArrangements(claimID, 'In person at the court');
    createGAApplication.hearingContactDetails(claimID);
    createGAApplication.unavailableDates(claimID);
    createGAApplication.hearingSupport(claimID);
    createGAApplication.payYourApplicationFee(claimID, 119);
    createGAApplication.checkAndSend(claimID);
    createGAApplication.submitConfirmation(claimID, 119);
    createGAApplication.selectFeeType(claimID);
    createGAApplication.verifyPaymentSuccessfullPage(claimID, appId);
    toggleFlag('cuiReleaseTwoEnabled', true);
    toggleFlag('GaForLips', true);
  }
})
