const I = actor();

const fields = {
  english: 'input[id="option"]',
  welshAndEnglish: 'input[id="option-2"]',
};

class BilingualLanguagePreference {

  verifyContent() {
    I.see('Do you want to respond to this claim in Welsh?');
    I.see('You can respond to this claim in Welsh. After you\'ve submitted your response, anything else you may have to do relating to the claim will be in English. You\'ll receive emails and letters in English.');
    I.click(fields.english);
    I.click('Save and continue');
  }
}

module.exports = BilingualLanguagePreference;
