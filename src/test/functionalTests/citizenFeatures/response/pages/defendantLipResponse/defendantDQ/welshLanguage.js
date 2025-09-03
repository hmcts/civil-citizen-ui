const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');
const cButtons = require('../../../../../commonComponents/cButtons');

const fields ={
  speakLanguage: 'input[id="speakLanguage"]',
  documentLanguage: 'input[id="documentsLanguage"]',
};

const content = {
  heading: {
    en: 'Welsh language',
    cy: 'Yr iaith Gymraeg',
    both: 'Welsh language',
  },
  descriptionText: {
    en: 'Welsh is an official language of Wales. You can use Welsh in court hearings. Asking to speak in Welsh in your hearing will not delay the hearing or have any effect on proceedings or the outcome of a case.',
    cy: 'Mae’r Gymraeg yn iaith swyddogol yng Nghymru. Gallwch ddefnyddio’r Gymraeg mewn gwrandawiad llys. Ni fydd gofyn am gael siarad Cymraeg yn eich gwrandawiad yn achosi oedi wrth ei drefnu neu’n cael unrhyw effaith ar yr achos neu ganlyniad yr achos.',
    both: 'Welsh is an official language of Wales. You can use Welsh in court hearings. Asking to speak in Welsh in your hearing will not delay the hearing or have any effect on proceedings or the outcome of a case.',
  },
  descriptionTextMediation: {
    en: 'Welsh is an official language of Wales. You can use Welsh in court hearings and at mediation. Asking to speak in Welsh will not delay the hearing or mediation appointment or have any effect on proceedings or the outcome of a case.',
    cy: 'Mae’r Gymraeg yn iaith swyddogol yng Nghymru. Gallwch ddefnyddio\'r Gymraeg mewn gwrandawiadau llys ac wrth gyfryngu. Ni fydd gofyn am gael siarad Cymraeg yn oedi\'r gwrandawiad neu\'r apwyntiad cyfryngu nac yn cael unrhyw effaith ar yr achos neu ganlyniad yr achos.',
    both: 'Welsh is an official language of Wales. You can use Welsh in court hearings and at mediation. Asking to speak in Welsh will not delay the hearing or mediation appointment or have any effect on proceedings or the outcome of a case.',
  },
  hintTextMediation: {
    en: 'This includes the language that you or your representative will speak at mediation.',
    cy: 'Mae hyn yn cynnwys yr iaith y byddwch chi neu\'ch cynrychiolydd yn ei siarad yn y cyfryngu.',
    both: 'This includes the language that you or your representative will speak at mediation.',
  },
  speakLanguageQuestion: {
    en: 'What languages will you, your experts and your witnesses speak at the hearing?',
    cy: 'Pa ieithoedd fyddwch chi, eich arbenigwyr a’ch tystion yn siarad yn y gwrandawiad?',
    both: 'What languages will you, your experts and your witnesses speak at the hearing?',
  },
  documentsLanguageQuestion: {
    en: 'What languages will the documents be provided in?',
    cy: 'Ym mha iaith y darperir y dogfennau?',
    both: 'What languages will the documents be provided in?',
  },
  speakingLanguageOption: {
    en: 'input[id="speakLanguage"]',
    cy: 'input[id="speakLanguage-2"]',
    both: 'input[id="speakLanguage-3"]',
  },
  documentLanguageOption: {
    en: 'input[id="documentsLanguage"]',
    cy: 'input[id="documentsLanguage-2"]',
    both: 'input[id="documentsLanguage-3"]',
  },
};

class WelshLanguage {

  async selectLanguageOption(smallClaims = true) {
    const { language } = sharedData;
    await I.waitForContent(content.heading[language], config.WaitForText);
    if (smallClaims) {
      await I.see(content.descriptionTextMediation[language]);
      await I.see(content.hintTextMediation[language]);
    } else {
      await I.see(content.descriptionText[language]);
    }
    await I.see(content.speakLanguageQuestion[language]);
    !language ? await I.click(fields.speakLanguage) : await I.click(content.speakingLanguageOption[language]);
    await I.see(content.documentsLanguageQuestion[language]);
    !language ? await I.click(fields.documentLanguage) : await I.click(content.documentLanguageOption[language]);
    await I.click(cButtons.saveAndContinue[language]);
  }
}

module.exports = WelshLanguage;
