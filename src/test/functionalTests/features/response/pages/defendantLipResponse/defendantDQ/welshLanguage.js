const I = actor();

const fields = {
  speak_language_english: 'input[id="speakLanguage"]',
  document_language_english: 'input[id="documentsLanguage"]',
  speak_language_welsh: 'input[id="speakLanguage-2"]',
  document_language_welsh: 'input[id="documentsLanguage-2"]',
};

class WelshLanguage {

  selectLanguageOption(speakOption = 'English', documentOption = 'Welsh') {
    I.see('Welsh language', 'h1');
    I.see('Welsh is an official language of Wales. You can use Welsh in court hearings. Asking to speak in Welsh in your hearing will not delay the hearing or have any effect on proceedings or the outcome of a case.');
    I.see('What languages will you, your experts and your witnesses speak at the hearing?');
    if (speakOption == 'English') {
      I.click(fields.speak_language_english);
    } else {
      I.click(fields.speak_language_welsh);
    }

    if (documentOption == 'English') {
      I.click(fields.document_language_english);
    } else {
      I.click(fields.document_language_welsh);
    }
    I.click('Save and continue');
  }
}

module.exports = WelshLanguage;
