const I = actor();
const config = require('../../../../../../config');

const fields ={
  speakLanguage: 'input[id="speakLanguage"]',
  documentLanguage: 'input[id="documentsLanguage-2"]',
};

class WelshLanguage {

  async selectLanguageOption() {
    await I.waitForText('Welsh language', config.WaitForText);
    await I.see('Welsh is an official language of Wales. You can use Welsh in court hearings. Asking to speak in Welsh in your hearing will not delay the hearing or have any effect on proceedings or the outcome of a case.');
    await I.see('What languages will you, your experts and your witnesses speak at the hearing?');
    await I.click(fields.speakLanguage);
    await I.see('What languages will the documents be provided in?');
    await I.click(fields.documentLanguage);
    await I.click('Save and continue');
  }
}

module.exports = WelshLanguage;
