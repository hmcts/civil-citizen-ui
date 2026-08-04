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

  async checkPageFullyLoaded () {
    await I.waitForElement(`//a[.='${content.buttons.cancel[language]}']`);
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
    await this.verifyIsThisCaseReadyForTrialSectionContent();
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

  async verifyIsThisCaseReadyForTrialSectionContent() {
    await I.see(content.isCaseReady.title[language],'h2');
    await I.see('');
    await I.see(content.buttons.yes[language]);
    await I.see(content.buttons.no[language]);
  }

  async inputDataForIsThisCaseReadyForTrialPage(readyForTrial) {
    await I.see(content.isCaseReady.title[language],'h2');
    await I.see(content.isCaseReady.reminder[language]);
    await I.click(readyForTrial);
    if (readyForTrial==='No'){
      await I.see(content.isCaseReady.needArrangements[language]);
      await I.see(content.isCaseReady.needApplication[language]);
      await I.see(content.isCaseReady.goAhead[language]);
      await I.see(content.isCaseReady.changeDate[language]);
    }
  }
}

module.exports = IsYourCaseReadyForTrial;
