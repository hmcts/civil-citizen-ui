const {toggleFlag} = require('../../commons/toggleFlag');
const createGAApplication = require('../../genralApplication/createGAApplication');
const config = require("../../../config");

Feature('Claimant GA Application @vjrtest').tag('@e2e');

Scenario('Claimant GA Application with vary order consent ', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    toggleFlag('cuiReleaseTwoEnabled', true);
    toggleFlag('GA_FOR_LIPS', true);
    const claimID = 1730984188221535;
    const appId = 1731322828021511;
    createGAApplication.start(claimID);
    createGAApplication.selectApplicationType('Ask the court to reconsider an order');
    createGAApplication.selectAgreementFromOtherParty('Yes');
    createGAApplication.applicationCosts(claimID, 'Reconsider an order', 'To apply to reconsider an order, the application fee is £14');
    createGAApplication.claimCosts(claimID, 'Yes');
    createGAApplication.orderJudge(claimID);
    createGAApplication.requestingReason(claimID);
    createGAApplication.addAnotherApp(claimID, 'No');
    createGAApplication.wantToUploadDocs(claimID, 'No');
    createGAApplication.hearingArrangementsInfo(claimID);
    createGAApplication.hearingArrangements(claimID, 'In person at the court');
    createGAApplication.hearingContactDetails(claimID);
    createGAApplication.unavailableDates(claimID);
    createGAApplication.hearingSupport(claimID);
    createGAApplication.payYourApplicationFee(claimID, 14);
    createGAApplication.checkAndSend(claimID);
    createGAApplication.submitConfirmation(claimID, 14);
    createGAApplication.selectFeeType(claimID);
    createGAApplication.verifyPaymentSuccessfullPage(claimID, appId);
  }
})
