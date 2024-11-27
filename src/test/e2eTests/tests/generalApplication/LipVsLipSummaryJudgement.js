const {toggleFlag} = require('../../commons/toggleFlag');
const createGAApplication = require('../../genralApplication/createGAApplication');
const responseApplicationSummary = require('../../genralApplication/responseApplicationSummary');
const config = require('../../../config');

Feature('Lip V Lip summary judgment without notice @galip').tag('@e2e');

Scenario('Claimant creates GA Application with application summary judgment without notice @judgement', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    toggleFlag('cuiReleaseTwoEnabled', true);
    toggleFlag('GaForLips', true);
    const claimID = 1732712467640408;
    const appId = 1732714012136296;
    createGAApplication.start(claimID);
    createGAApplication.selectApplicationType('Other applications', 'Ask the court to make a summary judgment on a case');
    createGAApplication.selectAgreementFromOtherParty('No');
    createGAApplication.InformOtherParties('No');
    createGAApplication.applicationCosts(claimID, 'Court to make a summary judgment on a case', 'To apply to the court to make a summary judgment, the application fee is £108');
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
    createGAApplication.payYourApplicationFee(claimID, 108);
    createGAApplication.checkAndSend(claimID);
    createGAApplication.submitConfirmation(claimID, 108);
    createGAApplication.selectFeeType(claimID);
    createGAApplication.verifyPaymentSuccessfullPage();
    responseApplicationSummary.viewApplicantApplicationSummary(claimID, appId, 'Application dismissed');
    toggleFlag('cuiReleaseTwoEnabled', false);
    toggleFlag('GaForLips', false);
  }
})
