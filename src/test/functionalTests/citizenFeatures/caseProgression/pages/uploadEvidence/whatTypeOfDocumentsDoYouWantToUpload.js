const ContactUs = require('../../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();
let language = 'en';

const content = {
  heading: {
    title:{
      en: 'What types of documents do you want to upload?',
      cy: 'Pa fath o ddogfennau ydych chi eisiau eu huwchlwytho?',
    },
    caseNumber: {
      en: 'Case number',
      cy: 'Rhif yr achor',
    },
    claimAmount: {
      en: 'Claim amount',
      cy: 'Swm yr hawliad',
    },
    selectDocumentType: {
      en: 'Select the types of documents that apply to your case. You may not need to upload documents for every category.',
      cy: 'Dewiswch y mathau o ddogfennau sy\'n berthnasol i\'ch achos. Efallai na fydd angen i chi uwchlwytho dogfennau ar gyfer pob categori.',
    },
  },
  disclosure: {
    title: {
      en: 'Disclosure',
      cy: 'Datgelu',
    },
    documentsForDisclosure: {
      en: 'Documents for disclosure',
      cy: 'Dogfennau i’w datgelu',
    },
    documentsForDisclosureHint: {
      en: 'Recorded information that you must show the other parties - for example, contracts, invoices, receipts, emails, text messages, photos, social media messages',
      cy: 'Gwybodaeth wedi’i recordio y mae’n rhaid i chi ei dangos i’r partïon eraill - er enghraifft, contractau, anfonebau, derbynebau, negeseuon e-bost, negeseuon testun, lluniau, negeseuon cyfryngau cymdeithasol',
    },
    disclosureList: {
      en: 'Disclosure list',
      cy: 'Rhestr ddatgelu',
    },
    disclosureListHint: {
      en: 'A list of the documents that you must show the other parties',
      cy: 'Rhestr o’r dogfennau y mae’n rhaid i chi eu dangos i’r partïon eraill',
    },
  },
  witness: {
    title: {
      en: 'Witness evidence',
      cy: 'Tystiolaeth tyst',
    },
    witnessStatement: {
      en: 'Witness statement',
      cy: 'Datganiad tyst',
    },
    witnessStatementHint: {
      en: 'A written statement of what your witness wants to tell the court',
      cy: 'Datganiad ysgrifenedig o’r hyn y mae eich tyst am ei ddweud wrth y llys',
    },
    witnessSummary: {
      en: 'Witness summary',
      cy: 'Crynodeb tyst',
    },
    witnessSummaryHint: {
      en: 'If you cannot get a written statement from your witness, you can write a summary of the evidence you would want to include in the witness statement. You must apply to the court to use a witness summary at the hearing.',
      cy: 'Os na allwch gael datganiad ysgrifenedig gan eich tyst, gallwch ysgrifennu crynodeb o’r dystiolaeth y byddech am ei chynnwys yn y datganiad tyst. Mae\'n rhaid i chi wneud cais i\'r llys i ddefnyddio crynodeb tyst yn y gwrandawiad. Rhaid i chi wneud hyn cyn y dyddiad cau. Defnyddiwch',
    },
    noticeOfIntention: {
      en: 'Notice of intention to rely on hearsay evidence',
      cy: 'Hysbysiad o’r bwriad i ddibynnu ar dystiolaeth achlust',
    },
    noticeOfIntentionHint: {
      en: 'Notice to tell the other parties that you intend to rely on hearsay evidence at the trail. If the evidence is in a witness statement and the witness is not going to be in court, you must say why',
      cy: 'Hysbysiad i ddweud wrth y partïon eraill eich bod yn bwriadu dibynnu ar dystiolaeth achlust yn y treial. Os yw’r dystiolaeth mewn datganiad tyst ac nad yw’r tyst yn mynd i fod yn y llys, rhaid i chi ddweud pam',
    },
    documentsReferred: {
      en: 'Documents referred to in the statement',
      cy: 'Dogfennau y cyfeirir atynt yn y datganiad',
    },
    documentsReferredHint: {
      en: 'Documents you or your witness refer to in the statement, including emails, receipts, invoices, contracts and photos',
      cy: 'Dogfennau rydych chi neu’ch tyst yn cyfeirio atynt yn y datganiad, gan gynnwys negeseuon e-bost, derbynebau, anfonebau, contractau a lluniau',
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
    reportHint: {
      en: 'A written report by your expert. Expert evidence is an opinion based on the expertise of a specialist, for example - a building surveyor who can comment on the quality of building work. An expert is not a legal representative',
      cy: 'Adroddiad ysgrifenedig gan eich arbenigwr. Tystiolaeth arbenigwr yw barn sy’n seiliedig ar arbenigedd arbenigwr, er enghraifft - syrfëwr adeiladu a all wneud sylwadau ar ansawdd gwaith adeiladu. Nid yw arbenigwr yn gynrychiolydd cyfreithiol',
    },
    jointStatement: {
      en: 'Joint statement of experts',
      cy: 'Datganiad ar y cyd yr arbenigwyr',
    },
    jointStatementHint: {
      en: 'A statement by the experts for both parties, setting out the facts in the case that they agree on or disagree on. This only applies if you and the other party set up a meeting for your experts. The experts write this statement after their discussion',
      cy: 'Datganiad gan arbenigwyr y ddau barti, yn nodi’r ffeithiau yn yr achos y maent yn cytuno arnynt neu’n anghytuno arnynt. Bydd hyn ond yn berthnasol os byddwch chi a’r parti arall yn trefnu cyfarfod ar gyfer eich arbenigwyr. Bydd yr arbenigwyr yn ysgrifennu’r datganiad hwn ar ôl eu trafodaeth',
    },
    questions: {
      en: 'Questions for other party\'s expert or joint expert',
      cy: 'Cwestiynau i arbenigwr y parti arall neu gyd arbenigwyr',
    },
    questionsHint: {
      en: 'Written questions about an expert\'s report or a joint statement of experts',
      cy: 'Cwestiynau ysgrifenedig am adroddiad arbenigwr neu ddatganiad ar y cyd arbenigwyr',
    },
    answers: {
      en: 'Answers to questions asked by other party',
      cy: 'Atebion i’r cwestiynau a ofynnwyd gan y parti arall',
    },
    answersHint: {
      en: 'Your expert\'s answers to questions put by the other party',
      cy: 'Atebion eich arbenigwr i gwestiynau a ofynnwyd gan y parti arall',
    },
  },
  trial:{
    summary: {
      en: 'Case summary',
      cy: 'Crynodeb o’r achos',
    },
    summaryHint: {
      en: 'Overview of your whole case',
      cy: 'Trosolwg o’ch achos cyfan',
    },
    skeleton: {
      en: 'Skeleton argument',
      cy: 'Dadl fframwaith',
    },
    skeletonHint: {
      en: 'Summary of the case, the areas in dispute and the reasons why you think those disputes should be resolved in your favour',
      cy: 'Crynodeb o’r achos, y meysydd sy’n destun anghydfod a’r rhesymau dros pam rydych chi’n meddwl y dylid datrys yr anghydfodau hynny o’ch plaid',
    },
    authorities: {
      en: 'Legal authorities',
      cy: 'Awdurdodau cyfreithiol',
    },
    authoritiesHint: {
      en: 'You can use legal authorities to support your case. These are Acts of Parliament, Rules - for example, the Civil Procedure Rules - or other court cases that have decided a point that is relevant to your case. Copy and paste the relevant extracts from Acts, Rules or cases into a document to upload',
      cy: 'Gallwch ddefnyddio awdurdodau cyfreithiol i gefnogi eich achos’. Deddfau Seneddol yw’r rhain, Rheolau - er enghraifft, Rheolau Trefniadaeth Sifil - neu achosion llys eraill sydd wedi penderfynu pwynt sy’n berthnasol i’ch achos chi. Copïwch a gludwch y darnau perthnasol o Ddeddfau, Rheolau neu achosion i ddogfen i’w huwchlwytho',
    },
    costs: {
      en: 'Costs',
      cy: 'Costau',
    },
    costsHint: {
      en: 'A detailed list of the costs you have incurred in making or defending the claim, for example photocopying, getting copies of contracts, include receipts',
      cy: 'Rhestr fanwl o’r costau yr ydych wedi’u talu wrth wneud neu amddiffyn yr hawliad, er enghraifft llungopïo, cael copïau o gontractau. Dylech gynnwys derbynebau',
    },
    documentaryEvidence: {
      en: 'Documentary evidence for trial',
      cy: 'Tystiolaeth ddogfennol ar gyfer y treial',
    },
    documentaryEvidenceHint: {
      en: 'Documents that you wish to rely on at the trial, including emails, receipts, invoices, contracts and photos. You do not need to add documents that you have already added under witness evidence',
      cy: 'Dogfennau yr hoffech ddibynnu arnynt yn y treial, yn cynnwys negeseuon e-bost, derbynebau, anfonebau, contractau a lluniau. Nid oes angen i chi ychwanegu dogfennau rydych eisoes wedi’u hychwanegu o dan ‘tystiolaeth tyst’',
    },
  },
  hearing: {
    documentaryEvidence: {
      en: 'Documentary evidence for the hearing',
      cy: 'Tystiolaeth ddogfennol ar gyfer y gwrandawiad',
    },
    documentaryEvidenceHint: {
      en: 'Documents that you wish to rely on at the hearing, including emails, receipts, invoices, contracts and photos. You do not need to add documents that you have already added under witness evidence',
      cy: 'Dogfennau yr hoffech ddibynnu arnynt yn y gwrandawiad, gan gynnwys negeseuon e-bost, derbynebau, anfonebau, contractau a lluniau. Nid oes angen i chi ychwanegu dogfennau rydych eisoes wedi’u hychwanegu o dan ‘tystiolaeth tyst’',
    },
    authorities: {
      en: 'Legal authorities',
      cy: 'Awdurdodau cyfreithiol',
    },
    authoritiesHint: {
      en: 'You can use legal authorities to support your case. These are Acts of Parliament, Rules - for example, the Civil Procedure Rules - or other court cases that have decided a point that is relevant to your case. Copy and paste the relevant extracts from Acts, Rules or cases into a document to upload',
      cy: 'Gallwch ddefnyddio ‘awdurdodau cyfreithiol’ i gefnogi eich achos. Deddfau Seneddol yw’r rhain, Rheolau - er enghraifft, Rheolau Trefniadaeth Sifil - neu achosion llys eraill sydd wedi penderfynu pwynt sy’n berthnasol i’ch achos chi. Copïwch a gludwch y darnau perthnasol o Ddeddfau, Rheolau neu achosion i ddogfen i’w huwchlwytho',
    },
  },
  buttons:{
    cancel: {
      en: 'Cancel',
      cy: 'Canslo',
    },
  },
};

class WhatTypeOfDocumentsDoYouWantToUpload {

  checkPageFullyLoaded (languageChosen = 'en') {
    language = languageChosen;
    I.seeElement(`//a[.='${content.buttons.cancel[language]}']`);
  }

  nextAction(nextAction) {
    I.click(nextAction);
  }

  verifyPageContent(caseNumber, claimAmount, caseType) {
    this.checkPageFullyLoaded();
    this.verifyBreadcrumbs();
    this.verifyHeadingDetails();
    this.verifyCaseNumberClaimAmount(caseNumber, claimAmount);
    if (caseType === 'FastTrack') {
      this.verifyDisclosureSectionContent();
      this.verifyWitnessEvidenceSectionContent();
      this.verifyExpertEvidenceSectionContent(caseType);
      this.verifyTrialDocumentsSectionContent();
    } else if (caseType === 'SmallClaims') {
      this.verifyWitnessEvidenceSectionContent();
      this.verifyExpertEvidenceSectionContent(caseType);
      this.verifyHearingDocumentsSectionContent();
    }
    contactUs.verifyContactUs(language);
  }

  verifyBreadcrumbs() {
    I.see('Back', '//a[@class="govuk-back-link"]');
  }

  checkAllDocumentUploadOptions(claimType) {

    if (claimType === 'FastTrack') {

      //Disclosure Section
      I.checkOption('#documents');
      I.checkOption('#list');

      //Witness evidence Section
      I.checkOption('#witnessStatement');
      I.checkOption('#summary');
      I.checkOption('#witnessNotice');
      I.checkOption('#witnessDocuments');

      //Expert Evidence
      I.checkOption('#report');
      I.checkOption('#statement');
      I.checkOption('#questions');
      I.checkOption('#answer');

      //Trial documents
      I.checkOption('#case');
      I.checkOption('#skeleton');
      I.checkOption('#legal');
      I.checkOption('#cost');
      I.checkOption('#documentary');

    } else if (claimType === 'SmallClaims') {

      //Witness evidence Section
      I.checkOption('#witnessStatement');
      I.checkOption('#summary');
      I.checkOption('#witnessDocuments');

      //Expert Evidence
      I.checkOption('#report');
      I.checkOption('#statement');

      //Hearing Docuents
      I.checkOption('#documentary');
      I.checkOption('#legal');
    }

  }

  verifyHeadingDetails() {
    I.see('Hearing', 'span');
    I.see(content.heading.title[language], 'h1');
    I.see(content.heading.selectDocumentType[language]);
  }

  verifyCaseNumberClaimAmount(caseNumber, claimAmount) {
    I.see(content.heading.caseNumber[language]+ ': ' + caseNumber);
    I.see(content.heading.claimAmount[language]+ ': ' + claimAmount);
  }

  verifyDisclosureSectionContent() {
    I.see(content.disclosure.title[language]);
    I.see(content.disclosure.documentsForDisclosure[language]);
    I.see(content.disclosure.documentsForDisclosureHint[language]);
    I.see(content.disclosure.disclosureList[language]);
    I.see(content.disclosure.disclosureListHint[language]);
  }

  verifyWitnessEvidenceSectionContent(claimType) {
    I.see(content.witness.title[language]);
    I.see(content.witness.witnessStatement[language]);
    I.see(content.witness.witnessStatementHint[language]);
    I.see(content.witness.witnessSummary[language]);
    I.see(content.witness.witnessSummaryHint[language]);
    if (claimType === 'FastTrack') {
      I.see(content.witness.noticeOfIntention[language]);
      I.see(content.witness.noticeOfIntentionHint[language]);
    }
    I.see(content.witness.documentsReferred[language]);
    I.see(content.witness.documentsReferredHint[language]);
  }

  verifyExpertEvidenceSectionContent(claimType) {
    I.see(content.expert.title[language]);
    I.see(content.expert.report[language]);
    I.see(content.expert.reportHint[language]);
    I.see(content.expert.jointStatement[language]);
    I.see(content.expert.jointStatementHint[language]);
    if (claimType === 'FastTrack') {
      I.see(content.expert.questions[language]);
      I.see(content.expert.questionsHint[language]);
      I.see(content.expert.answers[language]);
      I.see(content.expert.answersHint[language]);
    }
  }

  verifyTrialDocumentsSectionContent() {
    I.see(content.trial.summary[language]);
    I.see(content.trial.summaryHint[language]);
    I.see(content.trial.skeleton[language]);
    I.see(content.trial.skeletonHint[language]);
    I.see(content.trial.authorities[language]);
    I.see(content.trial.authoritiesHint[language]);
    I.see(content.trial.costs[language]);
    I.see(content.trial.costsHint[language]);
    I.see(content.trial.documentaryEvidence[language]);
    I.see(content.trial.documentaryEvidenceHint[language]);
  }

  verifyHearingDocumentsSectionContent() {
    I.see(content.hearing.documentaryEvidence[language]);
    I.see(content.hearing.documentaryEvidenceHint[language]);
    I.see(content.hearing.authorities[language]);
    I.see(content.hearing.authoritiesHint[language]);
  }

}

module.exports = WhatTypeOfDocumentsDoYouWantToUpload;
