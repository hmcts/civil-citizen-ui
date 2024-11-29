const {toggleFlag} = require('../../commons/toggleFlag');
const createGAApplication = require('../../genralApplication/createGAApplication');
const config = require('../../../config');
const RespondentResponse = require('../../genralApplication/respondentResponse');
const responseApplicationSummary = require('../../genralApplication/responseApplicationSummary');

Feature('Lip V Lip settle claim with consent').tag('@galip');
Scenario('Claimant GA Application and respond to response for settle claim with consent ', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    toggleFlag('cuiReleaseTwoEnabled', true);
    toggleFlag('GaForLips', true);
    const claimID = 1732290567986310;
    const appId = 1732292100554027;
    createGAApplication.start(claimID);
    createGAApplication.selectApplicationType('Other applications', 'Ask the court to make an order settling the claim by consent');
    createGAApplication.selectAgreementFromOtherParty('Yes');
    createGAApplication.applicationCosts(claimID, 'Court to make an order settling the claim by consent', 'To apply to the court to make an order settling the claim by consent, the application fee is £108');
    createGAApplication.claimCosts(claimID, 'Yes');
    createGAApplication.orderJudge(claimID, 'settle the claim');
    createGAApplication.requestingReason(claimID);
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
    RespondentResponse.agreeToOrder('Yes', 'Respond to an application to court to make an order settling the claim by consent', claimID, appId);
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
