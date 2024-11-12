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
const PaymentConfirmation = require('../../GA/pages/paymentGAConfirmation');
const config = require('../../../../config.js');
const govPay = new GovPay();

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
const paymentConfirmationPage = new PaymentConfirmation();

class createGAAppSteps {

  async askCourtToReconsiderAnOrderGA(caseRef, parties, informOtherParty = false) {
    //Vary order
    const caseNumber = StringUtilsComponent.StringUtilsComponent.formatClaimReferenceToAUIDisplayFormat(caseRef);
    const applicationType = 'Reconsider an order';
    const feeAmount = '15';
    await I.waitForContent('Contact the court to request a change to my case', 60);
    await I.click('Contact the court to request a change to my case');
    await I.amOnPage(`case/${caseRef}/general-application/application-type`);
    await applicationTypePage.verifyPageContent();
    await applicationTypePage.nextAction('Ask the court to reconsider an order');
    await applicationTypePage.nextAction('Continue');

    if (informOtherParty) {
      await agreementFromOtherPartyPage.verifyPageContent(applicationType);
      await agreementFromOtherPartyPage.nextAction('Yes');
      await agreementFromOtherPartyPage.nextAction('Continue');
    } else {
      await agreementFromOtherPartyPage.verifyPageContent(applicationType);
      await agreementFromOtherPartyPage.nextAction('No');
      await agreementFromOtherPartyPage.nextAction('Continue');

      await informOtherPartiesPage.verifyPageContent(applicationType);
      await informOtherPartiesPage.selectAndVerifyDontInformOption();
    }

    await applicationCostsPage.verifyPageContent(applicationType, feeAmount);
    await applicationCostsPage.nextAction('Start now');
    
    await claimApplicationCostPage.verifyPageContent(applicationType);
    await claimApplicationCostPage.selectAndVerifyYesOption();
    await claimApplicationCostPage.nextAction('Continue');

    await orderJudgePage.verifyPageContent(applicationType);
    await orderJudgePage.fillTextBox('Test order');
    await orderJudgePage.nextAction('Continue');

    await requestingReasonPage.verifyPageContent(applicationType);
    await requestingReasonPage.fillTextBox('Test order');
    await requestingReasonPage.nextAction('Continue');

    await addAnotherApplicationPage.verifyPageContent(applicationType);
    await addAnotherApplicationPage.nextAction('No');
    await addAnotherApplicationPage.nextAction('Continue');

    await wantToUploadDocumentsPage.verifyPageContent(applicationType);
    await wantToUploadDocumentsPage.nextAction('No');
    await wantToUploadDocumentsPage.nextAction('Continue');

    await hearingArrangementsGuidancePage.verifyPageContent(applicationType);
    await hearingArrangementsGuidancePage.nextAction('Continue');

    await hearingArrangementPage.verifyPageContent(applicationType);
    await hearingArrangementPage.nextAction('In person at the court');
    await hearingArrangementPage.fillTextAndSelectLocation('In person', config.gaCourtToBeSelected);
    await hearingArrangementPage.nextAction('Continue');

    await hearingContactDetailsPage.verifyPageContent(applicationType);
    await hearingContactDetailsPage.fillContactDetails('07555655326', 'test@gmail.com');
    await hearingContactDetailsPage.nextAction('Continue');

    await unavailableDatesPage.verifyPageContent(applicationType);
    await unavailableDatesPage.nextAction('Continue');

    await hearingSupportPage.verifyPageContent(applicationType);
    await hearingSupportPage.nextAction('Continue');

    await payingForApplicationPage.verifyPageContent(applicationType, feeAmount);
    await payingForApplicationPage.nextAction('Continue');

    await checkAndSendPage.verifyPageContent(caseNumber, parties, applicationType);
    await checkAndSendPage.checkAndSign();
    await checkAndSendPage.nextAction('Submit');

    await submitGAConfirmationPage.verifyPageContent(feeAmount);
    await submitGAConfirmationPage.nextAction('Pay application fee');

    I.wait(2);

    await applyHelpFeeSelectionPage.verifyPageContent();
    await applyHelpFeeSelectionPage.nextAction('No');
    await applyHelpFeeSelectionPage.nextAction('Continue');

    await govPay.addValidCardDetails(feeAmount);
    govPay.confirmPayment();

    await paymentConfirmationPage.verifyPageContent();
    await paymentConfirmationPage.nextAction('Close and return to dashboard');
  }

