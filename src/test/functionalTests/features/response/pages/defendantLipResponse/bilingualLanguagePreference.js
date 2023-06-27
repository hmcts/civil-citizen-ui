const I = actor();

const fields = {
  english: 'input[id="option"]',
  welshAndEnglish: 'input[id="option-2"]',
};

class BilingualLanguagePreference {

  async verifyContent() {
    await I.see('Do you want to respond to this claim in Welsh?');
    await I.see('You can respond to this claim in Welsh. After you\'ve submitted your response, anything else you may have to do relating to the claim will be in English. You\'ll receive emails and letters in English.');
    await I.click(fields.english);
    await I.click('Save and continue');
  }
}

module.exports = BilingualLanguagePreference;
