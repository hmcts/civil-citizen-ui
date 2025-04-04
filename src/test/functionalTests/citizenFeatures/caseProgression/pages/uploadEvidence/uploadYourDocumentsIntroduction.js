const ContactUs = require('../../../common/contactUs');
//const StringUtilsComponent = require('../util/StringUtilsComponent');
const I = actor();

const contactUs = new ContactUs();
//const stringUtils = new StringUtilsComponent();
let language = 'en';

const content = {
  heading: {
    title:{
      en: 'Upload your documents',
      cy: 'Uwchlwytho eich dogfennau',
    },
    caseNumber: {
      en: 'Case number',
      cy: 'Rhif yr achor',
    },
    claimAmount: {
      en: 'Claim amount',
      cy: 'Swm yr hawliad',
    },
  },
  uploadDocumentSection: {
    checkTheOrder: {
      en: 'Check the order the court sent you for what documents you need to upload for your case.',
      cy: 'Gwiriwch y gorchymyn a anfonwyd atoch gan y llys am ba ddogfennau y mae angen i chi eu huwchlwytho ar gyfer eich achos.',
    },
    cannotWithdraw: {
      en: 'You cannot withdraw a document once you have submitted it. If you want to add more information to something you have already submitted, you can upload the document again. You should add a version number to the name, for example \'version2\'.',
      cy: 'Ni allwch dynnu dogfen yn ôl ar ôl i chi ei chyflwyno. Os ydych eisiau ychwanegu mwy o wybodaeth at rywbeth rydych eisoes wedi’i gyflwyno, gallwch uwchlwytho\'r ddogfen eto. Dylech ychwanegu rhif fersiwn at yr enw, er enghraifft \'fersiwn2\'.',
    },
    otherParties: {
      en: 'The other parties will be able to see the documents you have uploaded, and you will be able to see their documents.',
      cy: 'Bydd y partïon eraill yn gallu gweld y dogfennau rydych chi wedi’u llwytho, a byddwch chi’n gallu gweld eu dogfennau nhw.',
    },
  },
  deadlinesForUploadSection: {
    title: {
      en: 'Deadlines for uploading documents',
      cy: 'Dyddiadau cau ar gyfer uwchlwytho dogfennau',
    },
    checkTheOrder: {
      en: 'Check the order the court sent you for the deadlines for uploading your documents.',
      cy: 'Gwiriwch y gorchymyn a anfonwyd atoch gan y llys am y dyddiadau cau ar gyfer uwchlwytho eich dogfennau.',
    },
    afterDeadline: {
      en: 'After the deadline, you will have to',
      cy: 'Ar ôl y dyddiad cau, bydd rhaid ichi wneud',
    },
    applyToCourt: {
      en: 'apply to the court',
      cy: 'cais i’r llys',
    },
    newDocument: {
      en: 'if you want any new document to be used at the trial or hearing.',
      cy: 'os ydych am i unrhyw ddogfen newydd gael ei defnyddio yn y treial neu’r gwrandawiad.',
    },
    uploadOverTime: {
      en: 'You do not have to upload all your documents at once. You can return to upload them later.',
      cy: 'Nid oes rhaid i chi uwchlwytho eich holl ddogfennau gyda’i gilydd. Gallwch ddychwelyd i’w huwchlwytho yn hwyrach ymlaen.',
    },
  },
  beforeYouUpload: {
    title: {
      en: 'Before you upload your documents',
      cy: 'Cyn i chi uwchlwytho eich dogfennau',
    },
    giveName: {
      en: 'Before you upload the document, give it a name that tells the court what it is, for example \'Witness statement by Jane Smith\'.',
      cy: 'Cyn i chi uwchlwytho’r ddogfen, rhowch enw iddi sy’n dweud wrth y llys beth ydyw, er enghraifft ‘Datganiad tyst gan Jane Smith’',
    },
    documentMustBe: {
      en: 'Each document must be less than 100MB. You can upload the following file types: Word, Excel, PowerPoint, PDF, RTF, TXT, CSV, JPG, JPEG, PNG, BMP, TIF,TIFF.',
      cy: 'Rhaid i bob dogfen fod yn llai na 100MB. Gallwch uwchlwytho\'r mathau canlynol o ffeiliau: DOC/DOCX (Word), XLS/XLSM (Excel), PPT/PPTX (PowerPoint), PDF, RTF, TXT, CSV, JPG/JPEG, PNG, BMP, TIF/TIFF.',
    },
  },
  button: {
    en: 'Start now',
    cy: 'Dechrau nawr',
  },
};

class UploadYourDocumentsIntroduction {

  async checkPageFullyLoaded () {
    await I.waitForElement(`//a[contains(.,'${content.button[language]}')]`);
  }

  async nextAction (nextAction) {
    await I.click(nextAction);
  }

  async verifyPageContent(caseNumber, claimAmount, languageChosen = 'en') {
    language = languageChosen;
    this.checkPageFullyLoaded();
    this.verifyBreadcrumbs();
    this.verifyHeadingDetails();
    this.verifyCaseNumberClaimAmount(caseNumber, claimAmount);
    this.verifyUploadDocumentSectionContent();
    this.verifyDeadlinesForUploadingDocumentsContent();
    this.verifyBeforeYouUploadYourDocumentsContent();
    await contactUs.verifyContactUs();
  }

  async verifyBreadcrumbs() {
    I.see('Home', 'li');
    await I.see('Upload your documents', 'li');
  }

  verifyHeadingDetails() {
    I.see('Hearing', 'span');
    I.see(content.heading.title[language], 'h1');
  }

  verifyCaseNumberClaimAmount(caseNumber, claimAmount) {
    I.see(content.heading.caseNumber[language]+ ': ' + caseNumber);
    I.see(content.heading.claimAmount[language]+ ': ' + claimAmount);
  }

  verifyUploadDocumentSectionContent() {
    I.see(content.uploadDocumentSection.checkTheOrder[language]);
    I.see(content.uploadDocumentSection.cannotWithdraw[language]);
    I.see(content.uploadDocumentSection.otherParties[language]);
  }

  verifyDeadlinesForUploadingDocumentsContent() {
    I.see(content.deadlinesForUploadSection.title[language],'h2');
    I.see(content.deadlinesForUploadSection.checkTheOrder[language]);
    I.see(content.deadlinesForUploadSection.afterDeadline[language]);
    I.seeElement(`//a[contains(.,'${content.deadlinesForUploadSection.applyToCourt[language]}')]`);
    I.see(content.deadlinesForUploadSection.newDocument[language]);
    I.see(content.deadlinesForUploadSection.uploadOverTime[language]);
  }

  verifyBeforeYouUploadYourDocumentsContent() {
    I.see(content.beforeYouUpload.title[language],'h2');
    I.see(content.beforeYouUpload.giveName[language]);
    I.see(content.beforeYouUpload.documentMustBe[language]);
  }
}

module.exports = UploadYourDocumentsIntroduction;
