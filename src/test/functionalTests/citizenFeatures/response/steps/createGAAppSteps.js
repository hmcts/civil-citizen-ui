const I = actor();
const StringUtilsComponent = require('../../caseProgression/util/StringUtilsComponent');
const GovPay = require ('../../common/govPay');
const ApplicationType = require('../../GA/pages/applicationType');
const AgreementFromOtherParty= require('../../GA/pages/agreementFromOtherParty');
const InformOtherParties = require('../../GA/pages/informOtherParties');
const ApplicationCosts = require('../../GA/pages/applicationCosts');
const ClaimApplicationCost = require('../../GA/pages/claimApplicationCost');
const OrderJudge = require('../../GA/pages/orderJudge');
const RequestingReason = require('../../GA/pages/requestingReason');
const AddAnotherApplication= require('../../GA/pages/addAnotherApplication');
const WantToUploadDocuments = require('../../GA/pages/wantToUploadDocuments');
const HearingArrangementsGuidance = require('../../GA/pages/hearingArrangementsGuidance');
const HearingArrangement = require('../../GA/pages/hearingArrangement');
const HearingContactDetails = require('../../GA/pages/hearingContactDetails');
const UnavailableDates = require('../../GA/pages/unavailableDates');
const HearingSupport = require('../../GA/pages/hearingSupport');
const PayingForApplication = require('../../GA/pages/payingForApplication');
const CheckAndSend= require('../../GA/pages/checkAndSend');
const SubmitGAConfirmation = require('../../GA/pages/submitGAConfirmation');
const ApplyHelpFeeSelection = require('../../GA/pages/applyHelpFeeSelection');
const govPay = new GovPay();

const feeAmountForAskingMoreTime = 119;
const applicationTypePage = new ApplicationType();
const agreementFromOtherPartyPage = new AgreementFromOtherParty();
const informOtherPartiesPage = new InformOtherParties();
const applicationCostsPage = new ApplicationCosts();
const claimApplicationCostPage = new ClaimApplicationCost();
const orderJudgePage = new OrderJudge();
const requestingReasonPage = new RequestingReason();
const addAnotherApplicationPage =  new AddAnotherApplication();
const wantToUploadDocumentsPage = new WantToUploadDocuments();
const hearingArrangementsGuidancePage = new HearingArrangementsGuidance();
const hearingArrangementPage = new HearingArrangement();
const hearingContactDetailsPage = new HearingContactDetails();
const unavailableDatesPage = new UnavailableDates();
const hearingSupportPage = new HearingSupport();
const payingForApplicationPage = new PayingForApplication();
const checkAndSendPage = new CheckAndSend();
const submitGAConfirmationPage = new SubmitGAConfirmation();
const applyHelpFeeSelectionPage = new ApplyHelpFeeSelection();

class createGAAppSteps {

  async askForMoreTimeCourtOrderGA(caseRef, parties, informOtherParty = false) {
    const caseNumber = StringUtilsComponent.StringUtilsComponent.formatClaimReferenceToAUIDisplayFormat(caseRef);
    await I.waitForContent('Contact the court to request a change to my case', 60);
    await I.click('Contact the court to request a change to my case');
    await I.amOnPage(`case/${caseRef}/general-application/application-type`);
    await applicationTypePage.verifyPageContent();
    await applicationTypePage.nextAction('Ask for more time to do what is required by a court order');
    await applicationTypePage.nextAction('Continue');

    if (informOtherParty) {
      await agreementFromOtherPartyPage.verifyPageContent();
      await agreementFromOtherPartyPage.nextAction('Yes');
      await agreementFromOtherPartyPage.nextAction('Continue');
    } else {
      await agreementFromOtherPartyPage.verifyPageContent();
      await agreementFromOtherPartyPage.nextAction('No');
      await agreementFromOtherPartyPage.nextAction('Continue');

      await informOtherPartiesPage.verifyPageContent();
      await informOtherPartiesPage.selectAndVerifyDontInformOption();
    }

    await applicationCostsPage.verifyPageContent();
    await applicationCostsPage.nextAction('Start now');

    await claimApplicationCostPage.verifyPageContent();
    await claimApplicationCostPage.selectAndVerifyYesOption();
    await claimApplicationCostPage.nextAction('Continue');

    await orderJudgePage.verifyPageContent();
    await orderJudgePage.fillTextBox('Test order');
    await orderJudgePage.nextAction('Continue');

    await requestingReasonPage.verifyPageContent();
    await requestingReasonPage.fillTextBox('Test order');
    await requestingReasonPage.nextAction('Continue');

    await addAnotherApplicationPage.verifyPageContent();
    await addAnotherApplicationPage.nextAction('No');
    await addAnotherApplicationPage.nextAction('Continue');

    await wantToUploadDocumentsPage.verifyPageContent();
    await wantToUploadDocumentsPage.nextAction('No');
    await wantToUploadDocumentsPage.nextAction('Continue');

    await hearingArrangementsGuidancePage.verifyPageContent();
    await hearingArrangementsGuidancePage.nextAction('Continue');

    await hearingArrangementPage.verifyPageContent();
    await hearingArrangementPage.nextAction('In person at the court');
    await hearingArrangementPage.fillTextAndSelectLocation('In person', 'Birmingham Civil and Family Justice Centre - Priory Courts, 33 Bull Street - B4 6DS');
    await hearingArrangementPage.nextAction('Continue');

    await hearingContactDetailsPage.verifyPageContent();
    await hearingContactDetailsPage.fillContactDetails('07555655326', 'test@gmail.com');
    await hearingContactDetailsPage.nextAction('Continue');

    await unavailableDatesPage.verifyPageContent();
    await unavailableDatesPage.nextAction('Continue');

    await hearingSupportPage.verifyPageContent();
    await hearingSupportPage.nextAction('Continue');

    await payingForApplicationPage.checkPageFullyLoaded();
    await payingForApplicationPage.nextAction('Continue');

    await checkAndSendPage.verifyPageContent(caseNumber, parties, 'More time to do what is required by a court order');
    await checkAndSendPage.checkAndSign();
    await checkAndSendPage.nextAction('Submit');

    await submitGAConfirmationPage.verifyPageContent();
    await submitGAConfirmationPage.nextAction('Pay application fee');

    I.wait(5);

    await applyHelpFeeSelectionPage.verifyPageContent();
    await applyHelpFeeSelectionPage.nextAction('No');
    await applyHelpFeeSelectionPage.nextAction('Continue');

    await govPay.addValidCardDetails(feeAmountForAskingMoreTime);
    govPay.confirmPayment();
  }
}

module.exports = new createGAAppSteps();
