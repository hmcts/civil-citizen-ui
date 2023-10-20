const ContactUs = require('../../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class CheckYourAnswers {

  checkPageFullyLoaded () {
    I.waitForElement('//a[.=\'Cancel\']');
  }

  nextAction (nextAction) {
    I.click(nextAction);
  }

  verifyPageContent() {
    this.checkPageFullyLoaded();
    this.verifyHeadingDetails();
    this.verifyCheckYourAnswersContent();
    contactUs.verifyContactUs();
  }

  verifyHeadingDetails() {
    I.see('You have said this case is not ready for trial', 'h1');
    //I.see('Case reference');
    I.see('Test Inc v Sir John Doe');
  }

  verifyCheckYourAnswersContent() {
    I.see('Is the case ready for trial?');
    I.see('No');
    I.see('Are there any changes to support with access needs or vulnerability for anyone attending a court hearing?');
    I.see('Yes');
    I.see('Autoation Test execution of Trial Arrangeents...%$£');
    I.see('Other information');
    I.see('Autoation Testing for Other Information of the Trial Arrangement Section......%$£^');
  }
}

module.exports = CheckYourAnswers;
