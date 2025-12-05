const ContactUs = require('../../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();
let language = 'en';

const content ={
  button: {
    cancel: {
      en: 'Cancel',
      cy: 'Canslo',
    },
    yes: {
      en: 'Yes',
      cy: 'Oes',
    },
    no: {
      en: 'No',
      cy: 'Nac oes',
    },
  },
  heading: {
    title: {
      en: 'Finalise your trial arrangements',
      cy: 'Cwblhau trefniadau eich treial',
    },
    number: {
      en: 'Case number',
      cy: 'Rhif yr achos',
    },
    amount: {
      en: 'Claim amount',
      cy: 'Swm yr hawliad',
    },
  },
  anythingChanged: {
    title: {
      en: 'Has anything changed to the support or adjustments you wish the court and the judge to consider for you, or a witness who will give evidence on your behalf?',
      cy: 'A oes unrhyw beth wedi newid i’r cymorth neu’r addasiadau rydych yn dymuno i’r llys a’r barnwr eu hystyried ar eich rhan neu i dyst a fydd yn rhoi tystiolaeth ar eich rhan?',
    },
    previousAnswers: {
      en: 'You can check your previous answers in the',
      cy: 'Gallwch wirio eich atebion blaenorol yn yr',
    },
    directionsQuestionnaire: {
      en: 'directions questionnaire',
      cy: 'holiadur cyfarwyddiadau.',
    },
    whatSupport: {
      en: 'What support do you, experts or witnesses need?',
      cy: 'Pa gymorth sydd ei angen arnoch chi, eich arbenigwyr neu dystion?',
    },
    example: {
      en: 'For example, a witness requires a courtroom with step-free access.',
      cy: 'Er enghraifft, mae tyst angen ystafell llys heb risiau.',
    },
  },
};

class HasAnythingChanged {

  checkPageFullyLoaded () {
    I.waitForElement(`//a[.='${content.button.cancel[language]}']`);
  }

  nextAction (nextAction) {
    I.click(nextAction);
  }

  verifyPageContent(caseNumber, claimAmount, languageChosen = 'en') {
    language = languageChosen;
    this.checkPageFullyLoaded();
    this.verifyBreadcrumbs();
    this.verifyHeadingDetails();
    this.verifyCaseNumberClaimAmount(caseNumber, claimAmount);
    this.verifyHasAnythingChangedSectionContent();
    contactUs.verifyContactUs();
  }

  verifyBreadcrumbs() {
    I.see('Back', '//a[@class="govuk-back-link"]');
  }

  verifyCaseNumberClaimAmount(caseNumber, claimAmount) {
    I.see('Case number: ' + caseNumber, 'h2');
    I.see('Claim amount: ' + claimAmount, 'h2');
  }

  verifyHeadingDetails() {
    I.see(content.heading.title[language], 'h1');
    I.see(content.heading.number[language]);
    I.see(content.heading.amount[language]);
  }

  verifyHasAnythingChangedSectionContent() {
    I.see(content.anythingChanged.title[language],'h2');
    I.see(content.anythingChanged.previousAnswers[language]);
    I.seeElement(`//a[.='${content.anythingChanged.directionsQuestionnaire[language]}']`);
    I.see(content.button.yes[language]);
    I.see(content.button.no[language]);
  }

  inputDataForHasAnythingChangedSection() {
    I.click('//input[@id=\'option\']');
    I.see(content.anythingChanged.whatSupport[language]);
    I.see(content.anythingChanged.example[language]);
    I.fillField('textArea','Automation Test execution of Trial Arrangements...%$£');
  }
}

module.exports = HasAnythingChanged;
