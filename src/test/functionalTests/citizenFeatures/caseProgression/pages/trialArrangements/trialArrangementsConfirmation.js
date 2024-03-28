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

  verifyHeadingDetails(readyForTrial) {
    if (readyForTrial==='no'){
      I.see('You have said this case is not ready for trial', 'h1');
    }
    if (readyForTrial==='yes'){
      I.see('You have said this case is ready for trial', 'h1');
    }
  }

  verifyConfirmationSectionContent(readyForTrial) {
    I.see('What happens next');
    if (readyForTrial==='no') {
      I.see('The trial will go ahead as planned on the specified date unless a judge makes an order changing the date of the trial.');
      I.see('If you want the date of the trial to be changed (or any other order to make the case ready for trial) you will need to');
      I.see('to the court and pay the appropriate fee.');
      I.see('For any changes to accessibility requirements between now and the trial date you will need to call 0300 123 7050.');
    }
    if (readyForTrial==='yes'){
      I.see('If there are any changes to the arrangements between now and the trial date you will need to');
      I.see('as soon as possible and pay the appropriate fee.');
      I.see('For any changes to accessibility requirements between now and the trial date you will need to phone the court on 0300 123 7050.');
    }
    I.seeElement('//a[.=\'make an application\']');
    I.see('You can view your and the other party\'s trial arrangements under');
    I.seeElement('//a[.=\'Notices and orders\']');
    I.see('in the case details');
  }
}

module.exports = CheckYourAnswers;
