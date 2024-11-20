const {toggleFlag} = require('../../commons/toggleFlag');
const createGAApplication = require('../../genralApplication/createGAApplication');
const RespondentResponse = require('../../genralApplication/respondentResponse');
const responseApplicationSummary = require('../../genralApplication/responseApplicationSummary');
const config = require('../../../config');

Feature('Lip V Lip Extend Time @vjrtest').tag('@e2e');

Scenario('Claimant GA Application and respond to response with extend time consent ', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {

    toggleFlag('cuiReleaseTwoEnabled', true);
    toggleFlag('GaForLips', true);
    const claimID = 1732014426677369;
    const appId = 1732106154804395;
    createGAApplication.start(claimID);
    createGAApplication.selectApplicationType('Ask for more time to do what is required by a court order');
    createGAApplication.selectAgreementFromOtherParty('Yes');
    createGAApplication.applicationCosts(claimID, 'More time to do what is required by a court order', 'To apply to extend time, the application fee is £108');
    createGAApplication.claimCosts(claimID, 'Yes');
    createGAApplication.orderJudge(claimID, 'The time by which I must [specify what needs to be done] be extended to [enter the date you can do this by].');
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
    createGAApplication.submitConfirmation(claimID);
    createGAApplication.selectFeeType(claimID, appId, 108);
    createGAApplication.verifyPaymentSuccessfullPage();
    RespondentResponse.agreeToOrder('Yes', 'Respond to an application to more time to do what is required by a court order', claimID, appId);
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
    toggleFlag('GaForLips', false);
  }
});

AfterSuite(async () => {
  await createGAApplication.resetWiremockScenario();
});