  async askForMoreTimeCourtOrderGA(caseRef, parties, informOtherParty = false) {
    const caseNumber = StringUtilsComponent.StringUtilsComponent.formatClaimReferenceToAUIDisplayFormat(caseRef);
    const applicationType = 'More time to do what is required by a court order';
    const feeAmount = '119';
    await I.waitForContent('Contact the court to request a change to my case', 60);
    await I.click('Contact the court to request a change to my case');
    await I.amOnPage(`case/${caseRef}/general-application/application-type`);
    await applicationTypePage.verifyPageContent();
    await applicationTypePage.nextAction('Ask for more time to do what is required by a court order');
    await applicationTypePage.nextAction('Continue');

    if (informOtherParty) {
      await agreementFromOtherPartyPage.verifyPageContent(applicationType);
      await agreementFromOtherPartyPage.nextAction('Yes');
      await agreementFromOtherPartyPage.nextAction('Continue');
    } else {
      await agreementFromOtherPartyPage.verifyPageContent(applicationType);
      await agreementFromOtherPartyPage.nextAction('No');
      await agreementFromOtherPartyPage.nextAction('Continue');

      await informOtherPartiesPage.verifyPageContent(applicationType);
      await informOtherPartiesPage.selectAndVerifyDontInformOption();
    }

    await applicationCostsPage.verifyPageContent(applicationType, feeAmount);
    await applicationCostsPage.nextAction('Start now');

    await claimApplicationCostPage.verifyPageContent(applicationType);
    await claimApplicationCostPage.selectAndVerifyYesOption();
    await claimApplicationCostPage.nextAction('Continue');

    await orderJudgePage.verifyPageContent(applicationType);
    await orderJudgePage.fillTextBox('Test order');
    await orderJudgePage.nextAction('Continue');

    await requestingReasonPage.verifyPageContent(applicationType);
    await requestingReasonPage.fillTextBox('Test order');
    await requestingReasonPage.nextAction('Continue');

    await addAnotherApplicationPage.verifyPageContent(applicationType);
    await addAnotherApplicationPage.nextAction('No');
    await addAnotherApplicationPage.nextAction('Continue');

    await wantToUploadDocumentsPage.verifyPageContent(applicationType);
    await wantToUploadDocumentsPage.nextAction('No');
    await wantToUploadDocumentsPage.nextAction('Continue');

    await hearingArrangementsGuidancePage.verifyPageContent(applicationType);
    await hearingArrangementsGuidancePage.nextAction('Continue');

    await hearingArrangementPage.verifyPageContent(applicationType);
    await hearingArrangementPage.nextAction('In person at the court');
    await hearingArrangementPage.fillTextAndSelectLocation('In person', config.gaCourtToBeSelected);
    await hearingArrangementPage.nextAction('Continue');

    await hearingContactDetailsPage.verifyPageContent(applicationType);
    await hearingContactDetailsPage.fillContactDetails('07555655326', 'test@gmail.com');
    await hearingContactDetailsPage.nextAction('Continue');

    await unavailableDatesPage.verifyPageContent(applicationType);
    await unavailableDatesPage.nextAction('Continue');

    await hearingSupportPage.verifyPageContent(applicationType);
    await hearingSupportPage.nextAction('Continue');

    await payingForApplicationPage.verifyPageContent(applicationType, feeAmount);
    await payingForApplicationPage.nextAction('Continue');

    await checkAndSendPage.verifyPageContent(caseNumber, parties, applicationType);
    await checkAndSendPage.checkAndSign();
    await checkAndSendPage.nextAction('Submit');

    await submitGAConfirmationPage.verifyPageContent(feeAmount);
    await submitGAConfirmationPage.nextAction('Pay application fee');

    I.wait(2);

    await applyHelpFeeSelectionPage.verifyPageContent();
    await applyHelpFeeSelectionPage.nextAction('No');
    await applyHelpFeeSelectionPage.nextAction('Continue');

    await govPay.addValidCardDetails(feeAmount);
    govPay.confirmPayment();

    await paymentConfirmationPage.verifyPageContent();
    await paymentConfirmationPage.nextAction('Close and return to dashboard');
  }

