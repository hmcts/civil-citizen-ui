const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class Documents {

  open(claimRef, claimType) {
    I.amOnPage('/dashboard/' + claimRef + '/defendant');
    this.verifyLatestUpdatePageContent(claimType);
  }

  nextAction(nextAction) {
    I.click(nextAction);
  }

  verifyLatestUpdatePageContent() {
    this.verifyHeadingDetails();
    this.verifyNoticesAndOrdersSectionContent();
    contactUs.verifyContactUs();
  }

  verifyHeadingDetails() {
    I.see('Test Inc v Sir John Doe', 'h1');
    I.see('Claim number: ');
    I.see('Updates');
    I.see('Notices and orders');
    I.see('Documents');
  }

  verifyNoticesAndOrdersSectionContent() {
    I.see('Claim documents', 'h3');
    I.seeElement('//a[contains(.,\'Trial_Arrangements.pdf\')]');
  }
}

module.exports = Documents;
