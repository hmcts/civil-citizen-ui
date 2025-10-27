const I = actor();
const config = require('../../../../../../config');
//const ContactUs = require('../../../../common/contactUs');
const sharedData = require('../../../../../sharedData');
const cButtons = require('../../../../../commonComponents/cButtons');

//const contactUs = new ContactUs();

const fields = {
  yesButton: 'input[value="yes"]',
};

const content = {

  heading_are_there_any_dates_in_the_next_3_months: {
    en: 'Are there any dates in the next 3 months when you cannot attend mediation?',
    cy: 'A oes unrhyw ddyddiadau yn y 3 mis nesaf lle na allwch fynychu apwyntiad cyfryngu?',
  },

};

class NextThreeMonthsDate {

  async enterNextThreeMonthsDate() {
    const { language } = sharedData;
    await I.waitForContent(content.heading_are_there_any_dates_in_the_next_3_months[language], config.WaitForText);
    await I.click(fields.yesButton);
    //await contactUs.verifyContactUs('cy');
    await this.clickSaveAndContinue();
  }

  async clickSaveAndContinue(){
    await I.click(cButtons.saveAndContinue[sharedData.language]);
  }
}

module.exports = NextThreeMonthsDate;
