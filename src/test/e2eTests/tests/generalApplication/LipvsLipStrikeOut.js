const {toggleFlag} = require('../../commons/toggleFlag');
const createGAApplication = require('../../genralApplication/createGAApplication');
const RespondentResponse = require('../../genralApplication/respondentResponse');
const responseFromCourt = require('../../genralApplication/responseFromCourt');
const config = require('../../../config');

Feature('Lip V Lip Strike Out Without Notice @galip').tag('@e2e');

Scenario('Claimant GA Application and respond to response for strike out without notice to notice ', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {

    toggleFlag('cuiReleaseTwoEnabled', true);
    toggleFlag('GaForLips', true);
    const claimID = 1732192997720139;
    const appId = 1732194111758649;
    createGAApplication.start(claimID);
    createGAApplication.selectApplicationType('Other applications', 'Ask the court to strike out all or part of the other parties\' case without a trial');
    createGAApplication.selectAgreementFromOtherParty('No');
    createGAApplication.InformOtherParties('No');
    createGAApplication.applicationCosts(claimID, 'Court to strike out all or part of the other parties\' case without a trial', 'To apply to the court to strike out all or part of the other parties’ case, the application fee is £108');
    createGAApplication.claimCosts(claimID, 'Yes');
    createGAApplication.orderJudge(claimID, 'strike out the application');
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
    responseFromCourt.viewApplication(claimID, appId);
    responseFromCourt.checkResponseFromCourtSection('Direction to make the application with notice', 'Pay the additional fee');
    responseFromCourt.additionalFeePage(275);
    responseFromCourt.feeSelectionPage('No');
    responseFromCourt.verifyPaymentSuccessfullPage();
    RespondentResponse.respondentAgreement(claimID, appId, 'Respond to an application to court to strike out all or part of the other parties\' case without a trial', 'Yes');
    RespondentResponse.wantToUploadDocuments(claimID, appId, 'No');
    RespondentResponse.hearingPreference(claimID, appId);
    RespondentResponse.hearingArrangement(claimID, appId, 'In person at the court');
    RespondentResponse.hearingContactDetails(claimID, appId);
    RespondentResponse.unavailableDates(claimID, appId);
    RespondentResponse.hearingSupport(claimID, appId);
    RespondentResponse.submitApplication(claimID, appId);
    RespondentResponse.confirmationPage(claimID, appId);
    toggleFlag('cuiReleaseTwoEnabled', false);
    toggleFlag('GaForLips', false);
  }
});
AfterSuite(async () => {
  await createGAApplication.resetWiremockScenario();
});
