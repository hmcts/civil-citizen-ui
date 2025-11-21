const ContactUs = require('../../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();
let language = 'en';

const content = {
  button: {
    cancel: {
      en: 'Cancel',
      cy: 'Canslo',
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
  duration: {
    title: {
      en: 'Trial duration',
      cy: 'Hyd y treial',
    },
    allocated: {
      en: 'The trial duration originally allocated is 2 and a half hours.',
      cy: 'Hyd y treial a ddyrannwyd yn wreiddiol yw 2 awr a hanner',
    },
    moreTime: {
      en: 'If you think you will need more time for the trial, you will need to liaise with the other party and make an application to the court.',
      cy: 'Os ydych yn credu y bydd angen mwy o amser arnoch ar gyfer y treial, bydd angen i chi gysylltu â’r parti arall a gwneud cais i’r llys',
    },
    noIncrease: {
      en: 'The time allocated for the trial will not be increased until an application is received, the fee paid, and an order made.',
      cy: 'Ni chynyddir yr amser a ddyrennir i’r treial nes ceir y cais, telir y ffi, a gwneir gorchymyn.',
    },
  },
  otherInfo: {
    title: {
      en: 'Other information',
      cy: 'Gwybodaeth arall',
    },
    text: {
      en: 'Is there anything else the court needs to know (optional)?',
      cy: 'A oes unrhyw beth arall y mae angen i’r llys ei wybod (dewisol)?',
    },
    example: {
      en: 'For example, a witness needs to leave the court by 3pm due to caring responsibilities.',
      cy: 'Er enghraifft, mae tyst angen gadael y llys erbyn 3pm oherwydd cyfrifoldebau gofal.',
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
    this.verifyTrialDurationSectionContent();
    this.verifyOtherInformationSectionContent();
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

  verifyTrialDurationSectionContent() {
    I.see(content.duration.title[language],'h2');
    I.see(content.duration.allocated[language]);
    I.see(content.duration.moreTime[language]);
    I.see(content.duration.noIncrease[language]);
  }

  verifyOtherInformationSectionContent() {
    I.see(content.otherInfo.title[language],'h2');
    I.see(content.otherInfo.text[language]);
    I.see(content.otherInfo.example[language]);
  }

  inputDataForTrialDurationOtherInformation() {
    I.fillField('otherInformation','Automation Testing for Other Information of the Trial Arrangement Section......%$£^');
  }
}

module.exports = HasAnythingChanged;
