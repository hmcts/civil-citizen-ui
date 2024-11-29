const {toggleFlag} = require('../../commons/toggleFlag');
const createGAApplication = require('../../genralApplication/createGAApplication');
const RespondentResponse = require('../../genralApplication/respondentResponse');
const responseApplicationSummary = require('../../genralApplication/responseApplicationSummary');
const config = require('../../../config');

Feature('Lip V Lip Vary Order Consent @galip').tag('@e2e');

Scenario('Claimant GA Application and respond to response with vary order consent ', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {

    toggleFlag('cuiReleaseTwoEnabled', true);
    toggleFlag('GaForLips', true);
    const claimID = 1730984188221535;
    const appId = 1731322828021511;
    createGAApplication.start(claimID);
    createGAApplication.selectApplicationType('Ask the court to reconsider an order');
    createGAApplication.selectAgreementFromOtherParty('Yes');
    createGAApplication.applicationCosts(claimID, 'Reconsider an order', 'To apply to reconsider an order, the application fee is £14');
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
    createGAApplication.payYourApplicationFee(claimID, 14);
    createGAApplication.checkAndSend(claimID);
    createGAApplication.submitConfirmation(claimID, 14);
    createGAApplication.selectFeeType(claimID);
    createGAApplication.verifyPaymentSuccessfullPage(claimID, appId);
    RespondentResponse.agreeToOrder('Yes', 'Respond to an application to reconsider an order', claimID, appId);
    RespondentResponse.wantToUploadDocuments(claimID, appId, 'No');
    RespondentResponse.hearingPreference(claimID, appId);
    RespondentResponse.hearingArrangement(claimID, appId, 'In person at the court');
    RespondentResponse.hearingContactDetails(claimID, appId);
    RespondentResponse.unavailableDates(claimID, appId);
    RespondentResponse.hearingSupport(claimID, appId);
    RespondentResponse.submitApplication(claimID, appId);
    RespondentResponse.confirmationPage(claimID, appId);
    responseApplicationSummary.viewResponseApplicationSummary(claimID, appId, 'Application submitted - Awaiting Judicial decision');
    toggleFlag('cuiReleaseTwoEnabled', false);
    toggleFlag('GaForLips', false);
  }
});

AfterSuite(async () => {
  await createGAApplication.resetWiremockScenario();
});
