const I = actor();
const StringUtilsComponent = require('../../caseProgression/util/StringUtilsComponent.js');
const config = require('../../../../config.js');

const RespondentInformation = require('../pages/respondentInformation.js');
const ViewApplication = require('../pages/viewApplication.js');
const RespondentAgreement = require('../pages/respondentAgreement.js');
const ResponseUploadDocument = require('../pages/responseUploadDocuments.js');
const ResponseHearingArrangementsGuidance = require('../pages/responseHearingArrangementsGuidance.js');
const HearingArrangement = require('../pages/hearingArrangement.js');
const HearingContactDetails = require('../pages/hearingContactDetails.js');

const UnavailableDates = require('../pages/unavailableDates.js');
const HearingSupport = require('../pages/hearingSupport.js');
const ResponseCheckAndSend = require('../pages/responseCheckAndSend.js');
const ResponseGAConfirmation = require('../pages/responseGAConfirmation.js');
const UnavailableDatesConfirmation = require('../pages/unavailableDatesConfirmation');

const respondentInformationPage = new RespondentInformation();
const viewApplicationPage = new ViewApplication();
const respondentAgreementPage = new RespondentAgreement();
const responseUploadDocumentsPage = new ResponseUploadDocument();
const responseHearingArrangementsGuidancePage = new ResponseHearingArrangementsGuidance();
const hearingArrangementPage = new HearingArrangement();
const hearingContactDetailsPage = new HearingContactDetails();
const unavailableDatesConfirmationPage = new UnavailableDatesConfirmation();
const unavailableDatesPage = new UnavailableDates();
const hearingSupportPage = new HearingSupport();
const responseCheckAndSendPage = new ResponseCheckAndSend();
const responseGAConfirmationPage = new ResponseGAConfirmation();

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

    await respondentAgreementPage.verifyPageContent(applicationType);
    await respondentAgreementPage.nextAction('Yes');
    await respondentAgreementPage.nextAction('Continue');

    await responseUploadDocumentsPage.verifyPageContent(applicationType);
    await responseUploadDocumentsPage.nextAction('No');
    await responseUploadDocumentsPage.nextAction('Continue');

    await responseHearingArrangementsGuidancePage.verifyPageContent(applicationType);
    await responseHearingArrangementsGuidancePage.nextAction('Continue');

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

    await responseCheckAndSendPage.verifyPageContent(caseNumber, parties, applicationType, communicationType);
    await responseCheckAndSendPage.checkAndSign();
    await responseCheckAndSendPage.nextAction('Submit');

    await responseGAConfirmationPage.verifyPageContent();
    await responseGAConfirmationPage.nextAction('Close and return to dashboard');
  }
}

module.exports = new respondGASteps();
