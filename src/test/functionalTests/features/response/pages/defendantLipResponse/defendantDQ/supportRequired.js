const I = actor();
const config = require('../../../../../../config');

const fields ={
  yesButton: 'input[id="model[option]"]',
  noButton: 'input[id="model[option]-2"]',
  selectDropDown: 'select[id="model[items][0][fullName]"]',
  hearingLoop: 'input[id="declared-0-hearingLoop"]',
  signLanguage: 'input[id="declared-0-signLanguageInterpreter"]',
  signLanguageText: 'input[id="model[items][0][signLanguageInterpreter][content]"]',
};

class SupportRequired {

  async selectOptionForSupportRequired() {
    await I.waitForText('Do you, your experts or witnesses need support to attend a hearing', config.WaitForText);
    await I.click(fields.yesButton);
    await I.selectOption(fields.selectDropDown,'WitnessFName WitnessLName');
    await I.click(fields.hearingLoop);
    await I.click(fields.signLanguage);
    await I.fillField(fields.signLanguageText, 'Spanish');
    await I.click('Save and continue');
  }
}

module.exports = SupportRequired;
