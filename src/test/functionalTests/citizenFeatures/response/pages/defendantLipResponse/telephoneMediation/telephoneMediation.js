const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');
const cButtons = require('../../../../../commonComponents/cButtons');

const fields = {
  telephoneMediationLink: 'a[href*="telephone-mediation"]',
};

const content = {
  heading: {
    en: 'Telephone mediation',
    cy: 'Cyfryngu dros y ffôn',
  },

  subHeading_what_happens_at_mediation: {
    en: 'What happens at mediation?',
    cy: 'Beth fydd yn digwydd mewn sesiwn cyfryngu?',
  },

  subHeading_what_happens_if_you_do_not_attend_mediation: {
    en: 'What happens if you do not attend your mediation appointment?',
    cy: 'Beth fydd yn digwydd mewn sesiwn cyfryngu?',
  },

  subHeading_phone_call: {
    en: 'After the phone call',
    cy: 'Ar ôl yr alwad ffôn',
  },
};

class TelephoneMediation {

  async selectMediation() {
    await I.click(fields.telephoneMediationLink);
    const { language } = sharedData;
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.see(content.subHeading_what_happens_at_mediation[language]);
    await I.see(content.subHeading_what_happens_if_you_do_not_attend_mediation[language]);
    await I.see(content.subHeading_phone_call[language]);
    await this.clickContinue();
  }

  async clickContinue(){
    await I.click(cButtons.continue[sharedData.language]);
  }
}

module.exports = TelephoneMediation;
