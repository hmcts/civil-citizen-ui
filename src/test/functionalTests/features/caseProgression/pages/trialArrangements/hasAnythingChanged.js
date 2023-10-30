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
    this.verifyHasAnythingChangedSectionContent();
    contactUs.verifyContactUs();
  }

  verifyHeadingDetails() {
    I.see('Finalise your trial arrangements', 'h1');
    //I.see('Case reference');
    I.see('Test Inc v Sir John Doe');
  }

  verifyHasAnythingChangedSectionContent() {
    I.see('Has anything changed to the support or adjustments you wish the court and the judge to consider for you, or a witness who will give evidence on your behalf?','h3');
    I.see('You can check your previous answers in the');
    I.seeElement('//a[.=\'directions questionnaire.\']');
    I.see('Yes');
    I.see('No');
  }

  inputDataForHasAnythingChangedSection() {
    I.click('//input[@id=\'option\']');
    I.see('What support do you, experts or witnesses need?');
    I.see('For example, a witness requires a courtroom with step-free access.');
    I.fillField('textArea','Autoation Test execution of Trial Arrangeents...%$£');
  }
}

module.exports = HasAnythingChanged;
