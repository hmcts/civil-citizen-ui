const I = actor();
const StringUtilsComponent = require('../../caseProgression/util/StringUtilsComponent.js');
const GovPay = require ('../../common/govPay.js');
const config = require('../../../../config.js');
const govPay = new GovPay();

const applicationTypePage = new ApplicationType();

class respondGASteps {
  async respondToGA(caseRef, gaRef, applicationType, parties, communicationType = 'withoutnotice') {
    const caseNumber = StringUtilsComponent.StringUtilsComponent.formatClaimReferenceToAUIDisplayFormat(caseRef);
    //verify notification here
    await I.waitForContent('Review and respond to the request', 60);
    await I.click('Review and respond to the request');
    await I.amOnPage(`case/${caseRef}/response/general-application/${gaRef}/respondent-information`);

    await respondentInformationPage.verifyPageContent();
    await respondentInformationPage.nextAction('Start now');

    await viewApplicationPage.verifyPageContent();
    await viewApplicationPage.nextAction('Respond to application');

    await respondentAgreementPage.verifyPageContent();
    await respondentAgreementPage.nextAction('Yes');
    await respondentAgreementPage.nextAction('Continue');

    await uploadDocumentsPage.verifyPageContent();
    await uploadDocumentsPage.nextAction('No');

    await hearingPreferencePage.verifyPageContent();
    await hearingPreferencePage.nextAction('No');

    await hearingArrangementPage.verifyPageContent();
    await hearingArrangementPage.nextAction('In person at the court');
    await hearingArrangementPage.fillTextAndSelectLocation('In person', config.gaCourtToBeSelected);
    await hearingArrangementPage.nextAction('Continue')

    await hearingContactDetailsPage.verifyPageContent(applicationType);
    await hearingContactDetailsPage.fillContactDetails('07555655326', 'test@gmail.com');
    await hearingContactDetailsPage.nextAction('Continue');

    await unavailableDatesPage.verifyPageContent(applicationType);
    await unavailableDatesPage.nextAction('Continue');

    await hearingSupportPage.verifyPageContent(applicationType);
    await hearingSupportPage.nextAction('Continue');

    await checkAndSendResponsePage.verifyPageContent(caseNumber, parties, applicationType, communicationType);
    await checkAndSendResponsePage.checkAndSign();
    await checkAndSendResponsePage.nextAction('Submit');

    await responseGAConfirmationPage.verifyPageContent();
    await responseGAConfirmationPage.nextAction('Close and return to dashboard');
  }
}

module.exports = new createGASteps();