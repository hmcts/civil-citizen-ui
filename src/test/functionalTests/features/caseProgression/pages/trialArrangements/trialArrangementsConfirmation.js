const ContactUs = require('../../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class CheckYourAnswers {

  checkPageFullyLoaded () {
    I.waitForElement('//a[contains(.,\'Return to case details\')]');
  }

  nextAction (nextAction) {
    I.click(nextAction);
  }

  verifyPageContent() {
    this.checkPageFullyLoaded();
    this.verifyHeadingDetails();
    this.verifyConfirmationSectionContent();
    contactUs.verifyContactUs();
  }

  verifyHeadingDetails() {
    I.see('You have said this case is not ready for trial', 'h1');
  }

  verifyConfirmationSectionContent() {
    I.see('What happens next');
    I.see('The trial will go ahead as planned on the specified date unless a judge makes an order changing the date of the trial.');
    I.see('If you want the date of the trial to be changed (or any other order to make the case ready for trial) you will need to');
    I.seeElement('//a[.=\'make an application\']');
    I.see('to the court and pay the appropriate fee.');
    I.see('For any changes to accessibility requirements between now and the trial date you will need to call 0300 123 7050.');
    I.see('You can view your and the other party\'s trial arrangements under');
    I.seeElement('//a[.=\'Notices and orders\']');
  }
}

module.exports = CheckYourAnswers;