  async askToChangeHearingDateGA(caseRef, parties, informOtherParty = false) {
    const caseNumber = StringUtilsComponent.StringUtilsComponent.formatClaimReferenceToAUIDisplayFormat(caseRef);
    const applicationType = 'Change a hearing date';
    const feeAmount = '119';
    await I.waitForContent('Contact the court to request a change to my case', 60);
    await I.click('Contact the court to request a change to my case');
    await I.amOnPage(`case/${caseRef}/general-application/application-type`);
    await applicationTypePage.verifyPageContent();
    await applicationTypePage.nextAction('Ask to change a hearing date');
    await applicationTypePage.nextAction('Continue');

    if (informOtherParty) {
      await agreementFromOtherPartyPage.verifyPageContent(applicationType);
      await agreementFromOtherPartyPage.nextAction('Yes');
      await agreementFromOtherPartyPage.nextAction('Continue');
    } else {
      await agreementFromOtherPartyPage.verifyPageContent(applicationType);
      await agreementFromOtherPartyPage.nextAction('No');
      await agreementFromOtherPartyPage.nextAction('Continue');

      await informOtherPartiesPage.verifyPageContent(applicationType);
      await informOtherPartiesPage.selectAndVerifyDontInformOption();
    }

    await applicationCostsPage.verifyPageContent(applicationType, feeAmount);
    await applicationCostsPage.nextAction('Start now');
    
    await claimApplicationCostPage.verifyPageContent(applicationType);
    await claimApplicationCostPage.selectAndVerifyYesOption();
    await claimApplicationCostPage.nextAction('Continue');

    await orderJudgePage.verifyPageContent(applicationType);
    await orderJudgePage.fillTextBox('Test order');
    await orderJudgePage.nextAction('Continue');

    await requestingReasonPage.verifyPageContent(applicationType);
    await requestingReasonPage.fillTextBox('Test order');
    await requestingReasonPage.nextAction('Continue');

    await addAnotherApplicationPage.verifyPageContent(applicationType);
    await addAnotherApplicationPage.nextAction('No');
    await addAnotherApplicationPage.nextAction('Continue');

    await wantToUploadDocumentsPage.verifyPageContent(applicationType);
    await wantToUploadDocumentsPage.nextAction('No');
    await wantToUploadDocumentsPage.nextAction('Continue');

    await hearingArrangementsGuidancePage.verifyPageContent(applicationType);
    await hearingArrangementsGuidancePage.nextAction('Continue');

    await hearingArrangementPage.verifyPageContent(applicationType);
    await hearingArrangementPage.nextAction('In person at the court');
    await hearingArrangementPage.fillTextAndSelectLocation('In person', config.gaCourtToBeSelected);
    await hearingArrangementPage.nextAction('Continue');

    await hearingContactDetailsPage.verifyPageContent(applicationType);
    await hearingContactDetailsPage.fillContactDetails('07555655326', 'test@gmail.com');
    await hearingContactDetailsPage.nextAction('Continue');

    await unavailableDatesPage.verifyPageContent(applicationType);
    await unavailableDatesPage.nextAction('Continue');

    await hearingSupportPage.verifyPageContent(applicationType);
    await hearingSupportPage.nextAction('Continue');

    await payingForApplicationPage.verifyPageContent(applicationType, feeAmount);
    await payingForApplicationPage.nextAction('Continue');

    await checkAndSendPage.verifyPageContent(caseNumber, parties, applicationType);
    await checkAndSendPage.checkAndSign();
    await checkAndSendPage.nextAction('Submit');

    await submitGAConfirmationPage.verifyPageContent(feeAmount);
    await submitGAConfirmationPage.nextAction('Pay application fee');

    I.wait(2);

    await applyHelpFeeSelectionPage.verifyPageContent();
    await applyHelpFeeSelectionPage.nextAction('No');
    await applyHelpFeeSelectionPage.nextAction('Continue');

    await govPay.addValidCardDetails(feeAmount);
    govPay.confirmPayment();

    await paymentConfirmationPage.verifyPageContent();
    await paymentConfirmationPage.nextAction('Close and return to dashboard');
  }

