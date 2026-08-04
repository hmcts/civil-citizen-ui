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

  async checkPageFullyLoaded () {
    await I.waitForElement(`//a[.='${content.button.cancel[language]}']`);
  }

  async nextAction (nextAction) {
    await I.click(nextAction);
  }

  async verifyPageContent(caseNumber, claimAmount, languageChosen = 'en') {
    language = languageChosen;
    await this.checkPageFullyLoaded();
    await this.verifyBreadcrumbs();
    await this.verifyHeadingDetails();
    await this.verifyCaseNumberClaimAmount(caseNumber, claimAmount);
    await this.verifyHasAnythingChangedSectionContent();
    await contactUs.verifyContactUs();
  }

  async verifyBreadcrumbs() {
    await I.see('Back', '//a[@class="govuk-back-link"]');
  }

  async verifyCaseNumberClaimAmount(caseNumber, claimAmount) {
    await I.see('Case number: ' + caseNumber, 'h2');
    await I.see('Claim amount: ' + claimAmount, 'h2');
  }

  async verifyHeadingDetails() {
    await I.see(content.heading.title[language], 'h1');
    await I.see(content.heading.number[language]);
    await I.see(content.heading.amount[language]);
  }

  async verifyHasAnythingChangedSectionContent() {
    await I.see(content.anythingChanged.title[language],'h2');
    await I.see(content.anythingChanged.previousAnswers[language]);
    await I.seeElement(`//a[.='${content.anythingChanged.directionsQuestionnaire[language]}']`);
    await I.see(content.button.yes[language]);
    await I.see(content.button.no[language]);
  }

  async inputDataForHasAnythingChangedSection() {
    await I.click('//input[@id=\'option\']');
    await I.see(content.anythingChanged.whatSupport[language]);
    await I.see(content.anythingChanged.example[language]);
    await I.fillField('textArea','Automation Test execution of Trial Arrangements...%$£');
  }
}

module.exports = HasAnythingChanged;
