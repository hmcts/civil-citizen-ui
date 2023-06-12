import {
  CCDEvidenceUpload, UploadDocuments,
  UploadDocumentTypes,
  UploadEvidenceDocumentType,
  UploadEvidenceElementCCD,
  UploadEvidenceExpert,
  UploadEvidenceWitness,
} from 'models/caseProgression/uploadDocumentsType';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {
  EvidenceUploadDisclosure,
  EvidenceUploadExpert,
  EvidenceUploadTrial,
  EvidenceUploadWitness,
} from 'models/document/documentType';
import {v4 as uuidv4} from 'uuid';

export const toCCDEvidenceUploadExpert = (evidenceUpload: any ): UploadEvidenceExpert => {
  return {
    expertOptionName: evidenceUpload.expertOptionName,
    expertOptionExpertise: evidenceUpload.expertOptionExpertise,
    expertOptionExpertises: evidenceUpload.expertOptionExpertises,
    expertOptionOtherParty: evidenceUpload.expertOptionOtherParty,
    expertDocumentQuestion: evidenceUpload.expertDocumentQuestion,
    expertDocumentAnswer: evidenceUpload.expertDocumentAnswer,
    expertOptionUploadDate: evidenceUpload.expertOptionUploadDate,
    expertDocument: evidenceUpload.expertDocument,
    createdDateTime: evidenceUpload.createdDateTime,
  };
};

export const toCCDEvidenceUploadWitness = (evidenceUpload: any ): UploadEvidenceWitness => {
  return {
    witnessOptionName: evidenceUpload.witnessOptionName,
    witnessOptionUploadDate: evidenceUpload.witnessOptionUploadDate,
    witnessOptionDocument: evidenceUpload.witnessOptionDocument,
    createdDateTime: evidenceUpload.createdDateTime,
  };
};

export const toCCDEvidenceUploadDocumentType = (evidenceUpload: any ): UploadEvidenceDocumentType => {
  return {
    typeOfDocument: evidenceUpload.typeOfDocument,
    documentIssuedDate: evidenceUpload.documentIssuedDate,
    documentUpload: evidenceUpload.documentUpload,
    createdDateTime: evidenceUpload.createdDateTime,
  };
};

