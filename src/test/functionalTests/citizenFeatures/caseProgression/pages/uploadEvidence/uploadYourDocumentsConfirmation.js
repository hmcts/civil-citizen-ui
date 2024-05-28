const ContactUs = require('../../../common/contactUs');
//const StringUtilsComponent = require('../util/StringUtilsComponent');
const I = actor();

const contactUs = new ContactUs();

//const stringUtils = new StringUtilsComponent();

class CheckYourAnswers {

  nextAction(nextAction) {
    I.click(nextAction);
  }

  verifyPageContent() {
    I.see('Documents uploaded');
    I.see('You can');
    //I.seeElement('[href=\'/case/undefined/case-progression/upload-your-documents\']');
    I.see('now or come back later. You can view your documents and the other party\'s documents.');
    contactUs.verifyContactUs();
  }

}

module.exports = CheckYourAnswers;
