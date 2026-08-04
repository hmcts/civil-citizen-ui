const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class ResponseCheckAndSend {

  async checkPageFullyLoaded () {
    await I.waitForElement('//a[.=\'Cancel\']');
  }

  async nextAction (nextAction) {
    await I.click(nextAction);
  }

  async verifyPageContent(caseNumber, parties, applicationType, communicationType) {
    await this.checkPageFullyLoaded();
    await this.verifyBreadcrumbs();
    await this.verifyHeadingDetails(applicationType, caseNumber, parties);
    await this.agreeToOrder(communicationType);
    await this.uploadDocument();
    await this.typeOfHearing();
    await this.reasonForTypeOfHearing();
    await this.courtLocation();
    await this.phoneNumber();
    await this.emailAddress();
    await this.unavailableDates();
    await this.hearingSupport();
    await this.verifyPageText();
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

  async agreeToOrder() {
    const applicatonTypeSelector = '//div[@class=\'govuk-summary-list__row\'][contains(., \'Do you agree that the court should make the order that the other parties have requested?\')]';
    await I.see('Do you agree that the court should make the order that the other parties have requested?', applicatonTypeSelector);
    await I.see('Yes', applicatonTypeSelector);
    await I.see('Change', applicatonTypeSelector);
  }

  async uploadDocument() {
    const applicatonTypeSelector = '//div[@class=\'govuk-summary-list__row\'][contains(., \'Do you want to upload documents to support your response?\')]';
    await I.see('Do you want to upload documents to support your response?', applicatonTypeSelector);
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
    await I.see('The information on this page forms your response to the application.');
    await I.see('When you\'re satisfied that your answers are correct, you should tick the box below and write your name to "sign" this statement of truth.');
    await I.see('I believe that the facts stated in this response form are true.');
    await I.see('I understand that proceedings for contempt of court may be brought against anyone who makes, or causes to be made, a false statement in a document verified by a statement of truth without an honest belief in its truth.');
    await I.see('Name');
    await I.seeElement('//*[@id="name"]');
  }

  async checkAndSign() {
    await I.click('#signed');
    await I.fillField('#name', 'tester name');
  }
}

module.exports = ResponseCheckAndSend;