  async askForReliefFromAPenaltyGA(caseRef, parties, informOtherParty = false) {
    //Relief from sanctions
    const caseNumber = StringUtilsComponent.StringUtilsComponent.formatClaimReferenceToAUIDisplayFormat(caseRef);
    const applicationType = 'Relief from a penalty you\'ve been given by the court';
    const feeAmount = '119';
    await I.waitForContent('Contact the court to request a change to my case', 60);
    await I.click('Contact the court to request a change to my case');
    await I.amOnPage(`case/${caseRef}/general-application/application-type`);
    await applicationTypePage.verifyPageContent();
    await applicationTypePage.nextAction('Ask for relief from a penalty you\'ve been given by the court');
    await applicationTypePage.nextAction('Continue');

    if (informOtherParty) {
      await agreementFromOtherPartyPage.verifyPageContent(applicationType);
      await agreementFromOtherPartyPage.nextAction('Yes');
      await agreementFromOtherPartyPage.nextAction('Continue');
    } else {
      await agreementFromOtherPartyPage.verifyPageContent(applicationType);
      await agreementFromOtherPartyPage.nextAction('No');
      await agreementFromOtherPartyPage.nextAction('Continue');

      await informOtherPartiesPage.verifyPageContent(applicationType);
      await informOtherPartiesPage.selectAndVerifyDontInformOption();
    }

    await applicationCostsPage.verifyPageContent(applicationType, feeAmount);
    await applicationCostsPage.nextAction('Start now');
    
    await claimApplicationCostPage.verifyPageContent(applicationType);
    await claimApplicationCostPage.selectAndVerifyYesOption();
    await claimApplicationCostPage.nextAction('Continue');

    await orderJudgePage.verifyPageContent(applicationType);
    await orderJudgePage.fillTextBox('Test order');
    await orderJudgePage.nextAction('Continue');

    await requestingReasonPage.verifyPageContent(applicationType);
    await requestingReasonPage.fillTextBox('Test order');
    await requestingReasonPage.nextAction('Continue');

    await addAnotherApplicationPage.verifyPageContent(applicationType);
    await addAnotherApplicationPage.nextAction('No');
    await addAnotherApplicationPage.nextAction('Continue');

    await wantToUploadDocumentsPage.verifyPageContent(applicationType);
    await wantToUploadDocumentsPage.nextAction('No');
    await wantToUploadDocumentsPage.nextAction('Continue');

    await hearingArrangementsGuidancePage.verifyPageContent(applicationType);
    await hearingArrangementsGuidancePage.nextAction('Continue');

    await hearingArrangementPage.verifyPageContent(applicationType);
    await hearingArrangementPage.nextAction('In person at the court');
    await hearingArrangementPage.fillTextAndSelectLocation('In person', config.gaCourtToBeSelected);
    await hearingArrangementPage.nextAction('Continue');

    await hearingContactDetailsPage.verifyPageContent(applicationType);
    await hearingContactDetailsPage.fillContactDetails('07555655326', 'test@gmail.com');
    await hearingContactDetailsPage.nextAction('Continue');

    await unavailableDatesPage.verifyPageContent(applicationType);
    await unavailableDatesPage.nextAction('Continue');

    await hearingSupportPage.verifyPageContent(applicationType);
    await hearingSupportPage.nextAction('Continue');

    await payingForApplicationPage.verifyPageContent(applicationType, feeAmount);
    await payingForApplicationPage.nextAction('Continue');

    await checkAndSendPage.verifyPageContent(caseNumber, parties, applicationType);
    await checkAndSendPage.checkAndSign();
    await checkAndSendPage.nextAction('Submit');

    //fee amount
    await submitGAConfirmationPage.verifyPageContent(feeAmount);
    await submitGAConfirmationPage.nextAction('Pay application fee');

    I.wait(2);

    await applyHelpFeeSelectionPage.verifyPageContent();
    await applyHelpFeeSelectionPage.nextAction('No');
    await applyHelpFeeSelectionPage.nextAction('Continue');

    await govPay.addValidCardDetails(feeAmount);
    govPay.confirmPayment();

    await paymentConfirmationPage.verifyPageContent();
    await paymentConfirmationPage.nextAction('Close and return to dashboard');
  }
}

module.exports = new createGAAppSteps();
