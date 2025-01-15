const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class ResponseCheckAndSend {

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
    this.agreeToOrder(communicationType);
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

  async agreeToOrder() {
    const applicatonTypeSelector = '//div[@class=\'govuk-summary-list__row\'][contains(., \'Do you agree that the court should make the order that the other parties have requested?\')]';
    I.see('Do you agree that the court should make the order that the other parties have requested?', applicatonTypeSelector);
    I.see('Yes', applicatonTypeSelector);
    await I.see('Change', applicatonTypeSelector);
  }

  async uploadDocument() {
    const applicatonTypeSelector = '//div[@class=\'govuk-summary-list__row\'][contains(., \'Do you want to upload documents to support your response?\')]';
    I.see('Do you want to upload documents to support your response?', applicatonTypeSelector);
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
    const applicatonTypeSelector = '//div[@class=\'govuk-summary-list__row\'][contains(., \'Preferred location\')]';
    I.see('Preferred location', applicatonTypeSelector);
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
    const applicatonTypeSelector = '//div[@class=\'govuk-summary-list__row\'][contains(., \'Are there any dates when you cannot attend a hearing within the next 3 months\')]';
    I.see('Are there any dates when you cannot attend a hearing within the next 3 months', applicatonTypeSelector);
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
    I.see('The information on this page forms your response to the application.');
    I.see('When you\'re satisfied that your answers are correct, you should tick the box below and write your name to "sign" this statement of truth.');
    I.see('I believe that the facts stated in this response form are true.');
    I.see('I understand that proceedings for contempt of court may be brought against anyone who makes, or causes to be made, a false statement in a document verified by a statement of truth without an honest belief in its truth.');
    I.see('Name');
    await I.seeElement('//*[@id="name"]');
  }

  async checkAndSign() {
    await I.click('#signed');
    await I.fillField('#name', 'tester name');
  }
}

module.exports = ResponseCheckAndSend;
