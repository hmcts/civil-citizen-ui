const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');

const fields = {
  telephoneMediationLink: 'a[href*="telephone-mediation"]',
};

const content = {
  heading: {
    en: 'Telephone mediation',
    cy: 'Cyfryngu dros y ffôn',
  },
  whatHappens: {
    en: 'What happens at mediation?',
    cy: 'Beth fydd yn digwydd mewn',
  },
  whatHappensIf: {
    en: 'What happens if you do not attend your mediation appointment?',
    cy: 'Beth fydd yn digwydd os na fyddwch yn mynychu eich apwyntiad cyfryngu?',
  },
  afterPhoneCall: {
    en: 'After the phone call',
    cy: 'Ar ôl yr alwad ffôn',
  },
  cotinue: {
    en: 'Continue',
    cy: 'Parhau',
  },
};

class TelephoneMediation {

  async selectMediation() {
    const { language } = sharedData; 
    await I.click(fields.telephoneMediationLink);
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.see(content.whatHappens[language]);
    await I.see(content.whatHappensIf[language]);
    await I.see(content.afterPhoneCall[language]);
    await I.click(content.cotinue[language]);
  }
}

module.exports = TelephoneMediation;
