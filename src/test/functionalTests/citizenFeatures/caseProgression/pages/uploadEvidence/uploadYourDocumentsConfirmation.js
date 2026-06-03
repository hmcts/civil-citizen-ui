const ContactUs = require('../../../common/contactUs');
//const StringUtilsComponent = require('../util/StringUtilsComponent');
const I = actor();

const contactUs = new ContactUs();

//const stringUtils = new StringUtilsComponent();

const content = {
  title: {
    en: 'Documents uploaded',
    cy: 'Dogfennau wedi’u huwchlwytho',
  },
  youCan: {
    en: 'You can ',
    cy: 'Gallwch',
  },
  comeBack: {
    en: 'You can upload more documents now or come back later. You can view your documents and the other party\'s documents.',
    cy: 'nawr neu ddychwelyd yn hwyrach ymlaen’. Gallwch weld eich dogfennau chi a dogfennau’r parti arall.',
  },
};

class CheckYourAnswers {

  async nextAction(nextAction) {
    await I.click(nextAction);
  }

  async verifyPageContent(language = 'en') {
    await I.see(content.title[language]);
    await I.see(content.youCan[language]);
    //I.seeElement('[href=\'/case/undefined/case-progression/upload-your-documents\']');
    await I.see(content.comeBack[language]);
    await contactUs.verifyContactUs(language);
  }

}

module.exports = CheckYourAnswers;
