const ContactUs = require('../../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();
let language = 'en';

const content = {
  buttons: {
    cancel: {
      en: 'Cancel',
      cy: 'Canslo',
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
  isCaseReady: {
    title: {
      en: 'Is the case ready for trial?',
      cy: 'A yw’r achos yn barod ar gyfer treial?',
    },
    reminder: {
      en: 'You are reminded that this information will be shared with all other parties',
      cy: 'Fe’ch atgoffir y bydd yr wybodaeth hon yn cael ei rhannu â phob parti arall',
    },
    needArrangements: {
      en: 'You will still need to continue and provide some information on trial arrangements.',
      cy: 'Bydd dal angen i chi barhau a darparu rhywfaint o wybodaeth am drefniadau’r treial.',
    },
    needApplication: {
      en: 'You will need to make an application to the court if this case is not ready for the trial.',
      cy: 'Bydd angen i chi wneud cais i’r llys os nad yw’r achos hwn yn barod ar gyfer treial.',
    },
    goAhead: {
      en: 'The trial will go ahead as planned on the specified date unless a judge makes an order changing the date of the trial.',
      cy: 'Bydd y treial yn mynd yn ei flaen fel y trefnwyd ar y dyddiad penodedig oni bai bod barnwr yn gwneud gorchymyn sy\'n newid dyddiad y treial.',
    },
    changeDate: {
      en: 'If you want the date of the trial to be changed (or any other order to make the case ready for trial) you will need to make an application to the court.',
      cy: 'Os ydych eisiau i ddyddiad y treial gael ei newid (neu unrhyw orchymyn arall i wneud yr achos yn barod ar gyfer treial) bydd angen i chi wneud cais i’r llys.',
    },
  },
};

class IsYourCaseReadyForTrial {

  checkPageFullyLoaded () {
    I.waitForElement(`//a[.='${content.buttons.cancel[language]}']`);
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
    this.verifyIsThisCaseReadyForTrialSectionContent();
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

  verifyIsThisCaseReadyForTrialSectionContent() {
    I.see(content.isCaseReady.title[language],'h2');
    I.see('');
    I.see(content.buttons.yes[language]);
    I.see(content.buttons.no[language]);
  }

  inputDataForIsThisCaseReadyForTrialPage(readyForTrial) {
    I.see(content.isCaseReady.title[language],'h2');
    I.see(content.isCaseReady.reminder[language]);
    I.click(readyForTrial);
    if (readyForTrial==='No'){
      I.see(content.isCaseReady.needArrangements[language]);
      I.see(content.isCaseReady.needApplication[language]);
      I.see(content.isCaseReady.goAhead[language]);
      I.see(content.isCaseReady.changeDate[language]);
    }
  }
}

module.exports = IsYourCaseReadyForTrial;
