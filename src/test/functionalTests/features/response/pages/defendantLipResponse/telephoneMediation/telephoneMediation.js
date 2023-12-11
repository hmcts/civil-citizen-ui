const I = actor();
const config = require('../../../../../../config');

const fields = {
  telephoneMediationLink: 'a[href*="telephone-mediation"]',
};

class TelephoneMediation {

  async selectMediation() {
    await I.click(fields.telephoneMediationLink);
    await I.waitForText('Telephone mediation', config.WaitForText);
    await I.see('What happens at mediation?');
    await I.see('What happens if you do not attend your mediation appointment?');
    await I.see('After the phone call');
    await I.click('Continue');
  }
}

module.exports = TelephoneMediation;
