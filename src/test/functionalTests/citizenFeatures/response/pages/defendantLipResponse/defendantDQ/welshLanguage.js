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
  descriptionTextMediation: {
    en: 'Welsh is an official language of Wales. You can use Welsh in court hearings and at mediation. Asking to speak in Welsh will not delay the hearing or mediation appointment or have any effect on proceedings or the outcome of a case.',
    cy: 'Mae’r Gymraeg yn iaith swyddogol yng Nghymru. Gallwch ddefnyddio\'r Gymraeg mewn gwrandawiadau llys ac wrth gyfryngu. Ni fydd gofyn am gael siarad Cymraeg yn oedi\'r gwrandawiad neu\'r apwyntiad cyfryngu nac yn cael unrhyw effaith ar yr achos neu ganlyniad yr achos.',
  },
  hintTextMediation: {
    en: 'This includes the language that you or your representative will be speak at mediation.',
    cy: 'Mae hyn yn cynnwys yr iaith y byddwch chi neu\'ch cynrychiolydd yn ei siarad yn yr apwyntiad cyfryngu',
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

  async selectLanguageOption(carmEnabled = false) {
    const { language } = sharedData;
    await I.waitForContent(content.heading[language], config.WaitForText);
    if (carmEnabled) {
      await I.see(content.descriptionTextMediation[language]);
      await I.see(content.hintTextMediation[language]);
    } else {
      await I.see(content.descriptionText[language]);
    }
    await I.see(content.speakLanguageQuestion[language]);
    await I.click(fields.speakLanguage);
    await I.see(content.documentsLanguageQuestion[language]);
    await I.click(fields.documentLanguage);
    await I.click(cButtons.saveAndContinue[language]);
  }
}

module.exports = WelshLanguage;
