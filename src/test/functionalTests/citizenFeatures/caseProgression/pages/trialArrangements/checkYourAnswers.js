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
    this.verifyCheckYourAnswersContent();
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
    I.see('Check your answers', 'h1');
    I.see(content.heading.number[language]);
    I.see(content.heading.amount[language]);
  }

  verifyCheckYourAnswersContent(readyForTrial) {
    I.see(content.caseReady.title[language]);
    if (readyForTrial==='no'){
      I.see(content.caseReady.no[language]);
    } else {
      I.see(content.caseReady.yes[language]);
    }
    I.see(content.anyChange.title[language]);
    I.see(content.anyChange.yes[language]);
    I.see('Automation Test execution of Trial Arrangements...%$£');
    I.see(content.otherInfo.title[language]);
    I.see('Automation Testing for Other Information of the Trial Arrangement Section......%$£^');
  }
}

module.exports = CheckYourAnswers;
