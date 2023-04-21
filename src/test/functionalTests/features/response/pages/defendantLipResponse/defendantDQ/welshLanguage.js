
const I = actor();

const fields ={
  speakLanguage: 'input[id="speakLanguage"]',
  documentLanguage: 'input[id="documentsLanguage-2"]',
};

class WelshLanguage {

  selectLanguageOption() {
    I.see('Welsh language', 'h1');
    I.see('Welsh is an official language of Wales. You can use Welsh in court hearings. Asking to speak in Welsh in your hearing will not delay the hearing or have any effect on proceedings or the outcome of a case.');
    I.see('What languages will you, your experts and your witnesses speak at the hearing?');
    I.click(fields.speakLanguage);
    I.see('What languages will the documents be provided in?');
    I.click(fields.documentLanguage);
    I.click('Save and continue');
  }
}

module.exports = WelshLanguage;
