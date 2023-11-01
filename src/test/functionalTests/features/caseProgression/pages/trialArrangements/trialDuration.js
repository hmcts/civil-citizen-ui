const ContactUs = require('../../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class HasAnythingChanged {

  checkPageFullyLoaded () {
    I.waitForElement('//a[.=\'Cancel\']');
  }

  nextAction (nextAction) {
    I.click(nextAction);
  }

  verifyPageContent() {
    this.checkPageFullyLoaded();
    this.verifyHeadingDetails();
    this.verifyTrialDurationSectionContent();
    this.verifyOtherInformationSectionContent();
    contactUs.verifyContactUs();
  }

  verifyHeadingDetails() {
    I.see('Finalise your trial arrangements', 'h1');
    //I.see('Case reference');
    I.see('Test Inc v Sir John Doe');
  }

  verifyTrialDurationSectionContent() {
    I.see('Trial duration','h3');
    I.see('The trial duration originally allocated is 2 and a half hours.');
    I.see('If you think you will need more time for the trial, you will need to liaise with the other party and make an application to the court.');
    I.see('The time allocated for the trial will not be increased until an application is received, the fee paid, and an order made.');
  }

  verifyOtherInformationSectionContent() {
    I.see('Other information','h3');
    I.see('Is there anything else the court needs to know (optional)?');
    I.see('For example, a witness needs to leave the court by 3pm due to caring responsibilities.');
  }

  inputDataForTrialDurationOtherInformation() {
    I.fillField('otherInformation','Autoation Testing for Other Information of the Trial Arrangement Section......%$£^');
  }
}

module.exports = HasAnythingChanged;
