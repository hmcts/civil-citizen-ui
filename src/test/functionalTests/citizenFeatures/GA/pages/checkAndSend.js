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

  async verifyPageContent(caseNumber, parties, applicationType) {
    this.checkPageFullyLoaded();
    this.verifyBreadcrumbs();
    this.verifyHeadingDetails(applicationType, caseNumber, parties);
    this.applicationType(applicationType);
    this.additionalApplication();
    this.partiesAgreed();
    this.informOtherParties();
    this.costsBack();
    this.orderWanted();
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
    I.see('Case number: ' + caseNumber);
    I.see(parties);
  }

  async applicationType(applicationType) {
    I.see('Application type', '(//div[@class=\'govuk-summary-list__row\'])[1]');
    I.see(applicationType, '(//div[@class=\'govuk-summary-list__row\'])[1]');
    await I.see('Change', '(//div[@class=\'govuk-summary-list__row\'])[1]');
  }

  async additionalApplication() {
    I.see('Do you want to add another application?', '(//div[@class=\'govuk-summary-list__row\'])[2]');
    I.see('No', '(//div[@class=\'govuk-summary-list__row\'])[2]');
    await I.see('Change', '(//div[@class=\'govuk-summary-list__row\'])[2]');
  }

  async partiesAgreed() {
    I.see('Have the other parties agreed?', '(//div[@class=\'govuk-summary-list__row\'])[3]');
    I.see('No', '(//div[@class=\'govuk-summary-list__row\'])[3]');
    await I.see('Change', '(//div[@class=\'govuk-summary-list__row\'])[3]');
  }

  async informOtherParties() {
    I.see('Do you want the court to inform the other parties?', '(//div[@class=\'govuk-summary-list__row\'])[4]');
    I.see('No', '(//div[@class=\'govuk-summary-list__row\'])[4]');
    await I.see('Change', '(//div[@class=\'govuk-summary-list__row\'])[4]');
    I.see('Why do you not want the court to inform the other parties?', '(//div[@class=\'govuk-summary-list__row\'])[5]');
    I.see('Do not need to inform', '(//div[@class=\'govuk-summary-list__row\'])[5]');
    await I.see('Change', '(//div[@class=\'govuk-summary-list__row\'])[5]');
  }

  async costsBack() {
    I.see('Do you want to ask for your costs back?', '(//div[@class=\'govuk-summary-list__row\'])[6]');
    I.see('Yes', '(//div[@class=\'govuk-summary-list__row\'])[6]');
    await I.see('Change', '(//div[@class=\'govuk-summary-list__row\'])[6]');
  }

  async orderWanted() {
    I.see('What order do you want the judge to make?', '(//div[@class=\'govuk-summary-list__row\'])[7]');
    I.see('Test order', '(//div[@class=\'govuk-summary-list__row\'])[7]');
    await I.see('Change', '(//div[@class=\'govuk-summary-list__row\'])[7]');
  }

  async reasonsForRequest() {
    I.see('Why are you requesting this order?', '(//div[@class=\'govuk-summary-list__row\'])[8]');
    I.see('Test order', '(//div[@class=\'govuk-summary-list__row\'])[8]');
    await I.see('Change', '(//div[@class=\'govuk-summary-list__row\'])[8]');
  }

  async uploadDocument() {
    I.see('Do you want to upload documents to support your application?', '(//div[@class=\'govuk-summary-list__row\'])[9]');
    I.see('No', '(//div[@class=\'govuk-summary-list__row\'])[9]');
    await I.see('Change', '(//div[@class=\'govuk-summary-list__row\'])[9]');
  }

  async typeOfHearing() {
    I.see('Choose your preferred type of hearing', '(//div[@class=\'govuk-summary-list__row\'])[10]');
    I.see('In person at the court', '(//div[@class=\'govuk-summary-list__row\'])[10]');
    await I.see('Change', '(//div[@class=\'govuk-summary-list__row\'])[10]');
  }

  async reasonForTypeOfHearing() {
    I.see('Why would you prefer this type of hearing?', '(//div[@class=\'govuk-summary-list__row\'])[11]');
    I.see('In person', '(//div[@class=\'govuk-summary-list__row\'])[11]');
    await I.see('Change', '(//div[@class=\'govuk-summary-list__row\'])[11]');
  }

  async courtLocation() {
    I.see('Preferred court location', '(//div[@class=\'govuk-summary-list__row\'])[12]');
    I.see('Birmingham Civil and Family Justice Centre', '(//div[@class=\'govuk-summary-list__row\'])[12]');
    await I.see('Change', '(//div[@class=\'govuk-summary-list__row\'])[12]');
  }

  async phoneNumber() {
    I.see('Preferred telephone number', '(//div[@class=\'govuk-summary-list__row\'])[13]');
    I.see('07555655326', '(//div[@class=\'govuk-summary-list__row\'])[13]');
    await I.see('Change', '(//div[@class=\'govuk-summary-list__row\'])[13]');
  }

  async emailAddress() {
    I.see('Preferred email', '(//div[@class=\'govuk-summary-list__row\'])[14]');
    I.see('test@gmail.com', '(//div[@class=\'govuk-summary-list__row\'])[14]');
    await I.see('Change', '(//div[@class=\'govuk-summary-list__row\'])[14]');
  }

  async unavailableDates() {
    I.see('Dates when you cannot attend a hearing', '(//div[@class=\'govuk-summary-list__row\'])[15]');
    await I.see('Change', '(//div[@class=\'govuk-summary-list__row\'])[15]');
  }

  async hearingSupport() {
    I.see('Do you need any adjustments or support to attend a hearing?', '(//div[@class=\'govuk-summary-list__row\'])[16]');
    I.see('No', '(//div[@class=\'govuk-summary-list__row\'])[16]');
    await I.see('Change', '(//div[@class=\'govuk-summary-list__row\'])[16]');
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
