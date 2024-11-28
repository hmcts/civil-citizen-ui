const {toggleFlag} = require('../../commons/toggleFlag');
const createGAApplication = require('../../genralApplication/createGAApplication');
const responseApplicationSummary = require('../../genralApplication/responseApplicationSummary');
const config = require('../../../config');
const responseFromCourt = require("../../genralApplication/responseFromCourt");
const requestMoreInformation = require("../../genralApplication/requestMoreInformation");
Feature('Lip V Lip Amend a statement without notice @galip').tag('@e2e');

Scenario('Claimant creates GA Application with application amend a statement without notice @summary', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    toggleFlag('cuiReleaseTwoEnabled', true);
    toggleFlag('GaForLips', true);
    const claimID = 1732788917671276;
    const appId = 1732790247094419;
    createGAApplication.start(claimID);
    createGAApplication.selectApplicationType('Other applications', 'Ask to make a change to your claim or defence that you\'ve submitted');
    createGAApplication.selectAgreementFromOtherParty('No');
    createGAApplication.InformOtherParties('No');
    createGAApplication.applicationCosts(claimID, 'Make a change to your claim or defence that you\'ve submitted', 'To apply to make a change to your claim or defence, the application fee is £108.');
    createGAApplication.claimCosts(claimID, 'Yes');
    createGAApplication.orderJudge(claimID, 'Amend a case for judgement.');
    createGAApplication.requestingReason(claimID);
    createGAApplication.addAnotherApp(claimID, 'No');
    createGAApplication.wantToUploadDocs(claimID, 'Yes');
    createGAApplication.uploadDocument(claimID)
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
    responseApplicationSummary.viewApplicantApplicationSummary(claimID, appId, 'Awaiting additional information');
    responseFromCourt.viewApplication(claimID, appId);
    responseFromCourt.checkResponseFromCourtSection('Request for more information', 'Respond to the request');
    requestMoreInformation.respondAdditionalInfo(claimID, appId, 'No');
    requestMoreInformation.cyaPage(claimID, appId);
    requestMoreInformation.verifySucessfullPage();
    toggleFlag('cuiReleaseTwoEnabled', false);
    toggleFlag('GaForLips', false);
  }
})
