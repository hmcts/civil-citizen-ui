const ContactUs = require('../../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();
let language = 'en';

const content = {
  button: {
    caseDetails: {
      en: 'Close and return to case overview',
      cy: 'Cau a dychwelyd at y trosolwg o’r achos',
    },
  },
  whatNext: {
    en: 'What happens next',
    cy: 'Beth fydd yn digwydd nesaf',
  },
  orderNotices: {
    en: 'Orders  and notices',
    cy: 'Gorchmynion a hysbysiadau',
  },
  makeApplication: {
    en: 'make an application',
    cy: 'wneud cais',
  },
  canView: {
    en: 'You can view your and the other party’s trial arrangements under',
    cy: 'Gallwch weld trefniadau eich treial chi a’r parti arall o dan',
  },
  caseDetails: {
    en: 'in the case details.',
    cy: 'yn adran manylion yr achos.',
  },
  toCourt: {
    en: 'to the court and pay the appropriate fee.',
    cy: 'i’r llys a thalu’r ffi briodol.',
  },
  accessibility: {
    en: 'For any changes to accessibility requirements between now and the trial  hearing date you will need to call 0300 123 7050.',
    cy: 'Ar gyfer unrhyw newidiadau i’r gofynion hygyrchedd rhwng nawr a dyddiad y gwrandawiad, bydd angen i chi ffonio 0300 303 5174.',
  },
  saidYes: {
    title: {
      en: 'You have said this case is ready for trial',
      cy: 'Rydych wedi dweud bod yr achos hwn yn barod ar gyfer treial',
    },
    anyChanges: {
      en: 'If there are any changes to the arrangements between now and the trial date you will need to',
      cy: 'Os oes unrhyw newidiadau i’r trefniadau rhwng nawr a dyddiad y treial, bydd angen i chi',
    },
  },
  saidNo: {
    title: {
      en: 'You have said this case is not ready for trial',
      cy: 'Rydych wedi dweud nad yw’r achos hwn yn barod ar gyfer treial',
    },
    asPlanned: {
      en: 'The trial will go ahead as planned on the specified date unless a judge makes an order changing the date of the trial.',
      cy: 'Bydd y treial yn mynd yn ei flaen fel y trefnwyd ar y dyddiad penodedig oni bai bod barnwr yn gwneud gorchymyn sy’n newid dyddiad y treial.',
    },
    wantChange: {
      en: 'If you want the date of the trial to be changed (or any other order to make the case ready for trial) you will need to',
      cy: 'Os ydych am i ddyddiad y treial gael ei newid (neu unrhyw orchymyn arall i wneud yr achos yn barod ar gyfer treial) bydd angen i chi',
    },
  },
};

class CheckYourAnswers {

  checkPageFullyLoaded () {
    I.waitForElement(`//a[contains(.,'${content.button.caseDetails[language]}')]`);
  }

  nextAction (nextAction) {
    I.click(nextAction);
  }

  verifyPageContent() {
    this.checkPageFullyLoaded();
    this.verifyHeadingDetails();
    this.verifyConfirmationSectionContent();
    contactUs.verifyContactUs();
  }

  verifyHeadingDetails(readyForTrial) {
    if (readyForTrial==='no'){
      I.see(content.saidNo.title[language], 'h1');
    }
    if (readyForTrial==='yes'){
      I.see(content.saidYes.title[language], 'h1');
    }
  }

  verifyConfirmationSectionContent(readyForTrial) {
    I.see(content.whatNext[language]);
    if (readyForTrial==='no') {
      I.see(content.saidNo.asPlanned[language]);
      I.see(content.saidNo.wantChange[language]);
    }
    if (readyForTrial==='yes'){
      I.see(content.saidYes.anyChanges[language]);
    }
    I.see(content.toCourt[language]);
    I.see(content.accessibility[language]);
    I.seeElement(`//a[.='${content.makeApplication[language]}']`);
    I.see(content.canView[language]);
    I.seeElement(`//a[.='${content.orderNotices[language]}']`);
    I.see(content.caseDetails[language]);
  }
}

module.exports = CheckYourAnswers;
