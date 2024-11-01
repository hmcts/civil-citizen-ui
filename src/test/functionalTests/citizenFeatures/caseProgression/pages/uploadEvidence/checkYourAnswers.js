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

  checkPageFullyLoaded (languageChosen = 'en') {
    language = languageChosen;
    I.waitForElement(`//a[.='${content.buttons.cancel[language]}']`);
  }

  nextAction(nextAction) {
    I.click(nextAction);
  }

  verifyPageContent(caseNumber, claimAmount, claimType, partyType, languageChosen = 'en') {
    this.checkPageFullyLoaded(languageChosen);
    this.verifyBreadcrumbs();
    this.verifyHeadingDetails();
    this.verifyCaseNumberClaimAmount(caseNumber, claimAmount);
    if(claimType === 'FastTrack') {
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
    }
    contactUs.verifyContactUs(language);
  }

  verifyBreadcrumbs() {
    I.see('Back', '//a[@class="govuk-back-link"]');
  }

  verifyHeadingDetails() {
    I.see(content.heading.title[language], 'h1');
    I.see(content.warning.title[language]);
    I.see(content.warning.text[language]);
  }

  verifyCaseNumberClaimAmount(caseNumber, claimAmount) {
    I.see(content.heading.caseNumber[language]+ ': ' + caseNumber);
    I.see(content.heading.claimAmount[language]+ ': ' + claimAmount);
  }

  verifyDisclosureSectionContent() {
    I.see(content.disclosure.title[language], 'h2');
    I.see(`${content.disclosure.documents[language]} 1`);
    I.see(content.disclosure.documentType[language]);
    I.see('Test Data Entry for Document Disclosure 1');
    I.see(content.disclosure.dateTitle[language]);
    I.see('1/2/2023');
    I.see(content.disclosure.documentUploaded[language]);
    I.see('TestTXT.txt');
    I.see(`${content.disclosure.documents[language]} 2`);
    I.see('Test Data Entry for Document Disclosure 2');
    I.see('2/2/2023');
    I.see('TestDOC.doc');
  }

  verifyWitnessSectionContent(claimType) {
    I.see(content.witness.title[language], 'h2');
    I.see(`${content.witness.statement[language]} 1`);
    I.see(content.witness.name[language]);
    I.see('Witness Statement - Witness Name 1');
    I.see(content.witness.dateStatement[language]);
    I.see('1/2/2023');
    I.see('TestBMP.bmp');
    I.see(`${content.witness.statement[language]} 2`);
    I.see('Witness Statement - Witness Name 2');
    I.see('2/2/2023');
    I.see('TestCSV.csv');
    I.see(`${content.witness.summary[language]} 1`);
    I.see(content.witness.dateSummary[language]);
    I.see('Witness Summary - Witness Name 1');
    I.see('3/2/2023');
    I.see('TestDOC.doc');
    I.see(`${content.witness.summary[language]} 2`);
    I.see('Witness Summary - Witness Name 2');
    I.see('4/2/2023');
    I.see('TestDOCX.docx');

    if (claimType === 'FastTrack') {

      I.see(`${content.witness.noticeIntention[language]} 1`);
      I.see('Notice of intention witness name 1');
      I.see('7/2/2023');
      I.see('TestRTF.rtf');
      I.see(`${content.witness.noticeIntention[language]} 2`);
      I.see('Notice of intention witness name 2');
      I.see('8/2/2023');
      I.see('TestTIF.tif');
    }

    I.see(`${content.witness.documentsReferred[language]} 1`);
    I.see('Documents referred Type of Document 1');
    I.see('5/2/2023');
    I.see('TestJPEG.jpeg');
    I.see(`${content.witness.documentsReferred[language]} 2`);
    I.see('Documents referred Type of Document 2');
    I.see('6/2/2023');
    I.see('TestJPG.jpg');
  }

  verifyEvidenceSectionContent(claimType, partyType) {
    I.see(content.expert.title[language], 'h2');
    I.see(`${content.expert.report[language]} 1`);
    I.see(content.expert.name[language]);
    I.see(content.expert.expertise[language]);
    I.see('Expert Report - Field of Expertise 1');
    I.see(content.expert.dateTitle[language]);
    I.see('7/2/2023');
    I.see('TestPDF.pdf');
    I.see(`${content.expert.report[language]} 2`);
    I.see('Expert Report - Field of Expertise 2');
    I.see('8/2/2023');
    I.see('TestPNG.png');

    I.see(`${content.expert.jointStatement[language]} 1`);
    I.see(content.expert.name[language]);
    I.see('Expert Statement - Expert Name 1');
    I.see('Expert Statement - Field Of Expertise 1');
    I.see('9/2/2023');
    I.see('TestPPT.ppt');
    I.see(`${content.expert.jointStatement[language]} 2`);
    I.see('Expert Statement - Expert Name 2');
    I.see('Expert Statement - Field Of Expertise 2');
    I.see('10/2/2023');
    I.see('TestRTF.rtf');

    if (claimType === 'FastTrack') {
      I.see(`${content.expert.questions.title[language]} 1`);
      I.see('Questions for Expert 1');
      I.see(content.expert.questions.partyName[language]);
      if (partyType === 'LiPvLiP') {
        I.see ('Sir John Doe');
      } else {
        I.see('Test Inc');
      }
      I.see(content.expert.questions.documentName[language]);
      I.see('Questions for Expert Document Name 1');
      I.see('TestJPEG.jpeg');

      I.see(`${content.expert.questions.title[language]} 2`);
      I.see('Questions for Expert 2');
      I.see('Questions for Expert Document Name 2');

      I.see(`${content.expert.answers.title[language]} 1`);
      I.see('Answers for Expert 1');
      I.see(content.expert.answers.documentName[language]);
      I.see('Answers to questions asked by other party 2');
      I.see('Answers for Expert 2');
      I.see('Answers for Expert Document Name 2');
    }
  }

  verifyTrialDocumentsSection() {
    I.see(content.trial.title[language], 'h2');
    I.see(`${content.trial.caseSummary[language]} 1`);
    I.see(`${content.trial.caseSummary[language]} 2`);
    I.see(`${content.trial.skeleton[language]} 1`);
    I.see(`${content.trial.skeleton[language]} 2`);
    I.see(`${content.trial.authorities[language]} 1`);
    I.see(`${content.trial.authorities[language]} 2`);
    I.see(`${content.trial.costs[language]} 1`);
    I.see(`${content.trial.costs[language]} 2`);
    I.see(`${content.trial.documentaryEvidence[language]} 1`);
    I.see('Documentary evidence for the hearing - Type of Document 1');
    I.see('11/2/2023');
    I.see('TestTIF.tif');
    I.see(`${content.trial.documentaryEvidence[language]} 2`);
    I.see('Documentary evidence for the hearing - Type of Document 2');
    I.see('12/2/2023');
    I.see('TestTIFF.tiff');
  }

  verifyHearingDocumentsSection() {
    I.see(content.hearing.title[language], 'h2');
    I.see(`${content.hearing.documentaryEvidence[language]} 1`);
    I.see('Documentary evidence for the hearing - Type of Document 1');
    I.see('11/2/2023');
    I.see('TestTIF.tif');
    I.see(`${content.hearing.documentaryEvidence[language]} 2`);
    I.see('Documentary evidence for the hearing - Type of Document 2');
    I.see('12/2/2023');
    I.see('TestTIFF.tiff');
    I.see('TestXLS.xls');
    I.see('TestXLSX.xlsx');

  }

  verifyConfirmationStatements() {
    I.see(content.confirmation.title[language], 'h1');
    I.see(content.confirmation.cannotWithdraw[language]);
    I.see(content.confirmation.confirmDocuments[language]);

  }

  clickConfirm() {
    I.checkOption('#signed');
  }

}

module.exports = CheckYourAnswers;
