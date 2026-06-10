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
  caseReady: {
    title: {
      en: 'Is the case ready for trial?',
      cy: 'A yw’r achos yn barod ar gyfer treial?',
    },
    yes: {
      en: 'Yes',
      cy: 'Ydy',
    },
    no: {
      en: 'No',
      cy: 'Nac ydy',
    },
  },
  anyChange: {
    title: {
      en: 'Are there any changes to support with access needs or vulnerability for anyone attending a court hearing?',
      cy: 'A oes unrhyw newidiadau i’r cymorth o ran anghenion mynediad neu fregusrwydd i unrhyw un sy’n mynychu gwrandawiad llys?',
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
  otherInfo: {
    title: {
      en: 'Other information',
      cy: 'Gwybodaeth arall',
    },
  },
};

class CheckYourAnswers {

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
    await this.verifyCheckYourAnswersContent();
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
    await I.see('Check your answers', 'h1');
    await I.see(content.heading.number[language]);
    await I.see(content.heading.amount[language]);
  }

  async verifyCheckYourAnswersContent(readyForTrial) {
    await I.see(content.caseReady.title[language]);
    if (readyForTrial==='no'){
      await I.see(content.caseReady.no[language]);
    } else {
      await I.see(content.caseReady.yes[language]);
    }
    await I.see(content.anyChange.title[language]);
    await I.see(content.anyChange.yes[language]);
    await I.see('Automation Test execution of Trial Arrangements...%$£');
    await I.see(content.otherInfo.title[language]);
    await I.see('Automation Testing for Other Information of the Trial Arrangement Section......%$£^');
  }
}

module.exports = CheckYourAnswers;
