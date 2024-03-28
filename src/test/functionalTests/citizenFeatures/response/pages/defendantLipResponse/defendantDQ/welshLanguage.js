const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');
const cButtons = require('../../../../../commonComponents/cButtons');

const fields ={
  speakLanguage: 'input[id="speakLanguage"]',
  documentLanguage: 'input[id="documentsLanguage-2"]',
};

const content = {
  heading: {
    en: 'Welsh language',
    cy: 'Yr iaith Gymraeg',
  },
  descriptionText: {
    en: 'Welsh is an official language of Wales. You can use Welsh in court hearings. Asking to speak in Welsh in your hearing will not delay the hearing or have any effect on proceedings or the outcome of a case.',
    cy: 'Mae’r Gymraeg yn iaith swyddogol yng Nghymru. Gallwch ddefnyddio’r Gymraeg mewn gwrandawiad llys. Ni fydd gofyn am gael siarad Cymraeg yn eich gwrandawiad yn achosi oedi wrth ei drefnu neu’n cael unrhyw effaith ar yr achos neu ganlyniad yr achos.',
  },
  speakLanguageQuestion: {
    en: 'What languages will you, your experts and your witnesses speak at the hearing?',
    cy: 'Pa ieithoedd fyddwch chi, eich arbenigwyr a’ch tystion yn siarad yn y gwrandawiad?',
  },
  documentsLanguageQuestion: {
    en: 'What languages will the documents be provided in?',
    cy: 'Ym mha iaith y darperir y dogfennau?',
  },
};

class WelshLanguage {

  async selectLanguageOption() {
    const { language } = sharedData; 
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.see(content.descriptionText[language]);
    await I.see(content.speakLanguageQuestion[language]);
    await I.click(fields.speakLanguage);
    await I.see(content.documentsLanguageQuestion[language]);
    await I.click(fields.documentLanguage);
    await I.click(cButtons.saveAndContinue[language]);
  }
}

module.exports = WelshLanguage;
