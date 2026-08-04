/* eslint-disable no-unused-vars */
const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class CheckAndSend {

  async checkPageFullyLoaded () {
    await I.waitForElement('//a[.=\'Cancel\']');
  }

  async nextAction (nextAction) {
    await I.click(nextAction);
  }

  async verifyPageContent(caseNumber, parties, applicationType, communicationType, firstApplicationType = 'none', secondApplicationType = 'none', org = '') {
    await this.checkPageFullyLoaded();
    await this.verifyBreadcrumbs();
    await this.verifyHeadingDetails(applicationType, caseNumber, parties);
    if (applicationType !== 'Make an application') {
      await this.applicationType(applicationType);
    } else {
      await this.multipleApplicationType(firstApplicationType, secondApplicationType);
    }
    if (applicationType !== 'Set aside (remove) a judgment' && applicationType !== 'Vary a judgment' && applicationType !== 'Court to make an order settling the claim by consent') {
      await this.additionalApplication(applicationType);
    }
    await this.partiesAgreed(communicationType);
    if (communicationType !== 'consent' && applicationType !== 'Set aside (remove) a judgment' && applicationType !== 'Vary a judgment' && applicationType !== 'Court to make an order settling the claim by consent') {
      await this.informOtherParties(communicationType);
    }
    if (applicationType !== 'Vary a judgment') {
      await this.costsBack();
      await this.orderWanted();
      await this.reasonsForRequest();
    }
    await this.uploadDocument();
    await this.typeOfHearing();
    await this.reasonForTypeOfHearing();
    await this.courtLocation();
    await this.phoneNumber();
    await this.emailAddress();
    await this.unavailableDates();
    await this.hearingSupport();
    org === 'company' ? await this.verifyPageTextForCompany() : await this.verifyPageText();
    await contactUs.verifyContactUs();
  }

  async verifyBreadcrumbs() {
    await I.see('Back', '//a[@class="govuk-back-link"]');
  }

  async verifyHeadingDetails(applicationType, caseNumber, parties) {
    await I.see(applicationType, 'h1');
    await I.see('Check your answers', 'h1');
    await I.see('Case reference: ' + caseNumber);
    await I.see(parties);
  }

  async applicationType(applicationType) {
    const applicatonTypeSelector = '//div[@class=\'govuk-summary-list__row\'][contains(., \'Application type\')]';
    await I.see('Application type', applicatonTypeSelector);
    await I.see(applicationType, applicatonTypeSelector);
    await I.see('Change', applicatonTypeSelector);
  }

  async multipleApplicationType(firstApplicationType, secondApplicationType) {
    const firstSummaryCardTitleSelector = '.govuk-summary-card:first-of-type .govuk-summary-card__title';
    const secondSummaryCardTitleSelector = '.govuk-summary-card:nth-of-type(2) .govuk-summary-card__title';
    const firstSummaryCardFirstRowSelector = '.govuk-summary-card:first-of-type .govuk-summary-list__row:first-of-type';
    const SecondSummaryCardFirstRowSelector = '.govuk-summary-card:nth-of-type(2) .govuk-summary-list__row:first-of-type';
    await I.see('Application 1', firstSummaryCardTitleSelector);
    await I.see('Application type', firstSummaryCardFirstRowSelector);
    await I.see(firstApplicationType, firstSummaryCardFirstRowSelector);
    await I.see('Change', firstSummaryCardFirstRowSelector);
    await I.see('Application 2', secondSummaryCardTitleSelector);
    await I.see('Application type', SecondSummaryCardFirstRowSelector);
    await I.see(secondApplicationType, SecondSummaryCardFirstRowSelector);
    await I.see('Change', SecondSummaryCardFirstRowSelector);
  }

  async additionalApplication(applicationType) {
    const applicatonTypeSelector = '//div[@class=\'govuk-summary-list__row\'][contains(., \'Do you want to add another application?\')]';
    await I.see('Do you want to add another application?', applicatonTypeSelector);
    if (applicationType !== 'Make an application') {
      await I.see('No', applicatonTypeSelector);
    } else {
      await I.see('Yes', applicatonTypeSelector);
    }
    await I.see('Change', applicatonTypeSelector);
  }

  async partiesAgreed(communicationType) {
    const applicatonTypeSelector = '//div[@class=\'govuk-summary-list__row\'][contains(., \'Have the other parties agreed?\')]';
    await I.see('Have the other parties agreed?', applicatonTypeSelector);
    if (communicationType == 'consent') {
      await I.see('Yes', applicatonTypeSelector);
    } else {
      await I.see('No', applicatonTypeSelector);
    }
    await I.see('Change', applicatonTypeSelector);
  }

  async informOtherParties(communicationType) {
    if (communicationType == 'notice') {
      const applicatonTypeSelector = '//div[@class=\'govuk-summary-list__row\'][contains(., \'Do you want the court to inform the other parties?\')]';
      await I.see('Do you want the court to inform the other parties?', applicatonTypeSelector);
      await I.see('Yes', applicatonTypeSelector);
      await I.see('Change', applicatonTypeSelector);
    } else {
      const applicatonTypeSelector = '//div[@class=\'govuk-summary-list__row\'][contains(., \'Do you want the court to inform the other parties?\')]';
      await I.see('Do you want the court to inform the other parties?', applicatonTypeSelector);
      await I.see('No', applicatonTypeSelector);
      await I.see('Change', applicatonTypeSelector);
      const applicatonTypeSelector2 = '//div[@class=\'govuk-summary-list__row\'][contains(., \'Why do you not want the court to inform the other parties?\')]';
      await I.see('Why do you not want the court to inform the other parties?', applicatonTypeSelector2);
      await I.see('Do not need to inform', applicatonTypeSelector2);
      await I.see('Change', applicatonTypeSelector2);
    }
  }

  async costsBack() {
    const applicatonTypeSelector = '//div[@class=\'govuk-summary-list__row\'][contains(., \'Do you want to ask for your costs back?\')]';
    await I.see('Do you want to ask for your costs back?', applicatonTypeSelector);
    await I.see('Yes', applicatonTypeSelector);
    await I.see('Change', applicatonTypeSelector);
  }

  async orderWanted() {
    const applicatonTypeSelector = '//div[@class=\'govuk-summary-list__row\'][contains(., \'What order do you want the judge to make?\')]';
    await I.see('What order do you want the judge to make?', applicatonTypeSelector);
    await I.see('Test order', applicatonTypeSelector);
    await I.see('Change', applicatonTypeSelector);
  }

  async reasonsForRequest() {
    const applicatonTypeSelector = '//div[@class=\'govuk-summary-list__row\'][contains(., \'Why are you requesting this order?\')]';
    await I.see('Why are you requesting this order?', applicatonTypeSelector);
    await I.see('Test order', applicatonTypeSelector);
    await I.see('Change', applicatonTypeSelector);
  }

  async uploadDocument() {
    const applicatonTypeSelector = '//div[@class=\'govuk-summary-list__row\'][contains(., \'Do you want to upload documents to support your application\')]';
    await I.see('Do you want to upload documents to support your application?', applicatonTypeSelector);
    await I.see('No', applicatonTypeSelector);
    await I.see('Change', applicatonTypeSelector);
  }

  async typeOfHearing() {
    const applicatonTypeSelector = '//div[@class=\'govuk-summary-list__row\'][contains(., \'Choose your preferred type of hearing\')]';
    await I.see('Choose your preferred type of hearing', applicatonTypeSelector);
    await I.see('In person at the court', applicatonTypeSelector);
    await I.see('Change', applicatonTypeSelector);
  }

  async reasonForTypeOfHearing() {
    const applicatonTypeSelector = '//div[@class=\'govuk-summary-list__row\'][contains(., \'Why would you prefer this type of hearing?\')]';
    await I.see('Why would you prefer this type of hearing?', applicatonTypeSelector);
    await I.see('In person', applicatonTypeSelector);
    await I.see('Change', applicatonTypeSelector);
  }

  async courtLocation() {
    const applicatonTypeSelector = '//div[@class=\'govuk-summary-list__row\'][contains(., \'Preferred court location\')]';
    await I.see('Preferred court location', applicatonTypeSelector);
    await I.see('Birmingham Civil and Family Justice Centre', applicatonTypeSelector);
    await I.see('Change', applicatonTypeSelector);
  }

  async phoneNumber() {
    const applicatonTypeSelector = '//div[@class=\'govuk-summary-list__row\'][contains(., \'Preferred telephone number\')]';
    await I.see('Preferred telephone number', applicatonTypeSelector);
    await I.see('07555655326', applicatonTypeSelector);
    await I.see('Change', applicatonTypeSelector);
  }

  async emailAddress() {
    const applicatonTypeSelector = '//div[@class=\'govuk-summary-list__row\'][contains(., \'Preferred email\')]';
    await I.see('Preferred email', applicatonTypeSelector);
    await I.see('test@gmail.com', applicatonTypeSelector);
    await I.see('Change', applicatonTypeSelector);
  }

  async unavailableDates() {
    const applicatonTypeSelector = '//div[@class=\'govuk-summary-list__row\'][contains(., \'Dates when you cannot attend a hearing\')]';
    await I.see('Dates when you cannot attend a hearing', applicatonTypeSelector);
    await I.see('Change', applicatonTypeSelector);
  }

  async hearingSupport() {
    const applicatonTypeSelector = '//div[@class=\'govuk-summary-list__row\'][contains(., \'Do you need any adjustments or support to attend a hearing?\')]';
    await I.see('Do you need any adjustments or support to attend a hearing?', applicatonTypeSelector);
    await I.see('No', applicatonTypeSelector);
    await I.see('Change', applicatonTypeSelector);
  }

  async verifyPageText() {
    await I.see('Statement of truth', 'h2');
    await I.see('The information on this page forms your application.');
    await I.see('When you\'re satisfied that your answers are correct, you should tick the box below and write your name to "sign" this statement of truth.');
    await I.see('I believe that the facts stated in this application are true.');
    await I.see('I understand that proceedings for contempt of court may be brought against anyone who makes, or causes to be made, a false statement in a document verified by a statement of truth without an honest belief in its truth.');
    await I.see('Name');
    await I.seeElement('//*[@id="name"]');
  }

  async verifyPageTextForCompany() {
    await I.see('Statement of truth', 'h2');
    await I.see('The information on this page forms your application.');
    await I.see('When you\'re satisfied that your answers are correct, you should tick the box below and write your name to "sign" this statement of truth.');
    await I.see('I believe that the facts stated in this application are true.');
    await I.see('I understand that proceedings for contempt of court may be brought against anyone who makes, or causes to be made, a false statement in a document verified by a statement of truth without an honest belief in its truth.');
    await I.see('Full name');
    await I.seeElement('//*[@id="name"]');
  }

  async checkAndSign() {
    await I.click('#signed');
    await I.fillField('#name', 'tester name');
  }

  async checkAndSignForCompany() {
    await I.click('#signed');
    await I.fillField('#name', 'tester name');
    await I.fillField('#title', 'Director');
  }
}

module.exports = CheckAndSend;
