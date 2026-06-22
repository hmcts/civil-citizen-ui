const ContactUs = require('../../../common/contactUs');
//const StringUtilsComponent = require('../util/StringUtilsComponent');
const I = actor();

const contactUs = new ContactUs();

//const stringUtils = new StringUtilsComponent();
let language = 'en';

const content = {
  heading: {
    title:{
      en: 'Check your answers',
      cy: 'Gwiriwch eich atebion',
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
  warning: {
    title: {
      en: 'Warning',
      cy: 'Rhybudd',
    },
    text: {
      en: 'You cannot withdraw a document once you have submitted it',
      cy: 'Ni allwch dynnu dogfen yn ôl ar ôl i chi ei chyflwyno',
    },
  },
  disclosure: {
    title: {
      en: 'Disclosure',
      cy: 'Datgelu',
    },
    documents: {
      en: 'Documents for disclosure',
      cy: 'Dogfennau i’w datgelu',
    },
    documentType: {
      en: 'Type of document',
      cy: 'Math o ddogfen',
    },
    dateTitle: {
      en: 'Date document was issued or message was sent',
      cy: 'Dyddiad cyhoeddi’r ddogfen neu ddyddiad anfon y neges',
    },
    documentUploaded: {
      en: 'Document uploaded',
      cy: 'Dogfen wedi’i huwchlwytho',
    },
  },
  witness: {
    title: {
      en: 'Witness evidence',
      cy: 'Tystiolaeth tyst',
    },
    name: {
      en: 'Witness\'s name',
      cy: 'Enw’r tyst',
    },
    statement: {
      en: 'Witness statement',
      cy: 'Datganiad tyst',
    },
    dateStatement: {
      en: 'Date statement was written',
      cy: 'Dyddiad ysgrifennu’r datganiad',
    },
    summary: {
      en: 'Witness summary',
      cy: 'Crynodeb tyst',
    },
    dateSummary: {
      en: 'Date summary was written',
      cy: 'Dyddiad ysgrifennu’r crynodeb',
    },
    documentsReferred: {
      en: 'Documents referred to in the statement',
      cy: 'Dogfennau y cyfeirir atynt yn y datganiad',
    },
    noticeIntention: {
      en: 'Notice of intention to rely on hearsay evidence',
      cy: 'Hysbysiad o’r bwriad i ddibynnu ar dystiolaeth achlust',
    },
  },
  expert: {
    title: {
      en: 'Expert evidence',
      cy: 'Tystiolaeth arbenigol',
    },
    report: {
      en: 'Expert\'s report',
      cy: 'Adroddiad yr arbenigwr',
    },
    jointStatement: {
      en: 'Joint statement of experts',
      cy: 'Datganiad ar y cyd yr arbenigwyr',
    },
    name: {
      en: 'Expert\'s name',
      cy: 'Enw’r arbenigwr',
    },
    expertise: {
      en: 'Field of expertise',
      cy: 'Maes arbenigedd',
    },
    dateTitle: {
      en: 'Date report was written',
      cy: 'Dyddiad ysgrifennu’r adroddiad',
    },
    questions: {
      title: {
        en: 'Questions for other party\'s expert or joint expert',
        cy: 'Cwestiynau i arbenigwr y parti arall neu gyd-arbenigwyr',
      },
      partyName: {
        en: 'Other party\'s name',
        cy: 'Enw’r parti arall',
      },
      documentName: {
        en: 'Name of document you have questions about',
        cy: 'Enw’r ddogfen y mae gennych gwestiynau amdani',
      },
    },
    answers: {
      title: {
        en: 'Answers to questions asked by other party',
        cy: 'Atebion i’r cwestiynau a ofynnwyd gan y parti arall',
      },
      documentName: {
        en: 'Name of document with other party\'s questions',
        cy: 'Enw’r ddogfen gyda chwestiynau’r parti arall',
      },
    },
  },
  trial: {
    title: {
      en: 'Trial documents',
      cy: 'Dogfennau’r treial',
    },
    caseSummary: {
      en: 'Case summary',
      cy: 'Crynodeb o’r achos',
    },
    skeleton: {
      en: 'Skeleton argument',
      cy: 'Dadl fframwaith',
    },
    costs: {
      en: 'Costs',
      cy: 'Costau',
    },
    authorities: {
      en: 'Legal authorities',
      cy: 'Awdurdodau cyfreithiol',
    },
    documentaryEvidence: {
      en: 'Documentary evidence for trial',
      cy: 'Tystiolaeth ddogfennol ar gyfer y treial',
    },
  },
  hearing: {
    title: {
      en: 'Hearing documents',
      cy: 'Dogfennau’r gwrandawiad',
    },
    documentaryEvidence: {
      en: 'Documentary evidence for the hearing',
      cy: 'Tystiolaeth ddogfennol ar gyfer y gwrandawiad',
    },
    authorities: {
      en: 'Legal authorities',
      cy: 'Awdurdodau cyfreithiol',
    },
  },
  buttons: {
    cancel: {
      en: 'Cancel',
      cy: 'Canslo',
    },
  },
  confirmation: {
    title: {
      en: 'Confirmation',
      cy: 'Cadarnhad',
    },
    cannotWithdraw: {
      en: 'You cannot withdraw a document once you have submitted it',
      cy: 'Ni allwch dynnu dogfen yn ôl ar ôl i chi ei chyflwyno',
    },
    confirmDocuments: {
      en: 'I confirm the documents are correct and understand that I cannot withdraw documents once I have submitted them.',
      cy: 'Rwy’n cadarnhau bod y dogfennau’n gywir, ac rwy’n deall na allaf dynnu dogfennau yn ôl ar ôl i mi eu cyflwyno',
    },
  },
};

class CheckYourAnswers {

  async checkPageFullyLoaded (languageChosen = 'en') {
    language = languageChosen;
    await I.waitForElement(`//a[.='${content.buttons.cancel[language]}']`);
  }

  async nextAction(nextAction) {
    await I.click(nextAction);
  }

  async verifyPageContent(caseNumber, claimAmount, claimType, partyType, languageChosen = 'en') {
    await this.checkPageFullyLoaded(languageChosen);
    await this.verifyBreadcrumbs();
    await this.verifyHeadingDetails();
    await this.verifyCaseNumberClaimAmount(caseNumber, claimAmount);
    /* if(claimType === 'FastTrack') {
      this.verifyDisclosureSectionContent();
      this.verifyWitnessSectionContent(claimType);
      this.verifyEvidenceSectionContent(claimType, partyType);
      this.verifyTrialDocumentsSection();
      this.verifyConfirmationStatements();
    } else {
      this.verifyWitnessSectionContent(claimType);
      this.verifyEvidenceSectionContent(claimType);
      this.verifyHearingDocumentsSection();
      this.verifyConfirmationStatements();
    }*/
    await contactUs.verifyContactUs(language);
  }

  async verifyBreadcrumbs() {
    await I.see('Back', '//a[@class="govuk-back-link"]');
  }

  async verifyHeadingDetails() {
    await I.see(content.heading.title[language], 'h1');
    await I.see(content.warning.title[language]);
    await I.see(content.warning.text[language]);
  }

  async verifyCaseNumberClaimAmount(caseNumber, claimAmount) {
    await I.see(content.heading.caseNumber[language]+ ': ' + caseNumber);
    await I.see(content.heading.claimAmount[language]+ ': ' + claimAmount);
  }

  async verifyDisclosureSectionContent() {
    await I.see(content.disclosure.title[language], 'h2');
    await I.see(`${content.disclosure.documents[language]} 1`);
    await I.see(content.disclosure.documentType[language]);
    await I.see('Test Data Entry for Document Disclosure 1');
    await I.see(content.disclosure.dateTitle[language]);
    await I.see('1/2/2023');
    await I.see(content.disclosure.documentUploaded[language]);
    await I.see('TestTXT.txt');
    await I.see(`${content.disclosure.documents[language]} 2`);
    await I.see('Test Data Entry for Document Disclosure 2');
    await I.see('2/2/2023');
    await I.see('TestDOC.doc');
  }

  async verifyWitnessSectionContent(claimType) {
    await I.see(content.witness.title[language], 'h2');
    await I.see(`${content.witness.statement[language]}`);
    await I.see(content.witness.name[language]);
    await I.see('Witness Statement - Witness Name 1');
    await I.see(content.witness.dateStatement[language]);
    await I.see('1/2/2023');
    await I.see('TestBMP.bmp');
    await I.see(`${content.witness.statement[language]} 2`);
    await I.see('Witness Statement - Witness Name 2');
    await I.see('2/2/2023');
    await I.see('TestCSV.csv');
    await I.see(`${content.witness.summary[language]} 1`);
    await I.see(content.witness.dateSummary[language]);
    await I.see('Witness Summary - Witness Name 1');
    await I.see('3/2/2023');
    await I.see('TestDOC.doc');
    await I.see(`${content.witness.summary[language]} 2`);
    await I.see('Witness Summary - Witness Name 2');
    await I.see('4/2/2023');
    await I.see('TestDOCX.docx');

    if (claimType === 'FastTrack') {

      await I.see(`${content.witness.noticeIntention[language]} 1`);
      await I.see('Notice of intention witness name 1');
      await I.see('7/2/2023');
      await I.see('TestRTF.rtf');
      await I.see(`${content.witness.noticeIntention[language]} 2`);
      await I.see('Notice of intention witness name 2');
      await I.see('8/2/2023');
      await I.see('TestTIF.tif');
    }

    await I.see(`${content.witness.documentsReferred[language]} 1`);
    await I.see('Documents referred Type of Document 1');
    await I.see('5/2/2023');
    await I.see('TestJPEG.jpeg');
    await I.see(`${content.witness.documentsReferred[language]} 2`);
    await I.see('Documents referred Type of Document 2');
    await I.see('6/2/2023');
    await I.see('TestJPG.jpg');
  }

  async verifyEvidenceSectionContent(claimType, partyType) {
    await I.see(content.expert.title[language], 'h2');
    await I.see(`${content.expert.report[language]} 1`);
    await I.see(content.expert.name[language]);
    await I.see(content.expert.expertise[language]);
    await I.see('Expert Report - Field of Expertise 1');
    await I.see(content.expert.dateTitle[language]);
    await I.see('7/2/2023');
    await I.see('TestPDF.pdf');
    await I.see(`${content.expert.report[language]} 2`);
    await I.see('Expert Report - Field of Expertise 2');
    await I.see('8/2/2023');
    await I.see('TestPNG.png');

    await I.see(`${content.expert.jointStatement[language]} 1`);
    await I.see(content.expert.name[language]);
    await I.see('Expert Statement - Expert Name 1');
    await I.see('Expert Statement - Field Of Expertise 1');
    await I.see('9/2/2023');
    await I.see('TestPPT.ppt');
    await I.see(`${content.expert.jointStatement[language]} 2`);
    await I.see('Expert Statement - Expert Name 2');
    await I.see('Expert Statement - Field Of Expertise 2');
    await I.see('10/2/2023');
    await I.see('TestRTF.rtf');

    if (claimType === 'FastTrack') {
      await I.see(`${content.expert.questions.title[language]} 1`);
      await I.see('Questions for Expert 1');
      await I.see(content.expert.questions.partyName[language]);
      if (partyType === 'LiPvLiP') {
        await I.see ('Sir John Doe');
      } else {
        await I.see('Test Inc');
      }
      await I.see(content.expert.questions.documentName[language]);
      await I.see('Questions for Expert Document Name 1');
      await I.see('TestJPEG.jpeg');

      await I.see(`${content.expert.questions.title[language]} 2`);
      await I.see('Questions for Expert 2');
      await I.see('Questions for Expert Document Name 2');

      await I.see(`${content.expert.answers.title[language]} 1`);
      await I.see('Answers for Expert 1');
      await I.see(content.expert.answers.documentName[language]);
      await I.see('Answers to questions asked by other party 2');
      await I.see('Answers for Expert 2');
      await I.see('Answers for Expert Document Name 2');
    }
  }

  async verifyTrialDocumentsSection() {
    await I.see(content.trial.title[language], 'h2');
    await I.see(`${content.trial.caseSummary[language]} 1`);
    await I.see(`${content.trial.caseSummary[language]} 2`);
    await I.see(`${content.trial.skeleton[language]} 1`);
    await I.see(`${content.trial.skeleton[language]} 2`);
    await I.see(`${content.trial.authorities[language]} 1`);
    await I.see(`${content.trial.authorities[language]} 2`);
    await I.see(`${content.trial.costs[language]} 1`);
    await I.see(`${content.trial.costs[language]} 2`);
    await I.see(`${content.trial.documentaryEvidence[language]} 1`);
    await I.see('Documentary evidence for the hearing - Type of Document 1');
    await I.see('11/2/2023');
    await I.see('TestTIF.tif');
    await I.see(`${content.trial.documentaryEvidence[language]} 2`);
    await I.see('Documentary evidence for the hearing - Type of Document 2');
    await I.see('12/2/2023');
    await I.see('TestTIFF.tiff');
  }

  async verifyHearingDocumentsSection() {
    await I.see(content.hearing.title[language], 'h2');
    await I.see(`${content.hearing.documentaryEvidence[language]} 1`);
    await I.see('Documentary evidence for the hearing - Type of Document 1');
    await I.see('11/2/2023');
    await I.see('TestTIF.tif');
    await I.see(`${content.hearing.documentaryEvidence[language]} 2`);
    await I.see('Documentary evidence for the hearing - Type of Document 2');
    await I.see('12/2/2023');
    await I.see('TestTIFF.tiff');
    await I.see('TestXLS.xls');
    await I.see('TestXLSX.xlsx');

  }

  async verifyConfirmationStatements() {
    await I.see(content.confirmation.title[language], 'h1');
    await I.see(content.confirmation.cannotWithdraw[language]);
    await I.see(content.confirmation.confirmDocuments[language]);

  }

  async clickConfirm() {
    await I.checkOption('#signed');
  }

}

module.exports = CheckYourAnswers;