export const toCCDEvidenceUpload = (cuiEvidenceUpload: CaseProgression): CCDEvidenceUpload => {
  if (!cuiEvidenceUpload) return undefined;

  return {
    //applicant
    documentDisclosureList: createCCDEvidenceUploadList(cuiEvidenceUpload.claimantUploadDocuments.disclosure, EvidenceUploadDisclosure.DISCLOSURE_LIST),
    documentForDisclosure: createCCDEvidenceUploadList(cuiEvidenceUpload.claimantUploadDocuments.disclosure, EvidenceUploadDisclosure.DOCUMENTS_FOR_DISCLOSURE),
    documentWitnessStatement: createCCDEvidenceUploadList(cuiEvidenceUpload.claimantUploadDocuments.witness, EvidenceUploadWitness.WITNESS_STATEMENT),
    documentWitnessSummary: createCCDEvidenceUploadList(cuiEvidenceUpload.claimantUploadDocuments.witness, EvidenceUploadWitness.WITNESS_SUMMARY),
    documentHearsayNotice: createCCDEvidenceUploadList(cuiEvidenceUpload.claimantUploadDocuments.witness, EvidenceUploadWitness.NOTICE_OF_INTENTION),
    documentReferredInStatement: createCCDEvidenceUploadList(cuiEvidenceUpload.claimantUploadDocuments.witness, EvidenceUploadWitness.DOCUMENTS_REFERRED),
    documentExpertReport: createCCDEvidenceUploadList(cuiEvidenceUpload.claimantUploadDocuments.expert, EvidenceUploadExpert.EXPERT_REPORT),
    documentJointStatement: createCCDEvidenceUploadList(cuiEvidenceUpload.claimantUploadDocuments.expert, EvidenceUploadExpert.STATEMENT),
    documentQuestions: createCCDEvidenceUploadList(cuiEvidenceUpload.claimantUploadDocuments.expert, EvidenceUploadExpert.QUESTIONS_FOR_EXPERTS),
    documentAnswers: createCCDEvidenceUploadList(cuiEvidenceUpload.claimantUploadDocuments.expert, EvidenceUploadExpert.ANSWERS_FOR_EXPERTS),
    documentCaseSummary: createCCDEvidenceUploadList(cuiEvidenceUpload.claimantUploadDocuments.trial, EvidenceUploadTrial.CASE_SUMMARY),
    documentSkeletonArgument: createCCDEvidenceUploadList(cuiEvidenceUpload.claimantUploadDocuments.trial, EvidenceUploadTrial.SKELETON_ARGUMENT),
    documentAuthorities: createCCDEvidenceUploadList(cuiEvidenceUpload.claimantUploadDocuments.trial, EvidenceUploadTrial.AUTHORITIES),
    documentCosts: createCCDEvidenceUploadList(cuiEvidenceUpload.claimantUploadDocuments.trial, EvidenceUploadTrial.COSTS),
    documentEvidenceForTrial: createCCDEvidenceUploadList(cuiEvidenceUpload.claimantUploadDocuments.trial, EvidenceUploadTrial.DOCUMENTARY),
    caseDocumentUploadDate: getLatestEvidenceUploadDate(cuiEvidenceUpload.claimantUploadDocuments),
    //respondent
    documentDisclosureListRes: createCCDEvidenceUploadList(cuiEvidenceUpload.defendantUploadDocuments.disclosure, EvidenceUploadDisclosure.DISCLOSURE_LIST),
    documentForDisclosureRes: createCCDEvidenceUploadList(cuiEvidenceUpload.defendantUploadDocuments.disclosure, EvidenceUploadDisclosure.DOCUMENTS_FOR_DISCLOSURE),
    documentWitnessStatementRes: createCCDEvidenceUploadList(cuiEvidenceUpload.defendantUploadDocuments.witness, EvidenceUploadWitness.WITNESS_STATEMENT),
    documentWitnessSummaryRes: createCCDEvidenceUploadList(cuiEvidenceUpload.defendantUploadDocuments.witness, EvidenceUploadWitness.WITNESS_SUMMARY),
    documentHearsayNoticeRes: createCCDEvidenceUploadList(cuiEvidenceUpload.defendantUploadDocuments.witness, EvidenceUploadWitness.NOTICE_OF_INTENTION),
    documentReferredInStatementRes: createCCDEvidenceUploadList(cuiEvidenceUpload.defendantUploadDocuments.witness, EvidenceUploadWitness.DOCUMENTS_REFERRED),
    documentExpertReportRes: createCCDEvidenceUploadList(cuiEvidenceUpload.defendantUploadDocuments.expert, EvidenceUploadExpert.EXPERT_REPORT),
    documentJointStatementRes: createCCDEvidenceUploadList(cuiEvidenceUpload.defendantUploadDocuments.expert, EvidenceUploadExpert.STATEMENT),
    documentQuestionsRes: createCCDEvidenceUploadList(cuiEvidenceUpload.defendantUploadDocuments.expert, EvidenceUploadExpert.QUESTIONS_FOR_EXPERTS),
    documentAnswersRes: createCCDEvidenceUploadList(cuiEvidenceUpload.defendantUploadDocuments.expert, EvidenceUploadExpert.ANSWERS_FOR_EXPERTS),
    documentCaseSummaryRes: createCCDEvidenceUploadList(cuiEvidenceUpload.defendantUploadDocuments.trial, EvidenceUploadTrial.CASE_SUMMARY),
    documentSkeletonArgumentRes: createCCDEvidenceUploadList(cuiEvidenceUpload.defendantUploadDocuments.trial, EvidenceUploadTrial.SKELETON_ARGUMENT),
    documentAuthoritiesRes: createCCDEvidenceUploadList(cuiEvidenceUpload.defendantUploadDocuments.trial, EvidenceUploadTrial.AUTHORITIES),
    documentCostsRes: createCCDEvidenceUploadList(cuiEvidenceUpload.defendantUploadDocuments.trial, EvidenceUploadTrial.COSTS),
    documentEvidenceForTrialRes: createCCDEvidenceUploadList(cuiEvidenceUpload.defendantUploadDocuments.trial, EvidenceUploadTrial.DOCUMENTARY),
    caseDocumentUploadDateRes: getLatestEvidenceUploadDate(cuiEvidenceUpload.defendantUploadDocuments),
  };
};

