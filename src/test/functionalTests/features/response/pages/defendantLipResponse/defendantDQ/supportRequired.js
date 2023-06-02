
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

  selectOptionForSupportRequired(option = 'Yes') {
    I.see('Do you, your experts or witnesses need support to attend a hearing', 'h1');
    switch (option) {
      case 'Yes': {
        I.click(fields.yesButton);
        I.selectOption(fields.selectDropDown,'WitnessFName WitnessLName');
        I.click(fields.hearingLoop);
        I.click(fields.signLanguage);
        I.fillField(fields.signLanguageText, 'Spanish');
        break;
      }
      case 'No': {
        I.click(fields.noButton);
        break;
      }
      default:
        I.click(fields.yesButton);
    }
    I.click('Save and continue');
  }
}

module.exports = SupportRequired;
