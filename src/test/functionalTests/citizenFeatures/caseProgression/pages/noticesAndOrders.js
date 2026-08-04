const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class Documents {

  async open(claimRef, claimType) {
    await I.amOnPage('/dashboard/' + claimRef + '/defendant');
    await this.verifyLatestUpdatePageContent(claimType);
  }

  async nextAction(nextAction) {
    await I.click(nextAction);
  }

  async verifyLatestUpdatePageContent() {
    await this.verifyHeadingDetails();
    await this.verifyNoticesAndOrdersSectionContent();
    await contactUs.verifyContactUs();
  }

  async verifyHeadingDetails() {
    await I.see('Test Inc v Sir John Doe', 'h1');
    await I.see('Claim number: ');
    await I.see('Updates');
    await I.see('Notices and orders');
    await I.see('Documents');
  }

  async verifyNoticesAndOrdersSectionContent() {
    await I.see('Claim documents', 'h3');
    await I.seeElement('//a[contains(.,\'Trial_Arrangements.pdf\')]');
  }
}

module.exports = Documents;