const getLatestEvidenceUploadDate = (uploadDocument: UploadDocuments) : Date => {

  const dateTimeList = [] as number[];

  dateTimeList.push(getLatestListDate(uploadDocument.witness));
  dateTimeList.push(getLatestListDate(uploadDocument.expert));
  dateTimeList.push(getLatestListDate(uploadDocument.trial));
  dateTimeList.push(getLatestListDate(uploadDocument.disclosure));

  let highestNumber = 0;

  for(const number of dateTimeList)
  {
    highestNumber = highestNumber > number ? highestNumber : number;
  }

  return highestNumber != 0 ? new Date(highestNumber) : null;
};

const getLatestListDate = (evidenceList: UploadDocumentTypes[]) : number => {

  let newestUploadDate = new Date(0).getTime();

  for (const uploadDocumentType of evidenceList) {

    const documentUploadDate = uploadDocumentType.caseDocument.createdDateTime.getTime();
    newestUploadDate = documentUploadDate > newestUploadDate ? documentUploadDate : newestUploadDate;

  }

  return newestUploadDate;
};

const createCCDEvidenceUploadList = (evidenceList: UploadDocumentTypes[],
  evidenceType: EvidenceUploadWitness | EvidenceUploadDisclosure | EvidenceUploadExpert | EvidenceUploadTrial) : UploadEvidenceElementCCD[] => {

  const ccdEvidenceList: UploadEvidenceElementCCD[] = [] as UploadEvidenceElementCCD[];
  let id: string;

  for(let i = 0; i < evidenceList.length; i++)
  {
    if(evidenceList[i].documentType !== evidenceType)
    {
      continue;
    }

    let evidenceItem;
    id = null;

    switch(evidenceList[i].documentType)
    {
      case EvidenceUploadWitness.WITNESS_STATEMENT:
      case EvidenceUploadWitness.WITNESS_SUMMARY:
      case EvidenceUploadWitness.NOTICE_OF_INTENTION:
        evidenceItem = toCCDEvidenceUploadWitness(evidenceList[i].caseDocument);
        break;
      case EvidenceUploadExpert.EXPERT_REPORT:
      case EvidenceUploadExpert.STATEMENT:
      case EvidenceUploadExpert.QUESTIONS_FOR_EXPERTS:
      case EvidenceUploadExpert.ANSWERS_FOR_EXPERTS:
        evidenceItem = toCCDEvidenceUploadExpert(evidenceList[i].caseDocument);
        break;
      case EvidenceUploadWitness.DOCUMENTS_REFERRED:
      case EvidenceUploadDisclosure.DISCLOSURE_LIST:
      case EvidenceUploadDisclosure.DOCUMENTS_FOR_DISCLOSURE:
      case EvidenceUploadTrial.CASE_SUMMARY:
      case EvidenceUploadTrial.SKELETON_ARGUMENT:
      case EvidenceUploadTrial.AUTHORITIES:
      case EvidenceUploadTrial.COSTS:
      case EvidenceUploadTrial.DOCUMENTARY:
        evidenceItem = toCCDEvidenceUploadDocumentType(evidenceList[i].caseDocument);
        break;
    }

    id = evidenceList[i].uuid == null ? uuidv4() : evidenceList[i].uuid ;

    ccdEvidenceList.push({id: id, value: evidenceItem});

  }

  return ccdEvidenceList;
};
