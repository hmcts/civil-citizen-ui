const I = actor();
const StringUtilsComponent = require('../../caseProgression/util/StringUtilsComponent.js');
const GovPay = require ('../../common/govPay.js');
const ApplicationType = require('../pages/applicationType.js');
const AgreementFromOtherParty= require('../pages/agreementFromOtherParty.js');
const InformOtherParties = require('../pages/informOtherParties.js');
const ApplicationCosts = require('../pages/applicationCosts.js');
const ClaimApplicationCost = require('../pages/claimApplicationCost.js');
const OrderJudge = require('../pages/orderJudge.js');
const RequestingReason = require('../pages/requestingReason.js');
const AddAnotherApplication= require('../pages/addAnotherApplication.js');
const WantToUploadDocuments = require('../pages/wantToUploadDocuments.js');
const HearingArrangementsGuidance = require('../pages/hearingArrangementsGuidance.js');
const HearingArrangement = require('../pages/hearingArrangement.js');
const HearingContactDetails = require('../pages/hearingContactDetails.js');
const UnavailableDatesConfirmation = require('../pages/unavailableDatesConfirmation');
const UnavailableDates = require('../pages/unavailableDates.js');
const HearingSupport = require('../pages/hearingSupport.js');
const PayingForApplication = require('../pages/payingForApplication.js');
const CheckAndSend= require('../pages/checkAndSend.js');
const SubmitGAConfirmation = require('../pages/submitGAConfirmation.js');
const ApplyHelpFeeSelection = require('../pages/applyHelpFeeSelection.js');
const PaymentConfirmation = require('../pages/paymentGAConfirmation.js');
const N245Upload = require('../pages/uploadN245Form.js');
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
const unavailableDatesConfirmationPage = new UnavailableDatesConfirmation();
const unavailableDatesPage = new UnavailableDates();
const hearingSupportPage = new HearingSupport();
const payingForApplicationPage = new PayingForApplication();
const checkAndSendPage = new CheckAndSend();
const submitGAConfirmationPage = new SubmitGAConfirmation();
const applyHelpFeeSelectionPage = new ApplyHelpFeeSelection();
const paymentConfirmationPage = new PaymentConfirmation();
const uploadN245FormPage = new N245Upload();

class createGASteps {

