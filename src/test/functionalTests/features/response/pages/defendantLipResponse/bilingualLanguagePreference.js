const I = actor();
const config = require('../../../../../config');

const fields = {
  english: 'input[id="option"]',
  welshAndEnglish: 'input[id="option-2"]',
};

class BilingualLanguagePreference {

  async verifyContent() {
    await I.waitForText('Language', config.WaitForText);
    await I.see('You must choose which language to use to respond to this claim');
    await I.click(fields.english);
    await I.click('Save and continue');
  }

  async verifyContentWelsh() {
    await I.waitForText('Language', config.WaitForText);
    await I.see('You must choose which language to use to respond to this claim');
    await I.click(fields.welshAndEnglish);
    await I.click('Save and continue');
  }

  async verifyContentError() {
    await I.waitForText('Language', config.WaitForText);
    await I.see('You must choose which language to use to respond to this claim');
    await I.click('Save and continue');
    await I.see('There was a problem');
    await I.see('Select Welsh if you want to respond to this claim in Welsh');
  }
}

module.exports = BilingualLanguagePreference;
