const {toggleFlag} = require('../../commons/toggleFlag');
const createGAApplication = require('../../genralApplication/createGAApplication');
const RespondentResponse = require('../../genralApplication/respondentResponse');
const responseApplicationSummary = require('../../genralApplication/responseApplicationSummary');
const config = require('../../../config');

Feature('Lip V Lip relief from sanctions with consent').tag('@galip');

Scenario('Claimant GA Application and respond to response with relief from sanctions with consent', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {

    toggleFlag('cuiReleaseTwoEnabled', true);
    toggleFlag('is-dashboard-enabled-for-case', true);
    toggleFlag('GaForLips', true);
    const claimID = 1732551952128739;
    const appId = 1732553590764925;
    createGAApplication.start(claimID);
    createGAApplication.selectApplicationType('Ask for relief from a penalty you\'ve been given by the court');
    createGAApplication.selectAgreementFromOtherParty('Yes');
    createGAApplication.applicationCosts(claimID, 'Relief from a penalty you\'ve been given by the court', 'To apply to ask for relief from a penalty, the application fee is £108');
    createGAApplication.claimCosts(claimID, 'Yes');
    createGAApplication.orderJudge(claimID, 'no mistake done by me to dismiss the claim');
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
    RespondentResponse.agreeToOrder('No', 'Respond to an application to relief from a penalty you\'ve been given by the court', claimID, appId);
    RespondentResponse.respondentAgreement(claimID, appId, 'Respond to an application to relief from a penalty you\'ve been given by the court', 'Yes');
    RespondentResponse.wantToUploadDocuments(claimID, appId, 'No');
    RespondentResponse.hearingPreference(claimID, appId);
    RespondentResponse.hearingArrangement(claimID, appId, 'In person at the court');
    RespondentResponse.hearingContactDetails(claimID, appId);
    RespondentResponse.unavailableDates(claimID, appId);
    RespondentResponse.hearingSupport(claimID, appId);
    RespondentResponse.submitApplication(claimID, appId);
    RespondentResponse.confirmationPage(claimID, appId);
    responseApplicationSummary.viewResponseApplicationSummary(claimID, appId, 'Order made');
    toggleFlag('cuiReleaseTwoEnabled', false);
    toggleFlag('is-dashboard-enabled-for-case', false);
    toggleFlag('GaForLips', false);
  }
});