  async askToSetAsideJudgementGA(caseRef, parties, communicationType = 'notice') {
    const caseNumber = StringUtilsComponent.StringUtilsComponent.formatClaimReferenceToAUIDisplayFormat(caseRef);
    const applicationType = 'Set aside (remove) a judgment';

    let feeAmount;

    switch (communicationType) {
      case 'consent':
        feeAmount = '123';
        break;
      case 'notice':
        feeAmount = '313';
        break;
      case 'withoutnotice':
        feeAmount = '123';
        break;
    }

    await I.amOnPage(`case/${caseRef}/general-application/application-type`);
    await applicationTypePage.verifyPageContent();
    await applicationTypePage.nextAction('Ask to set aside');
    await applicationTypePage.nextAction('Continue');

    if (communicationType == 'consent') {
      await agreementFromOtherPartyPage.verifyPageContent(applicationType);
      await agreementFromOtherPartyPage.nextAction('Yes');
      await agreementFromOtherPartyPage.nextAction('Continue');
    } else {
      await agreementFromOtherPartyPage.verifyPageContent(applicationType);
      await agreementFromOtherPartyPage.nextAction('No');
      await agreementFromOtherPartyPage.nextAction('Continue');
      if (communicationType == 'notice') {
        await informOtherPartiesPage.verifyPageContent(applicationType);
        await informOtherPartiesPage.selectAndVerifyDoInformOption();
      } else {
        await informOtherPartiesPage.verifyPageContent(applicationType);
        await informOtherPartiesPage.selectAndVerifyDontInformOption();
      }
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

    await unavailableDatesConfirmationPage.verifyPageContent(applicationType);
    unavailableDatesConfirmationPage.nextAction('Yes');
    unavailableDatesConfirmationPage.nextAction('Continue');

    await unavailableDatesPage.verifyPageContent(applicationType);
    await unavailableDatesPage.fillFields();
    unavailableDatesPage.nextAction('Continue');

    await hearingSupportPage.verifyPageContent(applicationType);
    await hearingSupportPage.nextAction('Continue');

    await payingForApplicationPage.verifyPageContent(applicationType, feeAmount);
    await payingForApplicationPage.nextAction('Continue');

    await checkAndSendPage.verifyPageContent(caseNumber, parties, applicationType, communicationType);
    await checkAndSendPage.checkAndSign();
    await checkAndSendPage.nextAction('Submit');

    await submitGAConfirmationPage.verifyPageContent(feeAmount);
    await submitGAConfirmationPage.nextAction('Pay application fee');

    I.wait(5);

    await applyHelpFeeSelectionPage.confirmActions('No');

    await govPay.addValidCardDetails(feeAmount);
    govPay.confirmPayment();

    const generalApplicationID = (await I.grabCurrentUrl()).match(/\/general-application\/(\d+)\//)[1];

    await paymentConfirmationPage.verifyPageContent();
    await paymentConfirmationPage.nextAction('Close and return to dashboard');

    return generalApplicationID;
  }

  async askToVaryAJudgementGA(caseRef, parties, communicationType = 'notice', defendant = false) {
    //Cannot be withoutnotice
    const caseNumber = StringUtilsComponent.StringUtilsComponent.formatClaimReferenceToAUIDisplayFormat(caseRef);
    const applicationType = 'Vary a judgment';
    const feeAmount = '15';

    await I.amOnPage(`case/${caseRef}/general-application/application-type`);
    await applicationTypePage.verifyPageContent();
    await applicationTypePage.nextAction('Ask to vary a judgment');
    await applicationTypePage.nextAction('Continue');

    if (communicationType == 'consent') {
      await agreementFromOtherPartyPage.verifyPageContent(applicationType);
      await agreementFromOtherPartyPage.nextAction('Yes');
      await agreementFromOtherPartyPage.nextAction('Continue');
    } else {
      await agreementFromOtherPartyPage.verifyPageContent(applicationType);
      await agreementFromOtherPartyPage.nextAction('No');
      await agreementFromOtherPartyPage.nextAction('Continue');
    }

    await applicationCostsPage.verifyPageContent(applicationType, feeAmount);
    await applicationCostsPage.nextAction('Start now');

    if (defendant) {
      await uploadN245FormPage.verifyPageContent(applicationType);
      await uploadN245FormPage.uploadN245();
      await uploadN245FormPage.nextAction('Continue');
    } else {
      await claimApplicationCostPage.verifyPageContent(applicationType);
      await claimApplicationCostPage.selectAndVerifyYesOption();
      await claimApplicationCostPage.nextAction('Continue');
    }

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

    await unavailableDatesConfirmationPage.verifyPageContent(applicationType);
    unavailableDatesConfirmationPage.nextAction('Yes');
    unavailableDatesConfirmationPage.nextAction('Continue');

    await unavailableDatesPage.verifyPageContent(applicationType);
    unavailableDatesPage.fillFields();
    unavailableDatesPage.nextAction('Continue');

    await hearingSupportPage.verifyPageContent(applicationType);
    await hearingSupportPage.nextAction('Continue');

    await payingForApplicationPage.verifyPageContent(applicationType, feeAmount);
    await payingForApplicationPage.nextAction('Continue');

    await checkAndSendPage.verifyPageContent(caseNumber, parties, applicationType, communicationType);
    await checkAndSendPage.checkAndSign();
    await checkAndSendPage.nextAction('Submit');

    await submitGAConfirmationPage.verifyPageContent(feeAmount);
    await submitGAConfirmationPage.nextAction('Pay application fee');

    I.wait(2);

    await applyHelpFeeSelectionPage.confirmActions('No');

    await govPay.addValidCardDetails(feeAmount);
    govPay.confirmPayment();

    const generalApplicationID = (await I.grabCurrentUrl()).match(/\/general-application\/(\d+)\//)[1];

    await paymentConfirmationPage.verifyPageContent();
    await paymentConfirmationPage.nextAction('Close and return to dashboard');

    return generalApplicationID;
  }

  async askCourtToReconsiderAnOrderGA(caseRef, parties, communicationType = 'withoutnotice') {
    //Communication types are, consent, notice, withoutnotice (default is withoutnotice)
    //Vary order
    const caseNumber = StringUtilsComponent.StringUtilsComponent.formatClaimReferenceToAUIDisplayFormat(caseRef);
    const applicationType = 'Reconsider an order';

    let feeAmount;

    switch (communicationType) {
      case 'consent':
        feeAmount = '123';
        break;
      case 'notice':
        feeAmount = '313';
        break;
      case 'withoutnotice':
        feeAmount = '123';
        break;
    }

    await I.amOnPage(`case/${caseRef}/general-application/application-type`);
    await applicationTypePage.verifyPageContent();
    await applicationTypePage.nextAction('Ask the court to reconsider an order');
    await applicationTypePage.nextAction('Continue');

    if (communicationType == 'consent') {
      await agreementFromOtherPartyPage.verifyPageContent(applicationType);
      await agreementFromOtherPartyPage.nextAction('Yes');
      await agreementFromOtherPartyPage.nextAction('Continue');
    } else {
      await agreementFromOtherPartyPage.verifyPageContent(applicationType);
      await agreementFromOtherPartyPage.nextAction('No');
      await agreementFromOtherPartyPage.nextAction('Continue');
      if (communicationType == 'notice') {
        await informOtherPartiesPage.verifyPageContent(applicationType);
        await informOtherPartiesPage.selectAndVerifyDoInformOption();
      } else {
        await informOtherPartiesPage.verifyPageContent(applicationType);
        await informOtherPartiesPage.selectAndVerifyDontInformOption();
      }
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

    await unavailableDatesConfirmationPage.verifyPageContent(applicationType);
    unavailableDatesConfirmationPage.nextAction('Yes');
    unavailableDatesConfirmationPage.nextAction('Continue');

    await unavailableDatesPage.verifyPageContent(applicationType);
    unavailableDatesPage.fillFields();
    unavailableDatesPage.nextAction('Continue');

    await hearingSupportPage.verifyPageContent(applicationType);
    await hearingSupportPage.nextAction('Continue');

    await payingForApplicationPage.verifyPageContent(applicationType, feeAmount);
    await payingForApplicationPage.nextAction('Continue');

    await checkAndSendPage.verifyPageContent(caseNumber, parties, applicationType, communicationType);
    await checkAndSendPage.checkAndSign();
    await checkAndSendPage.nextAction('Submit');

    await submitGAConfirmationPage.verifyPageContent(feeAmount);
    await submitGAConfirmationPage.nextAction('Pay application fee');

    I.wait(2);

    await applyHelpFeeSelectionPage.confirmActions('No');

    await govPay.addValidCardDetails(feeAmount);
    govPay.confirmPayment();

    const generalApplicationID = (await I.grabCurrentUrl()).match(/\/general-application\/(\d+)\//)[1];

    await paymentConfirmationPage.verifyPageContent();
    await paymentConfirmationPage.nextAction('Close and return to dashboard');

    return generalApplicationID;
  }

  async askToChangeHearingDateGA(caseRef, parties, communicationType = 'withoutnotice') {
    // Adjourn a hearing
    const caseNumber = StringUtilsComponent.StringUtilsComponent.formatClaimReferenceToAUIDisplayFormat(caseRef);
    const applicationType = 'Change a hearing date';
    let feeAmount;

    switch (communicationType) {
      case 'consent':
        feeAmount = '123';
        break;
      case 'notice':
        feeAmount = '313';
        break;
      case 'withoutnotice':
        feeAmount = '123';
        break;
    }

    await I.amOnPage(`case/${caseRef}/general-application/application-type`);
    await applicationTypePage.verifyPageContent();
    await applicationTypePage.nextAction('Ask to change a hearing date');
    await applicationTypePage.nextAction('Continue');

    if (communicationType == 'consent') {
      await agreementFromOtherPartyPage.verifyPageContent(applicationType);
      await agreementFromOtherPartyPage.nextAction('Yes');
      await agreementFromOtherPartyPage.nextAction('Continue');
    } else {
      await agreementFromOtherPartyPage.verifyPageContent(applicationType);
      await agreementFromOtherPartyPage.nextAction('No');
      await agreementFromOtherPartyPage.nextAction('Continue');
      if (communicationType == 'notice') {
        await informOtherPartiesPage.verifyPageContent(applicationType);
        await informOtherPartiesPage.selectAndVerifyDoInformOption();
      } else {
        await informOtherPartiesPage.verifyPageContent(applicationType);
        await informOtherPartiesPage.selectAndVerifyDontInformOption();
      }
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

    await unavailableDatesConfirmationPage.verifyPageContent(applicationType);
    unavailableDatesConfirmationPage.nextAction('Yes');
    unavailableDatesConfirmationPage.nextAction('Continue');

    await unavailableDatesPage.verifyPageContent(applicationType);
    unavailableDatesPage.fillFields();
    unavailableDatesPage.nextAction('Continue');

    await hearingSupportPage.verifyPageContent(applicationType);
    await hearingSupportPage.nextAction('Continue');

    await payingForApplicationPage.verifyPageContent(applicationType, feeAmount);
    await payingForApplicationPage.nextAction('Continue');

    await checkAndSendPage.verifyPageContent(caseNumber, parties, applicationType, communicationType);
    await checkAndSendPage.checkAndSign();
    await checkAndSendPage.nextAction('Submit');

    await submitGAConfirmationPage.verifyPageContent(feeAmount);
    await submitGAConfirmationPage.nextAction('Pay application fee');

    I.wait(2);

    await applyHelpFeeSelectionPage.confirmActions('No');

    await govPay.addValidCardDetails(feeAmount);
    govPay.confirmPayment();

    const generalApplicationID = (await I.grabCurrentUrl()).match(/\/general-application\/(\d+)\//)[1];

    await paymentConfirmationPage.verifyPageContent();
    await paymentConfirmationPage.nextAction('Close and return to dashboard');

    return generalApplicationID;
  }

  async askForMoreTimeCourtOrderGA(caseRef, parties, communicationType = 'withoutnotice', org = '', language = 'ENGLISH') {
    const caseNumber = StringUtilsComponent.StringUtilsComponent.formatClaimReferenceToAUIDisplayFormat(caseRef);
    const applicationType = 'More time to do what is required by a court order';
    let feeAmount;

    switch (communicationType) {
      case 'consent':
        feeAmount = '123';
        break;
      case 'notice':
        feeAmount = '313';
        break;
      case 'withoutnotice':
        feeAmount = '123';
        break;
    }

    await I.amOnPage(`case/${caseRef}/general-application/application-type`);
    await applicationTypePage.verifyPageContent();
    await applicationTypePage.nextAction('Ask for more time to do what is required by a court order');
    await applicationTypePage.nextAction('Continue');

    if (communicationType == 'consent') {
      await agreementFromOtherPartyPage.verifyPageContent(applicationType);
      await agreementFromOtherPartyPage.nextAction('Yes');
      await agreementFromOtherPartyPage.nextAction('Continue');
    } else {
      await agreementFromOtherPartyPage.verifyPageContent(applicationType);
      await agreementFromOtherPartyPage.nextAction('No');
      await agreementFromOtherPartyPage.nextAction('Continue');
      if (communicationType == 'notice') {
        await informOtherPartiesPage.verifyPageContent(applicationType);
        await informOtherPartiesPage.selectAndVerifyDoInformOption();
      } else {
        await informOtherPartiesPage.verifyPageContent(applicationType);
        await informOtherPartiesPage.selectAndVerifyDontInformOption();
      }
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

    await unavailableDatesConfirmationPage.verifyPageContent(applicationType);
    unavailableDatesConfirmationPage.nextAction('Yes');
    unavailableDatesConfirmationPage.nextAction('Continue');

    await unavailableDatesPage.verifyPageContent(applicationType);
    unavailableDatesPage.fillFields();
    unavailableDatesPage.nextAction('Continue');

    await hearingSupportPage.verifyPageContent(applicationType);
    await hearingSupportPage.nextAction('Continue');

    await payingForApplicationPage.verifyPageContent(applicationType, feeAmount);
    await payingForApplicationPage.nextAction('Continue');

    await checkAndSendPage.verifyPageContent(caseNumber, parties, applicationType, communicationType, 'none', 'none', org);
    org === 'company' ? await checkAndSendPage.checkAndSignForCompany() : await checkAndSendPage.checkAndSign();
    await checkAndSendPage.nextAction('Submit');

    await submitGAConfirmationPage.verifyPageContent(feeAmount);
    await submitGAConfirmationPage.nextAction('Pay application fee');

    I.wait(2);

    await applyHelpFeeSelectionPage.confirmActions('No');

    await govPay.addValidCardDetails(feeAmount, language);
    govPay.confirmPayment(language);

    const generalApplicationID = (await I.grabCurrentUrl()).match(/\/general-application\/(\d+)\//)[1];

    await paymentConfirmationPage.verifyPageContent();
    await paymentConfirmationPage.nextAction('Close and return to dashboard');

    return generalApplicationID;
  }

  async askForReliefFromAPenaltyGA(caseRef, parties, communicationType = 'withoutnotice') {
    //Relief from sanctions
    const caseNumber = StringUtilsComponent.StringUtilsComponent.formatClaimReferenceToAUIDisplayFormat(caseRef);
    const applicationType = 'Relief from a penalty you\'ve been given by the court';
    let feeAmount;

    switch (communicationType) {
      case 'consent':
        feeAmount = '123';
        break;
      case 'notice':
        feeAmount = '313';
        break;
      case 'withoutnotice':
        feeAmount = '123';
        break;
    }

    await I.amOnPage(`case/${caseRef}/general-application/application-type`);
    await applicationTypePage.verifyPageContent();
    await applicationTypePage.nextAction('Ask for relief from a penalty you\'ve been given by the court');
    await applicationTypePage.nextAction('Continue');

    if (communicationType == 'consent') {
      await agreementFromOtherPartyPage.verifyPageContent(applicationType);
      await agreementFromOtherPartyPage.nextAction('Yes');
      await agreementFromOtherPartyPage.nextAction('Continue');
    } else {
      await agreementFromOtherPartyPage.verifyPageContent(applicationType);
      await agreementFromOtherPartyPage.nextAction('No');
      await agreementFromOtherPartyPage.nextAction('Continue');
      if (communicationType == 'notice') {
        await informOtherPartiesPage.verifyPageContent(applicationType);
        await informOtherPartiesPage.selectAndVerifyDoInformOption();
      } else {
        await informOtherPartiesPage.verifyPageContent(applicationType);
        await informOtherPartiesPage.selectAndVerifyDontInformOption();
      }
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

    await unavailableDatesConfirmationPage.verifyPageContent(applicationType);
    unavailableDatesConfirmationPage.nextAction('Yes');
    unavailableDatesConfirmationPage.nextAction('Continue');

    await unavailableDatesPage.verifyPageContent(applicationType);
    unavailableDatesPage.fillFields();
    unavailableDatesPage.nextAction('Continue');

    await hearingSupportPage.verifyPageContent(applicationType);
    await hearingSupportPage.nextAction('Continue');

    await payingForApplicationPage.verifyPageContent(applicationType, feeAmount);
    await payingForApplicationPage.nextAction('Continue');

    await checkAndSendPage.verifyPageContent(caseNumber, parties, applicationType, communicationType);
    await checkAndSendPage.checkAndSign();
    await checkAndSendPage.nextAction('Submit');

    await submitGAConfirmationPage.verifyPageContent(feeAmount);
    await submitGAConfirmationPage.nextAction('Pay application fee');

    I.wait(2);

    await applyHelpFeeSelectionPage.confirmActions('No');

    await govPay.addValidCardDetails(feeAmount);
    govPay.confirmPayment();

    const generalApplicationID = (await I.grabCurrentUrl()).match(/\/general-application\/(\d+)\//)[1];

    await paymentConfirmationPage.verifyPageContent();
    await paymentConfirmationPage.nextAction('Close and return to dashboard');

    return generalApplicationID;
  }

  //All GAs below here are from the expanded "Other applications" section

  async askToChangeSubmittedGA(caseRef, parties, communicationType = 'withoutnotice') {
    //Amend a statement of case
    const caseNumber = StringUtilsComponent.StringUtilsComponent.formatClaimReferenceToAUIDisplayFormat(caseRef);
    const applicationType = 'Make a change to your claim or defence that you\'ve submitted';
    let feeAmount;

    switch (communicationType) {
      case 'consent':
        feeAmount = '123';
        break;
      case 'notice':
        feeAmount = '313';
        break;
      case 'withoutnotice':
        feeAmount = '123';
        break;
    }

    await I.amOnPage(`case/${caseRef}/general-application/application-type`);
    await applicationTypePage.verifyPageContent();
    await applicationTypePage.nextAction('Other applications');
    await I.waitForContent('Ask to make a change to your claim or defence that you\'ve submitted', 10);
    await applicationTypePage.nextAction('Ask to make a change to your claim or defence that you\'ve submitted');
    await applicationTypePage.nextAction('Continue');

    if (communicationType == 'consent') {
      await agreementFromOtherPartyPage.verifyPageContent(applicationType);
      await agreementFromOtherPartyPage.nextAction('Yes');
      await agreementFromOtherPartyPage.nextAction('Continue');
    } else {
      await agreementFromOtherPartyPage.verifyPageContent(applicationType);
      await agreementFromOtherPartyPage.nextAction('No');
      await agreementFromOtherPartyPage.nextAction('Continue');
      if (communicationType == 'notice') {
        await informOtherPartiesPage.verifyPageContent(applicationType);
        await informOtherPartiesPage.selectAndVerifyDoInformOption();
      } else {
        await informOtherPartiesPage.verifyPageContent(applicationType);
        await informOtherPartiesPage.selectAndVerifyDontInformOption();
      }
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

    await unavailableDatesConfirmationPage.verifyPageContent(applicationType);
    unavailableDatesConfirmationPage.nextAction('Yes');
    unavailableDatesConfirmationPage.nextAction('Continue');

    await unavailableDatesPage.verifyPageContent(applicationType);
    unavailableDatesPage.fillFields();
    unavailableDatesPage.nextAction('Continue');

    await hearingSupportPage.verifyPageContent(applicationType);
    await hearingSupportPage.nextAction('Continue');

    await payingForApplicationPage.verifyPageContent(applicationType, feeAmount);
    await payingForApplicationPage.nextAction('Continue');

    await checkAndSendPage.verifyPageContent(caseNumber, parties, applicationType, communicationType);
    await checkAndSendPage.checkAndSign();
    await checkAndSendPage.nextAction('Submit');

    await submitGAConfirmationPage.verifyPageContent(feeAmount);
    await submitGAConfirmationPage.nextAction('Pay application fee');

    I.wait(2);

    await applyHelpFeeSelectionPage.confirmActions('No');

    await govPay.addValidCardDetails(feeAmount);
    govPay.confirmPayment();

    const generalApplicationID = (await I.grabCurrentUrl()).match(/\/general-application\/(\d+)\//)[1];

    await paymentConfirmationPage.verifyPageContent();
    await paymentConfirmationPage.nextAction('Close and return to dashboard');

    return generalApplicationID;
  }

  async askCourtSummaryJudgmentGA(caseRef, parties, communicationType = 'withoutnotice') {
    const caseNumber = StringUtilsComponent.StringUtilsComponent.formatClaimReferenceToAUIDisplayFormat(caseRef);
    const applicationType = 'Court to make a summary judgment on a case';
    let feeAmount;

    switch (communicationType) {
      case 'consent':
        feeAmount = '123';
        break;
      case 'notice':
        feeAmount = '313';
        break;
      case 'withoutnotice':
        feeAmount = '123';
        break;
    }

    await I.amOnPage(`case/${caseRef}/general-application/application-type`);
    await applicationTypePage.verifyPageContent();
    await applicationTypePage.nextAction('Other applications');
    await I.waitForContent('Ask to make a change to your claim or defence that you\'ve submitted', 10);
    await applicationTypePage.nextAction('Ask the court to make a summary judgment on a case');
    await applicationTypePage.nextAction('Continue');

    if (communicationType == 'consent') {
      await agreementFromOtherPartyPage.verifyPageContent(applicationType);
      await agreementFromOtherPartyPage.nextAction('Yes');
      await agreementFromOtherPartyPage.nextAction('Continue');
    } else {
      await agreementFromOtherPartyPage.verifyPageContent(applicationType);
      await agreementFromOtherPartyPage.nextAction('No');
      await agreementFromOtherPartyPage.nextAction('Continue');
      if (communicationType == 'notice') {
        await informOtherPartiesPage.verifyPageContent(applicationType);
        await informOtherPartiesPage.selectAndVerifyDoInformOption();
      } else {
        await informOtherPartiesPage.verifyPageContent(applicationType);
        await informOtherPartiesPage.selectAndVerifyDontInformOption();
      }
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

    await unavailableDatesConfirmationPage.verifyPageContent(applicationType);
    unavailableDatesConfirmationPage.nextAction('Yes');
    unavailableDatesConfirmationPage.nextAction('Continue');

    await unavailableDatesPage.verifyPageContent(applicationType);
    unavailableDatesPage.fillFields();
    unavailableDatesPage.nextAction('Continue');

    await hearingSupportPage.verifyPageContent(applicationType);
    await hearingSupportPage.nextAction('Continue');

    await payingForApplicationPage.verifyPageContent(applicationType, feeAmount);
    await payingForApplicationPage.nextAction('Continue');

    await checkAndSendPage.verifyPageContent(caseNumber, parties, applicationType, communicationType);
    await checkAndSendPage.checkAndSign();
    await checkAndSendPage.nextAction('Submit');

    await submitGAConfirmationPage.verifyPageContent(feeAmount);
    await submitGAConfirmationPage.nextAction('Pay application fee');

    I.wait(2);

    await applyHelpFeeSelectionPage.confirmActions('No');

    await govPay.addValidCardDetails(feeAmount);
    govPay.confirmPayment();

    const generalApplicationID = (await I.grabCurrentUrl()).match(/\/general-application\/(\d+)\//)[1];

    await paymentConfirmationPage.verifyPageContent();
    await paymentConfirmationPage.nextAction('Close and return to dashboard');

    return generalApplicationID;
  }

  async askCourtStrikeOutGA(caseRef, parties, communicationType = 'withoutnotice') {
    const caseNumber = StringUtilsComponent.StringUtilsComponent.formatClaimReferenceToAUIDisplayFormat(caseRef);
    const applicationType = 'Court to strike out all or part of the other parties\' case without a trial';
    let feeAmount;

    switch (communicationType) {
      case 'consent':
        feeAmount = '123';
        break;
      case 'notice':
        feeAmount = '313';
        break;
      case 'withoutnotice':
        feeAmount = '123';
        break;
    }

    await I.amOnPage(`case/${caseRef}/general-application/application-type`);
    await applicationTypePage.verifyPageContent();
    await applicationTypePage.nextAction('Other applications');
    await I.waitForContent('Ask to make a change to your claim or defence that you\'ve submitted', 10);
    await applicationTypePage.nextAction('Ask the court to strike out all or part of the other parties\' case without a trial');
    await applicationTypePage.nextAction('Continue');

    if (communicationType == 'consent') {
      await agreementFromOtherPartyPage.verifyPageContent(applicationType);
      await agreementFromOtherPartyPage.nextAction('Yes');
      await agreementFromOtherPartyPage.nextAction('Continue');
    } else {
      await agreementFromOtherPartyPage.verifyPageContent(applicationType);
      await agreementFromOtherPartyPage.nextAction('No');
      await agreementFromOtherPartyPage.nextAction('Continue');
      if (communicationType == 'notice') {
        await informOtherPartiesPage.verifyPageContent(applicationType);
        await informOtherPartiesPage.selectAndVerifyDoInformOption();
      } else {
        await informOtherPartiesPage.verifyPageContent(applicationType);
        await informOtherPartiesPage.selectAndVerifyDontInformOption();
      }
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

    await unavailableDatesConfirmationPage.verifyPageContent(applicationType);
    unavailableDatesConfirmationPage.nextAction('Yes');
    unavailableDatesConfirmationPage.nextAction('Continue');

    await unavailableDatesPage.verifyPageContent(applicationType);
    unavailableDatesPage.fillFields();
    unavailableDatesPage.nextAction('Continue');

    await hearingSupportPage.verifyPageContent(applicationType);
    await hearingSupportPage.nextAction('Continue');

    await payingForApplicationPage.verifyPageContent(applicationType, feeAmount);
    await payingForApplicationPage.nextAction('Continue');

    await checkAndSendPage.verifyPageContent(caseNumber, parties, applicationType, communicationType);
    await checkAndSendPage.checkAndSign();
    await checkAndSendPage.nextAction('Submit');

    await submitGAConfirmationPage.verifyPageContent(feeAmount);
    await submitGAConfirmationPage.nextAction('Pay application fee');

    I.wait(2);

    await applyHelpFeeSelectionPage.confirmActions('No');

    await govPay.addValidCardDetails(feeAmount);
    govPay.confirmPayment();

    const generalApplicationID = (await I.grabCurrentUrl()).match(/\/general-application\/(\d+)\//)[1];

    await paymentConfirmationPage.verifyPageContent();
    await paymentConfirmationPage.nextAction('Close and return to dashboard');

    return generalApplicationID;
  }

  async askCourtToPauseClaimGA(caseRef, parties, communicationType = 'withoutnotice') {
    const caseNumber = StringUtilsComponent.StringUtilsComponent.formatClaimReferenceToAUIDisplayFormat(caseRef);
    const applicationType = 'Court to pause a claim';
    let feeAmount;

    switch (communicationType) {
      case 'consent':
        feeAmount = '123';
        break;
      case 'notice':
        feeAmount = '313';
        break;
      case 'withoutnotice':
        feeAmount = '123';
        break;
    }

    await I.amOnPage(`case/${caseRef}/general-application/application-type`);
    await applicationTypePage.verifyPageContent();
    await applicationTypePage.nextAction('Other applications');
    await I.waitForContent('Ask to make a change to your claim or defence that you\'ve submitted', 10);
    await applicationTypePage.nextAction('Ask the court to pause a claim');
    await applicationTypePage.nextAction('Continue');

    if (communicationType == 'consent') {
      await agreementFromOtherPartyPage.verifyPageContent(applicationType);
      await agreementFromOtherPartyPage.nextAction('Yes');
      await agreementFromOtherPartyPage.nextAction('Continue');
    } else {
      await agreementFromOtherPartyPage.verifyPageContent(applicationType);
      await agreementFromOtherPartyPage.nextAction('No');
      await agreementFromOtherPartyPage.nextAction('Continue');
      if (communicationType == 'notice') {
        await informOtherPartiesPage.verifyPageContent(applicationType);
        await informOtherPartiesPage.selectAndVerifyDoInformOption();
      } else {
        await informOtherPartiesPage.verifyPageContent(applicationType);
        await informOtherPartiesPage.selectAndVerifyDontInformOption();
      }
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

    await unavailableDatesConfirmationPage.verifyPageContent(applicationType);
    unavailableDatesConfirmationPage.nextAction('Yes');
    unavailableDatesConfirmationPage.nextAction('Continue');

    await unavailableDatesPage.verifyPageContent(applicationType);
    unavailableDatesPage.fillFields();
    unavailableDatesPage.nextAction('Continue');

    await hearingSupportPage.verifyPageContent(applicationType);
    await hearingSupportPage.nextAction('Continue');

    await payingForApplicationPage.verifyPageContent(applicationType, feeAmount);
    await payingForApplicationPage.nextAction('Continue');

    await checkAndSendPage.verifyPageContent(caseNumber, parties, applicationType, communicationType);
    await checkAndSendPage.checkAndSign();
    await checkAndSendPage.nextAction('Submit');

    await submitGAConfirmationPage.verifyPageContent(feeAmount);
    await submitGAConfirmationPage.nextAction('Pay application fee');

    I.wait(5);

    await applyHelpFeeSelectionPage.confirmActions('No');

    await govPay.addValidCardDetails(feeAmount);
    govPay.confirmPayment();

    const generalApplicationID = (await I.grabCurrentUrl()).match(/\/general-application\/(\d+)\//)[1];

    await paymentConfirmationPage.verifyPageContent();
    await paymentConfirmationPage.nextAction('Close and return to dashboard');

    return generalApplicationID;
  }

  async askCourtSanctionGA(caseRef, parties, communicationType = 'withoutnotice') {
    const caseNumber = StringUtilsComponent.StringUtilsComponent.formatClaimReferenceToAUIDisplayFormat(caseRef);
    const applicationType = 'Court to impose a sanction on the other parties unless they do a specific action';
    let feeAmount;

    switch (communicationType) {
      case 'consent':
        feeAmount = '123';
        break;
      case 'notice':
        feeAmount = '313';
        break;
      case 'withoutnotice':
        feeAmount = '123';
        break;
    }

    await I.amOnPage(`case/${caseRef}/general-application/application-type`);
    await applicationTypePage.verifyPageContent();
    await applicationTypePage.nextAction('Other applications');
    await I.waitForContent('Ask to make a change to your claim or defence that you\'ve submitted', 10);
    await applicationTypePage.nextAction('Ask the court to impose a sanction on the other parties unless they do a specific action');
    await applicationTypePage.nextAction('Continue');

    if (communicationType == 'consent') {
      await agreementFromOtherPartyPage.verifyPageContent(applicationType);
      await agreementFromOtherPartyPage.nextAction('Yes');
      await agreementFromOtherPartyPage.nextAction('Continue');
    } else {
      await agreementFromOtherPartyPage.verifyPageContent(applicationType);
      await agreementFromOtherPartyPage.nextAction('No');
      await agreementFromOtherPartyPage.nextAction('Continue');
      if (communicationType == 'notice') {
        await informOtherPartiesPage.verifyPageContent(applicationType);
        await informOtherPartiesPage.selectAndVerifyDoInformOption();
      } else {
        await informOtherPartiesPage.verifyPageContent(applicationType);
        await informOtherPartiesPage.selectAndVerifyDontInformOption();
      }
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

    await unavailableDatesConfirmationPage.verifyPageContent(applicationType);
    unavailableDatesConfirmationPage.nextAction('Yes');
    unavailableDatesConfirmationPage.nextAction('Continue');

    await unavailableDatesPage.verifyPageContent(applicationType);
    unavailableDatesPage.fillFields();
    unavailableDatesPage.nextAction('Continue');

    await hearingSupportPage.verifyPageContent(applicationType);
    await hearingSupportPage.nextAction('Continue');

    await payingForApplicationPage.verifyPageContent(applicationType, feeAmount);
    await payingForApplicationPage.nextAction('Continue');

    await checkAndSendPage.verifyPageContent(caseNumber, parties, applicationType, communicationType);
    await checkAndSendPage.checkAndSign();
    await checkAndSendPage.nextAction('Submit');

    await submitGAConfirmationPage.verifyPageContent(feeAmount);
    await submitGAConfirmationPage.nextAction('Pay application fee');

    I.wait(2);

    await applyHelpFeeSelectionPage.confirmActions('No');

    await govPay.addValidCardDetails(feeAmount);
    govPay.confirmPayment();

    const generalApplicationID = (await I.grabCurrentUrl()).match(/\/general-application\/(\d+)\//)[1];

    await paymentConfirmationPage.verifyPageContent();
    await paymentConfirmationPage.nextAction('Close and return to dashboard');

    return generalApplicationID;
  }

  async askCourtToSettleByConsentGA(caseRef, parties, communicationType = 'consent') {
    //Can only be with consent
    const caseNumber = StringUtilsComponent.StringUtilsComponent.formatClaimReferenceToAUIDisplayFormat(caseRef);
    const applicationType = 'Court to make an order settling the claim by consent';
    const feeAmount = '123';

    await I.amOnPage(`case/${caseRef}/general-application/application-type`);
    await applicationTypePage.verifyPageContent();
    await applicationTypePage.nextAction('Other applications');
    await I.waitForContent('Ask to make a change to your claim or defence that you\'ve submitted', 10);
    await applicationTypePage.nextAction('Ask the court to make an order settling the claim by consent');
    await applicationTypePage.nextAction('Continue');

    await agreementFromOtherPartyPage.verifyPageContent(applicationType);
    await agreementFromOtherPartyPage.nextAction('Yes');
    await agreementFromOtherPartyPage.nextAction('Continue');

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

    await unavailableDatesConfirmationPage.verifyPageContent(applicationType);
    unavailableDatesConfirmationPage.nextAction('Yes');
    unavailableDatesConfirmationPage.nextAction('Continue');

    await unavailableDatesPage.verifyPageContent(applicationType);
    unavailableDatesPage.fillFields();
    unavailableDatesPage.nextAction('Continue');

    await hearingSupportPage.verifyPageContent(applicationType);
    await hearingSupportPage.nextAction('Continue');

    await payingForApplicationPage.verifyPageContent(applicationType, feeAmount);
    await payingForApplicationPage.nextAction('Continue');

    await checkAndSendPage.verifyPageContent(caseNumber, parties, applicationType, communicationType);
    await checkAndSendPage.checkAndSign();
    await checkAndSendPage.nextAction('Submit');

    await submitGAConfirmationPage.verifyPageContent(feeAmount);
    await submitGAConfirmationPage.nextAction('Pay application fee');

    I.wait(2);

    await applyHelpFeeSelectionPage.confirmActions('No');

    await govPay.addValidCardDetails(feeAmount);
    govPay.confirmPayment();

    const generalApplicationID = (await I.grabCurrentUrl()).match(/\/general-application\/(\d+)\//)[1];

    await paymentConfirmationPage.verifyPageContent();
    await paymentConfirmationPage.nextAction('Close and return to dashboard');

    return generalApplicationID;
  }

  async askSomethingNotOnListGA(caseRef, parties, communicationType = 'withoutnotice') {
    const caseNumber = StringUtilsComponent.StringUtilsComponent.formatClaimReferenceToAUIDisplayFormat(caseRef);
    const applicationType = 'Court to do something that\'s not on this list';
    let feeAmount;

    switch (communicationType) {
      case 'consent':
        feeAmount = '123';
        break;
      case 'notice':
        feeAmount = '313';
        break;
      case 'withoutnotice':
        feeAmount = '123';
        break;
    }

    await I.amOnPage(`case/${caseRef}/general-application/application-type`);
    await applicationTypePage.verifyPageContent();
    await applicationTypePage.nextAction('Other applications');
    await I.waitForContent('Ask to make a change to your claim or defence that you\'ve submitted', 10);
    await applicationTypePage.nextAction('Ask the court to do something that\'s not on this list');
    await applicationTypePage.nextAction('Continue');

    if (communicationType == 'consent') {
      await agreementFromOtherPartyPage.verifyPageContent(applicationType);
      await agreementFromOtherPartyPage.nextAction('Yes');
      await agreementFromOtherPartyPage.nextAction('Continue');
    } else {
      await agreementFromOtherPartyPage.verifyPageContent(applicationType);
      await agreementFromOtherPartyPage.nextAction('No');
      await agreementFromOtherPartyPage.nextAction('Continue');
      if (communicationType == 'notice') {
        await informOtherPartiesPage.verifyPageContent(applicationType);
        await informOtherPartiesPage.selectAndVerifyDoInformOption();
      } else {
        await informOtherPartiesPage.verifyPageContent(applicationType);
        await informOtherPartiesPage.selectAndVerifyDontInformOption();
      }
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

    await unavailableDatesConfirmationPage.verifyPageContent(applicationType);
    unavailableDatesConfirmationPage.nextAction('Yes');
    unavailableDatesConfirmationPage.nextAction('Continue');

    await unavailableDatesPage.verifyPageContent(applicationType);
    unavailableDatesPage.fillFields();
    unavailableDatesPage.nextAction('Continue');

    await hearingSupportPage.verifyPageContent(applicationType);
    await hearingSupportPage.nextAction('Continue');

    await payingForApplicationPage.verifyPageContent(applicationType, feeAmount);
    await payingForApplicationPage.nextAction('Continue');

    await checkAndSendPage.verifyPageContent(caseNumber, parties, applicationType, communicationType);
    await checkAndSendPage.checkAndSign();
    await checkAndSendPage.nextAction('Submit');

    await submitGAConfirmationPage.verifyPageContent(feeAmount);
    await submitGAConfirmationPage.nextAction('Pay application fee');

    I.wait(2);

    await applyHelpFeeSelectionPage.confirmActions('No');

    await govPay.addValidCardDetails(feeAmount);
    govPay.confirmPayment();

    const generalApplicationID = (await I.grabCurrentUrl()).match(/\/general-application\/(\d+)\//)[1];

    await paymentConfirmationPage.verifyPageContent();
    await paymentConfirmationPage.nextAction('Close and return to dashboard');

    return generalApplicationID;
  }

  async additionalPayment(feeAmount) {
    await applyHelpFeeSelectionPage.verifyPageContentForAdditionalFee();
    await applyHelpFeeSelectionPage.nextAction('No');
    await applyHelpFeeSelectionPage.nextAction('Continue');

    await govPay.addValidCardDetails(feeAmount);
    govPay.confirmPayment();

    await paymentConfirmationPage.verifyAdditionalPaymentPageContent();
    await paymentConfirmationPage.nextAction('Close and return to dashboard');
  }

  async createMultipleApplications(caseRef, parties, communicationType = 'consent') {

    const caseNumber = StringUtilsComponent.StringUtilsComponent.formatClaimReferenceToAUIDisplayFormat(caseRef);
    const firstApplicationType = 'Change a hearing date';
    const secondApplicationType = 'Court to strike out all or part of the other parties\' case without a trial';
    const applicationType = 'Make an application';
    let feeAmount;

    switch(communicationType) {
      case 'consent':
        feeAmount = '123';
        break;
      case 'notice':
        feeAmount = '313';
        break;
      case 'withoutnotice':
        feeAmount = '123';
        break;
    }

    // Primary application to Adjourn a hearing
    await I.amOnPage(`case/${caseRef}/general-application/application-type`);
    await applicationTypePage.verifyPageContent();
    await applicationTypePage.nextAction('Ask to change a hearing date');
    await applicationTypePage.nextAction('Continue');

    if (communicationType == 'consent') {
      await agreementFromOtherPartyPage.verifyPageContent(firstApplicationType);
      await agreementFromOtherPartyPage.nextAction('Yes');
      await agreementFromOtherPartyPage.nextAction('Continue');
    } else {
      await agreementFromOtherPartyPage.verifyPageContent(firstApplicationType);
      await agreementFromOtherPartyPage.nextAction('No');
      await agreementFromOtherPartyPage.nextAction('Continue');
      if (communicationType == 'notice') {
        await informOtherPartiesPage.verifyPageContent(firstApplicationType);
        await informOtherPartiesPage.selectAndVerifyDoInformOption();
      } else {
        await informOtherPartiesPage.verifyPageContent(firstApplicationType);
        await informOtherPartiesPage.selectAndVerifyDontInformOption();
      }
    }

    await applicationCostsPage.verifyPageContent(firstApplicationType, feeAmount);
    await applicationCostsPage.nextAction('Start now');

    await claimApplicationCostPage.verifyPageContent(firstApplicationType);
    await claimApplicationCostPage.selectAndVerifyYesOption();
    await claimApplicationCostPage.nextAction('Continue');

    await orderJudgePage.verifyPageContent(firstApplicationType);
    await orderJudgePage.fillTextBox('Test order');
    await orderJudgePage.nextAction('Continue');

    await requestingReasonPage.verifyPageContent(firstApplicationType);
    await requestingReasonPage.fillTextBox('Test order');
    await requestingReasonPage.nextAction('Continue');

    await addAnotherApplicationPage.verifyPageContent(firstApplicationType);
    await addAnotherApplicationPage.nextAction('Yes');
    await addAnotherApplicationPage.nextAction('Continue');

    // Secondary application to Strike out
    await I.amOnPage(`case/${caseRef}/general-application/application-type?linkFrom=addAnotherApp`);
    await applicationTypePage.verifyPageContent();
    await applicationTypePage.nextAction('Other applications');
    await applicationTypePage.nextAction('Ask the court to strike out all or part of the other parties\' case without a trial');
    await applicationTypePage.nextAction('Continue');

    await orderJudgePage.verifyPageContent(secondApplicationType);
    await orderJudgePage.fillTextBox('Test order');
    await orderJudgePage.nextAction('Continue');

    await requestingReasonPage.verifyPageContent(secondApplicationType);
    await requestingReasonPage.fillTextBox('Test order');
    await requestingReasonPage.nextAction('Continue');

    await addAnotherApplicationPage.verifyPageContent(secondApplicationType);
    await addAnotherApplicationPage.nextAction('No');
    await addAnotherApplicationPage.nextAction('Continue');

    // Multiple application journey
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

    await unavailableDatesConfirmationPage.verifyPageContent(applicationType);
    unavailableDatesConfirmationPage.nextAction('Yes');
    unavailableDatesConfirmationPage.nextAction('Continue');

    await unavailableDatesPage.verifyPageContent(applicationType);
    unavailableDatesPage.fillFields();
    unavailableDatesPage.nextAction('Continue');

    await hearingSupportPage.verifyPageContent(applicationType);
    await hearingSupportPage.nextAction('Continue');

    await payingForApplicationPage.verifyPageContent(applicationType, feeAmount);
    await payingForApplicationPage.nextAction('Continue');

    await checkAndSendPage.verifyPageContent(caseNumber, parties, applicationType, communicationType, firstApplicationType, secondApplicationType);
    await checkAndSendPage.checkAndSign();
    await checkAndSendPage.nextAction('Submit');

    await submitGAConfirmationPage.verifyPageContent(feeAmount);
    await submitGAConfirmationPage.nextAction('Pay application fee');

    I.wait(2);

    await applyHelpFeeSelectionPage.confirmActions('No');

    await govPay.addValidCardDetails(feeAmount);
    govPay.confirmPayment();

    const generalApplicationID = (await I.grabCurrentUrl()).match(/\/general-application\/(\d+)\//)[1];

    await paymentConfirmationPage.verifyPageContent();
    await paymentConfirmationPage.nextAction('Close and return to dashboard');

    I.wait(5);
    await I.refreshPage();
    await I.waitForClickable('View Applications', 5);
    await I.click('.govuk-link >> text=View Applications');
    await I.amOnPage(`/case/${caseRef}/general-application/summary`);
    await I.see('Adjourn a hearing, Strike out');
    await I.see('Awaiting Respondent Response');

    return generalApplicationID;
  }

}

module.exports = new createGASteps();
