const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class CheckAndSend {

  async checkPageFullyLoaded () {
    await I.waitForElement('//a[.=\'Cancel\']');
  }

  nextAction (nextAction) {
    I.click(nextAction);
  }

  async verifyPageContent(caseNumber, parties, applicationType, communicationType) {
    this.checkPageFullyLoaded();
    this.verifyBreadcrumbs();
    this.verifyHeadingDetails(applicationType, caseNumber, parties);
    this.applicationType(applicationType);
    if (applicationType !== 'Set aside (remove) a judgment' && applicationType !== 'Vary a judgment' && applicationType !== 'Court to make an order settling the claim by consent') {
      this.additionalApplication();
    }
    this.partiesAgreed(communicationType);
    if (communicationType !== 'consent' && applicationType !== 'Set aside (remove) a judgment' && applicationType !== 'Vary a judgment' && applicationType !== 'Court to make an order settling the claim by consent') {
      this.informOtherParties(communicationType);
    }
    if (applicationType !== 'Vary a judgment') {
      this.costsBack();
      this.orderWanted();
      this.reasonsForRequest();
    }
    this.uploadDocument();
    this.typeOfHearing();
    this.reasonForTypeOfHearing();
    this.courtLocation();
    this.phoneNumber();
    this.emailAddress();
    this.unavailableDates();
    this.hearingSupport();
    await this.verifyPageText();
    contactUs.verifyContactUs();
  }

  verifyBreadcrumbs() {
    I.see('Back', '//a[@class="govuk-back-link"]');
  }

  verifyHeadingDetails(applicationType, caseNumber, parties) {
    I.see(applicationType, 'h1');
    I.see('Check your answers', 'h1');
    I.see('Case reference: ' + caseNumber);
    I.see(parties);
  }

  async applicationType(applicationType) {
    const applicatonTypeSelector = '//div[@class=\'govuk-summary-list__row\'][contains(., \'Application type\')]';
    I.see('Application type', applicatonTypeSelector);
    I.see(applicationType, applicatonTypeSelector);
    await I.see('Change', applicatonTypeSelector);
  }

  async additionalApplication() {
    const applicatonTypeSelector = '//div[@class=\'govuk-summary-list__row\'][contains(., \'Do you want to add another application?\')]';
    I.see('Do you want to add another application?', applicatonTypeSelector);
    I.see('No', applicatonTypeSelector);
    await I.see('Change', applicatonTypeSelector);
  }

  async partiesAgreed(communicationType) {
    const applicatonTypeSelector = '//div[@class=\'govuk-summary-list__row\'][contains(., \'Have the other parties agreed?\')]';
    I.see('Have the other parties agreed?', applicatonTypeSelector);
    if (communicationType == 'consent') {
      I.see('Yes', applicatonTypeSelector);
    } else {
      I.see('No', applicatonTypeSelector);
    }
    await I.see('Change', applicatonTypeSelector);
  }

  async informOtherParties(communicationType) {
    if (communicationType == 'notice') {
      const applicatonTypeSelector = '//div[@class=\'govuk-summary-list__row\'][contains(., \'Do you want the court to inform the other parties?\')]';
      I.see('Do you want the court to inform the other parties?', applicatonTypeSelector);
      I.see('Yes', applicatonTypeSelector);
      await I.see('Change', applicatonTypeSelector);
    } else {
      const applicatonTypeSelector = '//div[@class=\'govuk-summary-list__row\'][contains(., \'Do you want the court to inform the other parties?\')]';
      I.see('Do you want the court to inform the other parties?', applicatonTypeSelector);
      I.see('No', applicatonTypeSelector);
      await I.see('Change', applicatonTypeSelector);
      const applicatonTypeSelector2 = '//div[@class=\'govuk-summary-list__row\'][contains(., \'Why do you not want the court to inform the other parties?\')]';
      I.see('Why do you not want the court to inform the other parties?', applicatonTypeSelector2);
      I.see('Do not need to inform', applicatonTypeSelector2);
      await I.see('Change', applicatonTypeSelector2);
    }
  }

  async costsBack() {
    const applicatonTypeSelector = '//div[@class=\'govuk-summary-list__row\'][contains(., \'Do you want to ask for your costs back?\')]';
    I.see('Do you want to ask for your costs back?', applicatonTypeSelector);
    I.see('Yes', applicatonTypeSelector);
    await I.see('Change', applicatonTypeSelector);
  }

  async orderWanted() {
    const applicatonTypeSelector = '//div[@class=\'govuk-summary-list__row\'][contains(., \'What order do you want the judge to make?\')]';
    I.see('What order do you want the judge to make?', applicatonTypeSelector);
    I.see('Test order', applicatonTypeSelector);
    await I.see('Change', applicatonTypeSelector);
  }

  async reasonsForRequest() {
    const applicatonTypeSelector = '//div[@class=\'govuk-summary-list__row\'][contains(., \'Why are you requesting this order?\')]';
    I.see('Why are you requesting this order?', applicatonTypeSelector);
    I.see('Test order', applicatonTypeSelector);
    await I.see('Change', applicatonTypeSelector);
  }

  async uploadDocument() {
    const applicatonTypeSelector = '//div[@class=\'govuk-summary-list__row\'][contains(., \'Do you want to upload documents to support your application\')]';
    I.see('Do you want to upload documents to support your application?', applicatonTypeSelector);
    I.see('No', applicatonTypeSelector);
    await I.see('Change', applicatonTypeSelector);
  }

  async typeOfHearing() {
    const applicatonTypeSelector = '//div[@class=\'govuk-summary-list__row\'][contains(., \'Choose your preferred type of hearing\')]';
    I.see('Choose your preferred type of hearing', applicatonTypeSelector);
    I.see('In person at the court', applicatonTypeSelector);
    await I.see('Change', applicatonTypeSelector);
  }

  async reasonForTypeOfHearing() {
    const applicatonTypeSelector = '//div[@class=\'govuk-summary-list__row\'][contains(., \'Why would you prefer this type of hearing?\')]';
    I.see('Why would you prefer this type of hearing?', applicatonTypeSelector);
    I.see('In person', applicatonTypeSelector);
    await I.see('Change', applicatonTypeSelector);
  }

  async courtLocation() {
    const applicatonTypeSelector = '//div[@class=\'govuk-summary-list__row\'][contains(., \'Preferred court location\')]';
    I.see('Preferred court location', applicatonTypeSelector);
    I.see('Birmingham Civil and Family Justice Centre', applicatonTypeSelector);
    await I.see('Change', applicatonTypeSelector);
  }

  async phoneNumber() {
    const applicatonTypeSelector = '//div[@class=\'govuk-summary-list__row\'][contains(., \'Preferred telephone number\')]';
    I.see('Preferred telephone number', applicatonTypeSelector);
    I.see('07555655326', applicatonTypeSelector);
    await I.see('Change', applicatonTypeSelector);
  }

  async emailAddress() {
    const applicatonTypeSelector = '//div[@class=\'govuk-summary-list__row\'][contains(., \'Preferred email\')]';
    I.see('Preferred email', applicatonTypeSelector);
    I.see('test@gmail.com', applicatonTypeSelector);
    await I.see('Change', applicatonTypeSelector);
  }

  async unavailableDates() {
    const applicatonTypeSelector = '//div[@class=\'govuk-summary-list__row\'][contains(., \'Dates when you cannot attend a hearing\')]';
    I.see('Dates when you cannot attend a hearing', applicatonTypeSelector);
    await I.see('Change', applicatonTypeSelector);
  }

  async hearingSupport() {
    const applicatonTypeSelector = '//div[@class=\'govuk-summary-list__row\'][contains(., \'Do you need any adjustments or support to attend a hearing?\')]';
    I.see('Do you need any adjustments or support to attend a hearing?', applicatonTypeSelector);
    I.see('No', applicatonTypeSelector);
    await I.see('Change', applicatonTypeSelector);
  }

  async verifyPageText() {
    I.see('Statement of truth', 'h2');
    I.see('The information on this page forms your application.');
    I.see('When you\'re satisfied that your answers are correct, you should tick the box below and write your name to "sign" this statement of truth.');
    I.see('I believe that the facts stated in this application are true.');
    I.see('I understand that proceedings for contempt of court may be brought against anyone who makes, or causes to be made, a false statement in a document verified by a statement of truth without an honest belief in its truth.');
    I.see('Name');
    await I.seeElement('//*[@id="name"]');
  }

  async checkAndSign() {
    await I.click('#signed');
    await I.fillField('#name', 'tester name');
  }
}

module.exports = CheckAndSend;
