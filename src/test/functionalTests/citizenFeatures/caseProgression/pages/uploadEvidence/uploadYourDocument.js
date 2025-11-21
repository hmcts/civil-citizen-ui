const ContactUs = require('../../../common/contactUs');
//const StringUtilsComponent = require('../util/StringUtilsComponent');
const I = actor();

const contactUs = new ContactUs();

//const stringUtils = new StringUtilsComponent();
let language = 'en';

const content = {
  title: {
    en: 'Upload documents',
    cy: 'Uwchlwytho dogfennau',
  },
  caseNumber: {
    en: 'Case number',
    cy: 'Rhif yr achor',
  },
  claimAmount: {
    en: 'Claim amount',
    cy: 'Swm yr hawliad',
  },
  day: {
    en: 'Day',
    cy: 'Diwrnod',
  },
  month: {
    en: 'Month',
    cy: 'Mis',
  },
  year: {
    en: 'Year',
    cy: 'Blwyddyn',
  },
  uploadFile: {
    en: 'Upload a file',
    cy: 'Uwchlwytho ffeil',
  },
  acceptableDocuments: {
    title: {
      en: 'Acceptable documents formats',
      cy: 'Fformatau derbyniol ar gyfer cyflwyno dogfennau',
    },
    hint: {
      en: 'Each document must be less than 100MB. You can upload the following file types: Word, Excel, PowerPoint, PDF, RTF, TXT, CSV, JPG, JPEG, PNG, BMP, TIF,TIFF.',
      cy: 'Rhaid i bob dogfen fod yn llai na 100MB. Gallwch uwchlwytho\'r mathau canlynol o ffeiliau: Word, Excel, PowerPoint, PDF, RTF, TXT, CSV, JPG, JPEG, PNG, BMP, TIF,TIFF.',
    },
  },
  disclosure: {
    title: {
      en: 'Disclosure',
      cy: 'Datgelu',
    },
    documents: {
      title: {
        en: 'Documents for disclosure',
        cy: 'Dogfennau i’w datgelu',
      },
      documentType: {
        en: 'Type of document',
        cy: 'Math o ddogfen',
      },
      documentTypeHint: {
        en: 'For example, contract, invoice, receipt, email, text message, photo, social media message',
        cy: 'Er enghraifft, contract, anfoneb, derbynneb, neges e-bost, neges testun, llun, neges ar gyfryngau cymdeithasol',
      },
      dateTitle: {
        en: 'Date document was issued or message was sent',
        cy: 'Dyddiad cyhoeddi’r ddogfen neu ddyddiad anfon y neges',
      },
      dateHint: {
        en: 'For example, 27 9 2022',
        cy: 'Er enghraifft, 27 9 2022',
      },
    },
    list: {
      title: {
        en: 'Disclosure list',
        cy: 'Rhestr ddatgelu',
      },
    },
  },
  witness: {
    title: {
      en: 'Witness evidence',
      cy: 'Tystiolaeth tyst',
    },
    witnessName: {
      en: 'Witness\'s name',
      cy: 'Enw’r tyst',
    },
    statement: {
      title: {
        en: 'Witness statement',
        cy: 'Datganiad tyst',
      },
      dateTitle: {
        en: 'Date statement was written',
        cy: 'Dyddiad ysgrifennu’r datganiad',
      },
    },
    summary: {
      title: {
        en: 'Witness summary',
        cy: 'Crynodeb tyst',
      },
      dateTitle: {
        en: 'Date summary was written',
        cy: 'Dyddiad ysgrifennu’r crynodeb',
      },
    },
    noticeIntention: {
      title: {
        en: 'Notice of intention to rely on hearsay evidence',
        cy: 'Hysbysiad o’r bwriad i ddibynnu ar dystiolaeth achlust',
      },
    },
    documentsReferred: {
      title:  {
        en: 'Documents referred to in the statement',
        cy: 'Dogfennau y cyfeirir atynt yn y datganiad',
      },
      dateTitle: {
        en: 'Date document was issued or message was sent',
        cy: 'Dyddiad cyhoeddi’r ddogfen neu ddyddiad anfon y neges',
      },
    },
  },
  expert: {
    title: {
      en: 'Expert evidence',
      cy: 'Tystiolaeth arbenigol',
    },
    report: {
      title: {
        en: 'Expert\'s report',
        cy: 'Adroddiad yr arbenigwr',
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
      dateTitleHint: {
        en: 'For example, 27 9 2022',
        cy: 'Er enghraifft, 27 9 2022',
      },
    },
    jointStatement: {
      title: {
        en: 'Joint statement of experts',
        cy: 'Datganiad ar y cyd yr arbenigwyr',
      },
      names: {
        en: 'Experts\' names',
        cy: 'Enwau’r arbenigwyr',
      },
      expertise: {
        en: 'Field of expertise',
        cy: 'Maes arbenigedd',
      },
      dateTitle: {
        en: 'Date statement was written',
        cy: 'Dyddiad ysgrifennu’r datganiad',
      },
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
    summary: {
      en: 'Case summary',
      cy: 'Crynodeb o’r achos',
    },
    authority: {
      en: 'Legal authorities',
      cy: 'Awdurdodau cyfreithiol',
    },
    skeleton: {
      en: 'Skeleton argument',
      cy: 'Dadl fframwaith',
    },
    costs: {
      en: 'Costs',
      cy: 'Costau',
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
      title: {
        en: 'Documentary evidence for the hearing',
        cy: 'Tystiolaeth ddogfennol ar gyfer y gwrandawiad',
      },
      documentType: {
        en: 'Type of document',
        cy: 'Math o ddogfen',
      },
      documentTypeHint: {
        en: 'For example, contract, invoice, receipt, email, text message, photo, social media message',
        cy: 'Er enghraifft, contract, anfoneb, derbynneb, neges e-bost, neges testun, llun, neges ar gyfryngau cymdeithasol',
      },
      dateTitle: {
        en: 'Date document was issued or message was sent',
        cy: 'Dyddiad cyhoeddi’r ddogfen neu ddyddiad anfon y neges',
      },
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
};

class UploadYourDocument {

  checkPageFullyLoaded(languageChosen = 'en') {
    language = languageChosen;
    I.waitForElement(`//a[.='${content.buttons.cancel[language]}']`);
  }

  nextAction(nextAction) {
    I.click(nextAction);
  }

  verifyPageContent(caseNumber, claimAmount, claimType, languageChosen = 'en') {
    this.checkPageFullyLoaded(languageChosen);
    this.verifyBreadcrumbs();
    this.verifyHeadingDetails();
    this.verifyCaseNumberClaimAmount(caseNumber, claimAmount);
    this.verifyAcceptableDocumentsFormatsSectionContent();
    if (claimType === 'FastTrack') {
      this.verifyAllFastTrackSectionContent(claimType);
    } else if (claimType === 'SmallClaims') {
      this.verifyAllSmallClaimsSectionContent(claimType);
    }
    contactUs.verifyContactUs(language);
  }

  verifyBreadcrumbs() {
    I.see('Back', '//a[@class="govuk-back-link"]');
  }

  verifyHeadingDetails() {
    I.see(content.title[language], 'h1');
  }

  verifyCaseNumberClaimAmount(caseNumber, claimAmount) {
    I.see(content.caseNumber[language]+ ': ' + caseNumber);
    I.see(content.claimAmount[language]+ ': ' + claimAmount);
  }

  verifyAcceptableDocumentsFormatsSectionContent() {
    I.see(content.acceptableDocuments.title[language], 'h2');
    I.see(content.acceptableDocuments.hint[language]);
  }

  verifyAllFastTrackSectionContent(claimType) {
    this.verifyDisclosureSectionContent();
    this.verifyWitnessSectionContent(claimType);
    this.verifyExpertSectionContentForFastTrack();
    this.verifyTrialDocumentsSectionContent();
  }

  verifyAllSmallClaimsSectionContent(claimType) {
    this.verifyWitnessSectionContent(claimType);
    this.verifyExpertSectionContentForSmallClaims();
    this.verifyHearingDocumentsSectionContent();
  }

  verifyDisclosureSectionContent() {
    I.see(content.disclosure.title[language], 'h2');
    I.see(content.disclosure.documents.title[language], 'h2');
    I.see(content.disclosure.documents.documentType[language]);
    I.see(content.disclosure.documents.documentTypeHint[language]);
    I.see(content.disclosure.documents.dateTitle[language]);
    I.see(content.disclosure.documents.dateHint[language]);
    I.see(content.day[language]);
    I.see(content.month[language]);
    I.see(content.year[language]);
    I.see(content.uploadFile[language]);
    I.see(content.disclosure.list.title[language]);
  }

  verifyWitnessSectionContent(claimType) {
    I.see(content.witness.title[language], 'h2');
    I.see(content.witness.statement.title[language], 'h2');
    I.see(content.witness.witnessName[language]);
    I.see(content.witness.statement.dateTitle[language]);
    I.see(content.witness.summary.title[language]);
    I.see(content.witness.witnessName[language]);
    I.see(content.witness.summary.dateTitle[language]);
    if (claimType === 'FastTrack') {
      I.see(content.witness.noticeIntention.title[language]);
    }
    I.see(content.witness.documentsReferred.title[language]);
    I.see(content.witness.documentsReferred.dateTitle[language]);
  }

  verifyExpertSectionContentForFastTrack() {
    I.see(content.expert.title[language], 'h2');
    I.see(content.expert.report.title[language], 'h2');
    I.see(content.expert.report.name[language]);
    I.see(content.expert.report.expertise[language]);
    I.see(content.expert.report.dateTitle[language]);
    I.see(content.expert.jointStatement.title[language]);
    I.see(content.expert.jointStatement.names[language]);
    I.see(content.expert.jointStatement.expertise[language]);
    I.see(content.expert.jointStatement.dateTitle[language]);
    I.see(content.expert.questions.title[language]);
    I.see(content.expert.questions.partyName[language]);
    I.see(content.expert.questions.documentName[language]);
    I.see(content.expert.answers.title[language], 'h2');
    I.see(content.expert.answers.documentName[language]);
  }

  verifyExpertSectionContentForSmallClaims() {
    I.see(content.expert.title[language], 'h2');
    I.see(content.expert.report.title[language], 'h3');
    I.see(content.expert.report.name[language]);
    I.see(content.expert.report.expertise[language]);
    I.see(content.expert.report.dateTitle[language]);
    I.see(content.expert.report.dateTitleHint[language]);
    I.see(content.day[language]);
    I.see(content.month[language]);
    I.see(content.year[language]);
    I.see(content.uploadFile[language]);
    I.see(content.expert.jointStatement.title[language]);
    I.see(content.expert.jointStatement.names[language]);
    I.see(content.expert.jointStatement.expertise[language]);
    I.see(content.expert.jointStatement.dateTitle[language]);
  }

  verifyTrialDocumentsSectionContent() {
    I.see(content.trial.title[language], 'h2');
    I.see(content.trial.summary[language], 'h2');
    I.see(content.trial.skeleton[language], 'h2');
    I.see(content.trial.authority[language], 'h2');
    I.see(content.trial.costs[language], 'h2');
    I.see(content.trial.documentaryEvidence[language], 'h2');
  }

  verifyHearingDocumentsSectionContent() {
    I.see(content.hearing.title[language], 'h2');
    I.see(content.hearing.documentaryEvidence.title[language], 'h3');
    I.see(content.hearing.documentaryEvidence.documentType[language]);
    I.see(content.hearing.documentaryEvidence.documentTypeHint[language]);
    I.see(content.hearing.documentaryEvidence.dateTitle[language]);
    I.see(content.hearing.authorities[language]);
  }

  async inputDataForFastTrackSections() {
    //Disclosure Section
    //Documents for disclosure - Subsection
    I.fillField('documentsForDisclosure[0][typeOfDocument]', 'Test Data Entry for Document Disclosure 1');
    I.fillField('documentsForDisclosure[0][dateInputFields][dateDay]', '01');
    I.fillField('documentsForDisclosure[0][dateInputFields][dateMonth]', '02');
    I.fillField('documentsForDisclosure[0][dateInputFields][dateYear]', '2023');
    I.attachFile('documentsForDisclosure[0][fileUpload]', 'src/test/functionalTests/citizenFeatures/caseProgression/data/TestTXT.txt');
    I.click('(//*[@id="add-another-disclosure-list"])[1]');
    I.click('(//*[@value="documentsForDisclosure[0][uploadButton]"])');
    I.fillField('documentsForDisclosure[1][typeOfDocument]', 'Test Data Entry for Document Disclosure 2');
    I.fillField('documentsForDisclosure[1][dateInputFields][dateDay]', '02');
    I.fillField('documentsForDisclosure[1][dateInputFields][dateMonth]', '02');
    I.fillField('documentsForDisclosure[1][dateInputFields][dateYear]', '2023');
    await I.attachFile('documentsForDisclosure[1][fileUpload]', 'src/test/functionalTests/citizenFeatures/caseProgression/data/TestDOC.doc');
    await I.click('(//*[@value="documentsForDisclosure[1][uploadButton]"])');

    //Disclosure list - Subsection
    I.attachFile('disclosureList[0][fileUpload]', 'src/test/functionalTests/citizenFeatures/caseProgression/data/TestDOCX.docx');
    I.click('(//*[@id="add-another-disclosure-list"])[2]');
    I.click('(//*[@value="disclosureList[0][uploadButton]"])');
    await I.attachFile('//*[@id="disclosureList[1][fileUpload]"]', 'src/test/functionalTests/citizenFeatures/caseProgression/data/TestPDF.pdf');
    await I.click('(//*[@value="disclosureList[1][uploadButton]"])');

    //Witness Section
    //Witness Statement - Subsection
    I.fillField('witnessStatement[0][witnessName]', 'Witness Statement - Witness Name 1');
    I.fillField('witnessStatement[0][dateInputFields][dateDay]', '01');
    I.fillField('witnessStatement[0][dateInputFields][dateMonth]', '02');
    I.fillField('witnessStatement[0][dateInputFields][dateYear]', '2023');
    I.attachFile('witnessStatement[0][fileUpload]', 'src/test/functionalTests/citizenFeatures/caseProgression/data/TestBMP.bmp');
    I.click('(//*[@id="add-another-witness-list"])[1]');
    await I.click('(//*[@value="witnessStatement[0][uploadButton]"])');
    I.fillField('witnessStatement[1][witnessName]', 'Witness Statement - Witness Name 2');
    I.fillField('witnessStatement[1][dateInputFields][dateDay]', '02');
    I.fillField('witnessStatement[1][dateInputFields][dateMonth]', '02');
    I.fillField('witnessStatement[1][dateInputFields][dateYear]', '2023');
    I.attachFile('witnessStatement[1][fileUpload]', 'src/test/functionalTests/citizenFeatures/caseProgression/data/TestCSV.csv');
    await I.click('(//*[@value="witnessStatement[1][uploadButton]"])');

    //Witness Summary - Subsection
    I.fillField('witnessSummary[0][witnessName]', 'Witness Summary - Witness Name 1');
    I.fillField('witnessSummary[0][dateInputFields][dateDay]', '03');
    I.fillField('witnessSummary[0][dateInputFields][dateMonth]', '02');
    I.fillField('witnessSummary[0][dateInputFields][dateYear]', '2023');
    I.attachFile('witnessSummary[0][fileUpload]', 'src/test/functionalTests/citizenFeatures/caseProgression/data/TestDOC.doc');
    I.click('(//*[@id="add-another-witness-list"])[2]');
    I.click('(//*[@value="witnessSummary[0][uploadButton]"])');
    I.fillField('witnessSummary[1][witnessName]', 'Witness Summary - Witness Name 2');
    I.fillField('witnessSummary[1][dateInputFields][dateDay]', '04');
    I.fillField('witnessSummary[1][dateInputFields][dateMonth]', '02');
    I.fillField('witnessSummary[1][dateInputFields][dateYear]', '2023');
    I.attachFile('witnessSummary[1][fileUpload]', 'src/test/functionalTests/citizenFeatures/caseProgression/data/TestDOCX.docx');
    await I.click('(//*[@value="witnessSummary[1][uploadButton]"])');

    //Notice of Intention - Subsection
    I.fillField('noticeOfIntention[0][witnessName]', 'Notice of intention witness name 1');
    I.fillField('noticeOfIntention[0][dateInputFields][dateDay]', '07');
    I.fillField('noticeOfIntention[0][dateInputFields][dateMonth]', '02');
    I.fillField('noticeOfIntention[0][dateInputFields][dateYear]', '2023');
    I.attachFile('noticeOfIntention[0][fileUpload]', 'src/test/functionalTests/citizenFeatures/caseProgression/data/TestRTF.rtf');
    I.click('(//*[@id="add-another-witness-list"])[3]');
    I.click('(//*[@value="noticeOfIntention[0][uploadButton]"])');
    I.fillField('noticeOfIntention[1][witnessName]', 'Notice of intention witness name 2');
    I.fillField('noticeOfIntention[1][dateInputFields][dateDay]', '08');
    I.fillField('noticeOfIntention[1][dateInputFields][dateMonth]', '02');
    I.fillField('noticeOfIntention[1][dateInputFields][dateYear]', '2023');
    I.attachFile('noticeOfIntention[1][fileUpload]', 'src/test/functionalTests/citizenFeatures/caseProgression/data/TestTIF.tif');
    await I.click('(//*[@value="noticeOfIntention[1][uploadButton]"])');

    //Documents Referred to in the statement - Subsection
    I.fillField('documentsReferred[0][witnessName]', 'Documents referred witness name 1');
    I.fillField('documentsReferred[0][typeOfDocument]', 'Documents referred Type of Document 1');
    I.fillField('documentsReferred[0][dateInputFields][dateDay]', '05');
    I.fillField('documentsReferred[0][dateInputFields][dateMonth]', '02');
    I.fillField('documentsReferred[0][dateInputFields][dateYear]', '2023');
    I.attachFile('documentsReferred[0][fileUpload]', 'src/test/functionalTests/citizenFeatures/caseProgression/data/TestJPEG.jpeg');
    I.click('(//*[@id="add-another-witness-list"])[4]');
    I.click('(//*[@value="documentsReferred[0][uploadButton]"])');
    I.fillField('documentsReferred[1][witnessName]', 'Documents referred witness name 2');
    I.fillField('documentsReferred[1][typeOfDocument]', 'Documents referred Type of Document 2');
    I.fillField('documentsReferred[1][dateInputFields][dateDay]', '06');
    I.fillField('documentsReferred[1][dateInputFields][dateMonth]', '02');
    I.fillField('documentsReferred[1][dateInputFields][dateYear]', '2023');
    I.attachFile('documentsReferred[1][fileUpload]', 'src/test/functionalTests/citizenFeatures/caseProgression/data/TestJPG.jpg');
    await I.click('(//*[@value="documentsReferred[1][uploadButton]"])');

    //Evidences Section
    //Expert's report - Subsection
    I.fillField('expertReport[0][expertName]', 'Expert Report - Expert Name 1');
    I.fillField('expertReport[0][fieldOfExpertise]', 'Expert Report - Field of Expertise 1');
    I.fillField('expertReport[0][dateInputFields][dateDay]', '07');
    I.fillField('expertReport[0][dateInputFields][dateMonth]', '02');
    I.fillField('expertReport[0][dateInputFields][dateYear]', '2023');
    I.attachFile('expertReport[0][fileUpload]', 'src/test/functionalTests/citizenFeatures/caseProgression/data/TestPDF.pdf');
    I.click('(//*[@id="add-another-expert-list"])[1]');
    I.click('(//*[@value="expertReport[0][uploadButton]"])');
    I.fillField('expertReport[1][expertName]', 'Expert Report - Expert Name 2');
    I.fillField('expertReport[1][fieldOfExpertise]', 'Expert Report - Field of Expertise 2');
    I.fillField('expertReport[1][dateInputFields][dateDay]', '08');
    I.fillField('expertReport[1][dateInputFields][dateMonth]', '02');
    I.fillField('expertReport[1][dateInputFields][dateYear]', '2023');
    I.attachFile('expertReport[1][fileUpload]', 'src/test/functionalTests/citizenFeatures/caseProgression/data/TestPNG.png');
    I.click('(//*[@value="expertReport[1][uploadButton]"])');

    //Joint Statement of Experts - Subsection
    I.fillField('expertStatement[0][expertName]', 'Expert Statement - Expert Name 1');
    I.fillField('expertStatement[0][fieldOfExpertise]', 'Expert Statement - Field Of Expertise 1');
    I.fillField('expertStatement[0][dateInputFields][dateDay]', '09');
    I.fillField('expertStatement[0][dateInputFields][dateMonth]', '02');
    I.fillField('expertStatement[0][dateInputFields][dateYear]', '2023');
    I.attachFile('expertStatement[0][fileUpload]', 'src/test/functionalTests/citizenFeatures/caseProgression/data/TestPPT.ppt');
    I.click('(//*[@id="add-another-expert-list"])[2]');
    I.click('(//*[@value="expertStatement[0][uploadButton]"])');
    I.fillField('expertStatement[1][expertName]', 'Expert Statement - Expert Name 2');
    I.fillField('expertStatement[1][fieldOfExpertise]', 'Expert Statement - Field Of Expertise 2');
    I.fillField('expertStatement[1][dateInputFields][dateDay]', '10');
    I.fillField('expertStatement[1][dateInputFields][dateMonth]', '02');
    I.fillField('expertStatement[1][dateInputFields][dateYear]', '2023');
    I.attachFile('expertStatement[1][fileUpload]', 'src/test/functionalTests/citizenFeatures/caseProgression/data/TestRTF.rtf');
    await I.click('(//*[@value="expertStatement[1][uploadButton]"])');

    //Questions For Other Party - Subsection
    I.fillField('questionsForExperts[0][expertName]', 'Questions for Expert 1');
    I.selectOption('questionsForExperts[0][otherPartyName]', 'Test Inc');
    I.fillField('questionsForExperts[0][questionDocumentName]', 'Questions for Expert Document Name 1');
    I.attachFile('questionsForExperts[0][fileUpload]', 'src/test/functionalTests/citizenFeatures/caseProgression/data/TestJPEG.jpeg');
    I.selectOption('questionsForExperts[0][otherPartyName]', 'Sir John Doe');
    I.click('(//*[@id="add-another-expert-list"])[3]');
    I.click('(//*[@value="questionsForExperts[0][uploadButton]"])');
    I.fillField('questionsForExperts[1][expertName]', 'Questions for Expert 2');
    I.selectOption('questionsForExperts[1][otherPartyName]', 'Test Inc');
    I.fillField('questionsForExperts[1][questionDocumentName]', 'Questions for Expert Document Name 2');
    I.attachFile('questionsForExperts[1][fileUpload]', 'src/test/functionalTests/citizenFeatures/caseProgression/data/TestTXT.txt');
    I.selectOption('questionsForExperts[1][otherPartyName]', 'Sir John Doe');
    I.click('(//*[@value="questionsForExperts[1][uploadButton]"])');

    //Answers to Questions By Other Party - Subsection
    I.fillField('answersForExperts[0][expertName]', 'Answers for Expert 1');
    I.selectOption('answersForExperts[0][otherPartyName]', 'Test Inc');
    I.fillField('answersForExperts[0][otherPartyQuestionsDocumentName]', 'Answers for Expert Document Name 1');
    I.attachFile('answersForExperts[0][fileUpload]', 'src/test/functionalTests/citizenFeatures/caseProgression/data/TestTXT.txt');
    I.selectOption('answersForExperts[0][otherPartyName]', 'Sir John Doe');
    I.click('(//*[@id="add-another-expert-list"])[4]');
    I.click('(//*[@value="answersForExperts[0][uploadButton]"])');
    I.fillField('answersForExperts[1][expertName]', 'Answers for Expert 2');
    I.selectOption('answersForExperts[1][otherPartyName]', 'Test Inc');
    I.fillField('answersForExperts[1][otherPartyQuestionsDocumentName]', 'Answers for Expert Document Name 2');
    I.attachFile('answersForExperts[1][fileUpload]', 'src/test/functionalTests/citizenFeatures/caseProgression/data/TestTXT.txt');
    I.selectOption('answersForExperts[1][otherPartyName]', 'Sir John Doe');
    I.click('(//*[@value="answersForExperts[1][uploadButton]"])');

    //Trial Documents - Section
    //Case Summary
    I.attachFile('trialCaseSummary[0][fileUpload]', 'src/test/functionalTests/citizenFeatures/caseProgression/data/TestTXT.txt');
    I.click('(//*[@id="add-another-trial-list"])[1]');
    I.click('(//*[@value="trialCaseSummary[0][uploadButton]"])');
    I.attachFile('trialCaseSummary[1][fileUpload]', 'src/test/functionalTests/citizenFeatures/caseProgression/data/TestTXT.txt');
    I.click('(//*[@value="trialCaseSummary[1][uploadButton]"])');

    //Skeleton
    I.attachFile('trialSkeletonArgument[0][fileUpload]', 'src/test/functionalTests/citizenFeatures/caseProgression/data/TestTXT.txt');
    I.click('(//*[@id="add-another-trial-list"])[2]');
    I.click('(//*[@value="trialSkeletonArgument[0][uploadButton]"])');
    I.attachFile('trialSkeletonArgument[1][fileUpload]', 'src/test/functionalTests/citizenFeatures/caseProgression/data/TestTXT.txt');
    I.click('(//*[@value="trialSkeletonArgument[1][uploadButton]"])');

    //Trial Authorities
    I.attachFile('trialAuthorities[0][fileUpload]', 'src/test/functionalTests/citizenFeatures/caseProgression/data/TestXLS.xls');
    I.click('(//*[@id="add-another-trial-list"])[3]');
    I.click('(//*[@value="trialAuthorities[0][uploadButton]"])');
    I.attachFile('trialAuthorities[1][fileUpload]', 'src/test/functionalTests/citizenFeatures/caseProgression/data/TestXLSX.xlsx');
    I.click('(//*[@value="trialAuthorities[1][uploadButton]"])');

    //Costs
    I.attachFile('trialCosts[0][fileUpload]', 'src/test/functionalTests/citizenFeatures/caseProgression/data/TestTXT.txt');
    I.click('(//*[@id="add-another-trial-list"])[4]');
    I.click('(//*[@value="trialCosts[0][uploadButton]"])');
    I.attachFile('trialCosts[1][fileUpload]', 'src/test/functionalTests/citizenFeatures/caseProgression/data/TestTXT.txt');
    I.click('(//*[@value="trialCosts[1][uploadButton]"])');

    //Documentary Evidence For Trial
    I.fillField('trialDocumentary[0][typeOfDocument]', 'Documentary evidence for the hearing - Type of Document 1');
    I.fillField('trialDocumentary[0][dateInputFields][dateDay]', '11');
    I.fillField('trialDocumentary[0][dateInputFields][dateMonth]', '02');
    I.fillField('trialDocumentary[0][dateInputFields][dateYear]', '2023');
    I.attachFile('trialDocumentary[0][fileUpload]','src/test/functionalTests/citizenFeatures/caseProgression/data/TestTIF.tif');
    I.click('(//*[@id="add-another-trial-list"])[5]');
    I.click('(//*[@value="trialDocumentary[0][uploadButton]"])');
    I.fillField('trialDocumentary[1][typeOfDocument]', 'Documentary evidence for the hearing - Type of Document 2');
    I.fillField('trialDocumentary[1][dateInputFields][dateDay]', '12');
    I.fillField('trialDocumentary[1][dateInputFields][dateMonth]', '02');
    I.fillField('trialDocumentary[1][dateInputFields][dateYear]', '2023');
    I.attachFile('trialDocumentary[1][fileUpload]','src/test/functionalTests/citizenFeatures/caseProgression/data/TestTIFF.tiff');
    await I.click('(//*[@value="trialDocumentary[1][uploadButton]"])');
  }

  async inputDataForSmallClaimsSections() {

    //Witness Section
    //Witness Statement - Subsection
    I.fillField('witnessStatement[0][witnessName]', 'Witness Statement - Witness Name 1');
    I.fillField('witnessStatement[0][dateInputFields][dateDay]', '01');
    I.fillField('witnessStatement[0][dateInputFields][dateMonth]', '02');
    I.fillField('witnessStatement[0][dateInputFields][dateYear]', '2023');
    await I.attachFile('witnessStatement[0][fileUpload]', 'src/test/functionalTests/citizenFeatures/caseProgression/data/TestBMP.bmp');
    await I.click('(//*[@value="witnessStatement[0][uploadButton]"])');
    /*await I.wait(5);
    await I.click('(//*[@id="add-another-witness-list"])[1]');
    I.fillField('witnessStatement[1][witnessName]', 'Witness Statement - Witness Name 2');
    I.fillField('witnessStatement[1][dateInputFields][dateDay]', '02');
    I.fillField('witnessStatement[1][dateInputFields][dateMonth]', '02');
    I.fillField('witnessStatement[1][dateInputFields][dateYear]', '2023');
    await I.attachFile('witnessStatement[1][fileUpload]', 'src/test/functionalTests/citizenFeatures/caseProgression/data/TestCSV.csv');
    await I.click('(//*[@value="witnessStatement[1][uploadButton]"])');*/
    //Witness Summary - Subsection
    I.fillField('witnessSummary[0][witnessName]', 'Witness Summary - Witness Name 1');
    I.fillField('witnessSummary[0][dateInputFields][dateDay]', '03');
    I.fillField('witnessSummary[0][dateInputFields][dateMonth]', '02');
    I.fillField('witnessSummary[0][dateInputFields][dateYear]', '2023');
    await I.attachFile('witnessSummary[0][fileUpload]', 'src/test/functionalTests/citizenFeatures/caseProgression/data/TestDOC.doc');
    await I.click('(//*[@value="witnessSummary[0][uploadButton]"])');
    /*await I.wait(5);
    await I.click('(//*[@id="add-another-witness-list"])[2]');
    I.fillField('witnessSummary[1][witnessName]', 'Witness Summary - Witness Name 2');
    I.fillField('witnessSummary[1][dateInputFields][dateDay]', '04');
    I.fillField('witnessSummary[1][dateInputFields][dateMonth]', '02');
    I.fillField('witnessSummary[1][dateInputFields][dateYear]', '2023');
    await I.attachFile('witnessSummary[1][fileUpload]', 'src/test/functionalTests/citizenFeatures/caseProgression/data/TestDOCX.docx');

    await I.click('(//*[@value="witnessSummary[1][uploadButton]"])');*/
    //Documents Referred to in the statement - Subsection
    I.fillField('documentsReferred[0][witnessName]', 'Documents referred witness name 1');
    I.fillField('documentsReferred[0][typeOfDocument]', 'Documents referred Type of Document 1');
    I.fillField('documentsReferred[0][dateInputFields][dateDay]', '05');
    I.fillField('documentsReferred[0][dateInputFields][dateMonth]', '02');
    I.fillField('documentsReferred[0][dateInputFields][dateYear]', '2023');
    await I.attachFile('documentsReferred[0][fileUpload]', 'src/test/functionalTests/citizenFeatures/caseProgression/data/TestJPEG.jpeg');
    await I.click('(//*[@value="documentsReferred[0][uploadButton]"])');
    /*await I.wait(5);
    await I.click('(//*[@id="add-another-witness-list"])[3]');
    I.fillField('documentsReferred[1][witnessName]', 'Documents referred witness name 2');
    I.fillField('documentsReferred[1][typeOfDocument]', 'Documents referred Type of Document 2');
    I.fillField('documentsReferred[1][dateInputFields][dateDay]', '06');
    I.fillField('documentsReferred[1][dateInputFields][dateMonth]', '02');
    I.fillField('documentsReferred[1][dateInputFields][dateYear]', '2023');
    await I.attachFile('documentsReferred[1][fileUpload]', 'src/test/functionalTests/citizenFeatures/caseProgression/data/TestJPG.jpg');

    await I.click('(//*[@value="documentsReferred[1][uploadButton]"])');*/
    //Evidences Section
    //Expert's report - Subsection
    I.fillField('expertReport[0][expertName]', 'Expert Report - Expert Name 1');
    I.fillField('expertReport[0][fieldOfExpertise]', 'Expert Report - Field of Expertise 1');
    I.fillField('expertReport[0][dateInputFields][dateDay]', '07');
    I.fillField('expertReport[0][dateInputFields][dateMonth]', '02');
    I.fillField('expertReport[0][dateInputFields][dateYear]', '2023');
    await I.attachFile('expertReport[0][fileUpload]', 'src/test/functionalTests/citizenFeatures/caseProgression/data/TestPDF.pdf');
    await I.click('(//*[@value="expertReport[0][uploadButton]"])');
    /*await I.wait(5);
    await I.click('(//*[@id="add-another-expert-list"])[1]');
    I.fillField('expertReport[1][expertName]', 'Expert Report - Expert Name 2');
    I.fillField('expertReport[1][fieldOfExpertise]', 'Expert Report - Field of Expertise 2');
    I.fillField('expertReport[1][dateInputFields][dateDay]', '08');
    I.fillField('expertReport[1][dateInputFields][dateMonth]', '02');
    I.fillField('expertReport[1][dateInputFields][dateYear]', '2023');
    await I.attachFile('expertReport[1][fileUpload]', 'src/test/functionalTests/citizenFeatures/caseProgression/data/TestPNG.png');
    await I.click('(//*[@value="expertReport[1][uploadButton]"])');*/
    //Joint Statement of Experts - Subsection
    I.fillField('expertStatement[0][expertName]', 'Expert Statement - Expert Name 1');
    I.fillField('expertStatement[0][fieldOfExpertise]', 'Expert Statement - Field Of Expertise 1');
    I.fillField('expertStatement[0][dateInputFields][dateDay]', '09');
    I.fillField('expertStatement[0][dateInputFields][dateMonth]', '02');
    I.fillField('expertStatement[0][dateInputFields][dateYear]', '2023');
    await I.attachFile('expertStatement[0][fileUpload]', 'src/test/functionalTests/citizenFeatures/caseProgression/data/TestPPT.ppt');
    await I.click('(//*[@value="expertStatement[0][uploadButton]"])');
    /*await I.wait(5);
    await I.click('(//*[@id="add-another-expert-list"])[2]');
    I.fillField('expertStatement[1][expertName]', 'Expert Statement - Expert Name 2');
    I.fillField('expertStatement[1][fieldOfExpertise]', 'Expert Statement - Field Of Expertise 2');
    I.fillField('expertStatement[1][dateInputFields][dateDay]', '10');
    I.fillField('expertStatement[1][dateInputFields][dateMonth]', '02');
    I.fillField('expertStatement[1][dateInputFields][dateYear]', '2023');
    await I.attachFile('expertStatement[1][fileUpload]', 'src/test/functionalTests/citizenFeatures/caseProgression/data/TestRTF.rtf');
    await I.click('(//*[@value="expertStatement[1][uploadButton]"])');*/
    //Hearing Documents Section
    //Documentary Evidence For Trial - Subsection
    I.fillField('trialDocumentary[0][typeOfDocument]', 'Documentary evidence for the hearing - Type of Document 1');
    I.fillField('trialDocumentary[0][dateInputFields][dateDay]', '11');
    I.fillField('trialDocumentary[0][dateInputFields][dateMonth]', '02');
    I.fillField('trialDocumentary[0][dateInputFields][dateYear]', '2023');
    await I.attachFile('trialDocumentary[0][fileUpload]','src/test/functionalTests/citizenFeatures/caseProgression/data/TestTIF.tif');
    await I.click('(//*[@value="trialDocumentary[0][uploadButton]"])');
    /*await I.wait(5);
    await I.click('(//*[@id="add-another-trial-list"])[1]');
    I.fillField('trialDocumentary[1][typeOfDocument]', 'Documentary evidence for the hearing - Type of Document 2');
    I.fillField('trialDocumentary[1][dateInputFields][dateDay]', '12');
    I.fillField('trialDocumentary[1][dateInputFields][dateMonth]', '02');
    I.fillField('trialDocumentary[1][dateInputFields][dateYear]', '2023');
    await I.attachFile('trialDocumentary[1][fileUpload]','src/test/functionalTests/citizenFeatures/caseProgression/data/TestTIFF.tiff');
    await I.click('(//*[@value="trialDocumentary[1][uploadButton]"])');*/
    //Trial Authorities - Subsection
    await I.attachFile('trialAuthorities[0][fileUpload]', 'src/test/functionalTests/citizenFeatures/caseProgression/data/TestXLS.xls');
    await I.click('button[value="trialAuthorities[0][uploadButton]"]');
    /*I.click('(//*[@id="add-another-trial-list"])[2]');
    await I.attachFile('trialAuthorities[1][fileUpload]', 'src/test/functionalTests/citizenFeatures/caseProgression/data/TestXLSX.xlsx');
    await I.click('(//*[@value="trialAuthorities[1][uploadButton]"])');*/
  }
}

module.exports = UploadYourDocument;
