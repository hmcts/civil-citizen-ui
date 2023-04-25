
const I = actor();

const fields ={
  yesButton: 'input[id="model[option]"]',
  noButton: 'input[id="model[option]-2"]',
  selectDropDown: 'select[id="model[items][0][fullName]"]',
  hearingLoop: 'input[id="declared-0-hearingLoop"]',
  signLanguage: 'input[id="declared-0-signLanguageInterpreter"]',
  signLanguageText: 'input[id="model[items][0][signLanguageInterpreter][content]"]',
};

class SupportRequired {

  selectOptionForSupportRequired() {
    I.see('Do you, your experts or witnesses need support to attend a hearing', 'h1');
    I.click(fields.yesButton);
    I.selectOption(fields.selectDropDown,'WitnessFName WitnessLName');
    I.click(fields.hearingLoop);
    I.click(fields.signLanguage);
    I.fillField(fields.signLanguageText, 'Spanish');
    I.click('Save and continue');
  }
}

module.exports = SupportRequired;
