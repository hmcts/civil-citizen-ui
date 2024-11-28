const {toggleFlag} = require('../../commons/toggleFlag');
const createGAApplication = require('../../genralApplication/createGAApplication');
const responseApplicationSummary = require('../../genralApplication/responseApplicationSummary');
const config = require('../../../config');
Feature('Lip V Lip other without notice @galip').tag('@e2e');

Scenario('Claimant creates GA Application with application other without notice @other', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    toggleFlag('cuiReleaseTwoEnabled', true);
    toggleFlag('GaForLips', true);
    const claimID = 1732807433479616;
    const appId = 1732808403908337;
    createGAApplication.start(claimID);
    createGAApplication.selectApplicationType('Other applications', 'Ask the court to do something that\'s not on this list');
    createGAApplication.selectAgreementFromOtherParty('No');
    createGAApplication.InformOtherParties('No');
    createGAApplication.applicationCosts(claimID, 'Court to do something that\'s not on this list', 'To apply to the court to do something else, the application fee is £108');
    createGAApplication.claimCosts(claimID, 'Yes');
    createGAApplication.orderJudge(claimID, 'Amend a case for judgement.');
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
    createGAApplication.verifyPaymentSuccessfullPage(claimID, appId);
    responseApplicationSummary.viewApplicantApplicationSummary(claimID, appId, 'Listing for a hearing');
    toggleFlag('cuiReleaseTwoEnabled', false);
    toggleFlag('GaForLips', false);
  }
})
