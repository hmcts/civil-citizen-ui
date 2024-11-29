const {toggleFlag} = require('../../commons/toggleFlag');
const createGAApplication = require('../../genralApplication/createGAApplication');
const responseApplicationSummary = require('../../genralApplication/responseApplicationSummary');
const config = require('../../../config');
const RespondentResponse = require("../../genralApplication/respondentResponse");

Feature('Lip V Lip vary judgement with consent @galip').tag('@e2e');

Scenario('Defendant creates GA Application vary judgement with consent @varyjudgement', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    toggleFlag('cuiReleaseTwoEnabled', true);
    toggleFlag('GaForLips', true);
    const claimID = 1732877831207299;
    const appId = 1732878113661799;
    createGAApplication.start(claimID);
    createGAApplication.selectApplicationType('Ask to vary a judgment');
    createGAApplication.selectAgreementFromOtherParty('Yes');
    createGAApplication.applicationCosts(claimID, 'Vary a judgment', 'To apply to vary a judgment, the application fee is £14.');
    createGAApplication.uploadN245Form(claimID)
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
    createGAApplication.verifyPaymentSuccessfullPage();
    RespondentResponse.acceptDefendantOffer(claimID, appId, 'No', 'instalments')
    RespondentResponse.wantToUploadDocuments(claimID, appId, 'No');
    RespondentResponse.hearingPreference(claimID, appId);
    RespondentResponse.hearingArrangement(claimID, appId, 'In person at the court');
    RespondentResponse.hearingContactDetails(claimID, appId);
    RespondentResponse.unavailableDates(claimID, appId);
    RespondentResponse.hearingSupport(claimID, appId);
    RespondentResponse.submitApplication(claimID, appId);
    RespondentResponse.confirmationPage(claimID, appId);
    responseApplicationSummary.viewApplicantApplicationSummary(claimID, appId, 'Application submitted - Awaiting Judicial decision');
    toggleFlag('cuiReleaseTwoEnabled', false);
    toggleFlag('GaForLips', false);
  }
})
