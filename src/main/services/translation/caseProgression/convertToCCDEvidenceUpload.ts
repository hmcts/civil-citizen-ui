import {
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
import {CCDClaim} from 'models/civilClaimResponse';

export const toCCDEvidenceUpload = (cuiEvidenceUpload: CaseProgression, ccdClaim: CCDClaim, isClaimant: boolean): CCDClaim => {
  if (!cuiEvidenceUpload) return undefined;

  if(isClaimant){
    ccdClaim.documentDisclosureList = createCCDEvidenceUploadList(cuiEvidenceUpload.claimantUploadDocuments.disclosure, EvidenceUploadDisclosure.DISCLOSURE_LIST);
    ccdClaim.documentForDisclosure = createCCDEvidenceUploadList(cuiEvidenceUpload.claimantUploadDocuments.disclosure, EvidenceUploadDisclosure.DOCUMENTS_FOR_DISCLOSURE);
    ccdClaim.documentWitnessStatement = createCCDEvidenceUploadList(cuiEvidenceUpload.claimantUploadDocuments.witness, EvidenceUploadWitness.WITNESS_STATEMENT);
    ccdClaim.documentWitnessSummary = createCCDEvidenceUploadList(cuiEvidenceUpload.claimantUploadDocuments.witness, EvidenceUploadWitness.WITNESS_SUMMARY);
    ccdClaim.documentHearsayNotice = createCCDEvidenceUploadList(cuiEvidenceUpload.claimantUploadDocuments.witness, EvidenceUploadWitness.NOTICE_OF_INTENTION);
    ccdClaim.documentReferredInStatement = createCCDEvidenceUploadList(cuiEvidenceUpload.claimantUploadDocuments.witness, EvidenceUploadWitness.DOCUMENTS_REFERRED);
    ccdClaim.documentExpertReport = createCCDEvidenceUploadList(cuiEvidenceUpload.claimantUploadDocuments.expert, EvidenceUploadExpert.EXPERT_REPORT);
    ccdClaim.documentJointStatement = createCCDEvidenceUploadList(cuiEvidenceUpload.claimantUploadDocuments.expert, EvidenceUploadExpert.STATEMENT);
    ccdClaim.documentQuestions = createCCDEvidenceUploadList(cuiEvidenceUpload.claimantUploadDocuments.expert, EvidenceUploadExpert.QUESTIONS_FOR_EXPERTS);
    ccdClaim.documentAnswers = createCCDEvidenceUploadList(cuiEvidenceUpload.claimantUploadDocuments.expert, EvidenceUploadExpert.ANSWERS_FOR_EXPERTS);
    ccdClaim.documentCaseSummary = createCCDEvidenceUploadList(cuiEvidenceUpload.claimantUploadDocuments.trial, EvidenceUploadTrial.CASE_SUMMARY);
    ccdClaim.documentSkeletonArgument = createCCDEvidenceUploadList(cuiEvidenceUpload.claimantUploadDocuments.trial, EvidenceUploadTrial.SKELETON_ARGUMENT);
    ccdClaim.documentAuthorities = createCCDEvidenceUploadList(cuiEvidenceUpload.claimantUploadDocuments.trial, EvidenceUploadTrial.AUTHORITIES);
    ccdClaim.documentCosts = createCCDEvidenceUploadList(cuiEvidenceUpload.claimantUploadDocuments.trial, EvidenceUploadTrial.COSTS);
    ccdClaim.documentEvidenceForTrial = createCCDEvidenceUploadList(cuiEvidenceUpload.claimantUploadDocuments.trial, EvidenceUploadTrial.DOCUMENTARY);
    ccdClaim.caseDocumentUploadDate = new Date();
  } else {
    ccdClaim.documentDisclosureListRes = createCCDEvidenceUploadList(cuiEvidenceUpload.defendantUploadDocuments.disclosure, EvidenceUploadDisclosure.DISCLOSURE_LIST);
    ccdClaim.documentForDisclosureRes = createCCDEvidenceUploadList(cuiEvidenceUpload.defendantUploadDocuments.disclosure, EvidenceUploadDisclosure.DOCUMENTS_FOR_DISCLOSURE);
    ccdClaim.documentWitnessStatementRes = createCCDEvidenceUploadList(cuiEvidenceUpload.defendantUploadDocuments.witness, EvidenceUploadWitness.WITNESS_STATEMENT);
    ccdClaim.documentWitnessSummaryRes = createCCDEvidenceUploadList(cuiEvidenceUpload.defendantUploadDocuments.witness, EvidenceUploadWitness.WITNESS_SUMMARY);
    ccdClaim.documentHearsayNoticeRes = createCCDEvidenceUploadList(cuiEvidenceUpload.defendantUploadDocuments.witness, EvidenceUploadWitness.NOTICE_OF_INTENTION);
    ccdClaim.documentReferredInStatementRes = createCCDEvidenceUploadList(cuiEvidenceUpload.defendantUploadDocuments.witness, EvidenceUploadWitness.DOCUMENTS_REFERRED);
    ccdClaim.documentExpertReportRes = createCCDEvidenceUploadList(cuiEvidenceUpload.defendantUploadDocuments.expert, EvidenceUploadExpert.EXPERT_REPORT);
    ccdClaim.documentJointStatementRes = createCCDEvidenceUploadList(cuiEvidenceUpload.defendantUploadDocuments.expert, EvidenceUploadExpert.STATEMENT);
    ccdClaim.documentQuestionsRes = createCCDEvidenceUploadList(cuiEvidenceUpload.defendantUploadDocuments.expert, EvidenceUploadExpert.QUESTIONS_FOR_EXPERTS);
    ccdClaim.documentAnswersRes = createCCDEvidenceUploadList(cuiEvidenceUpload.defendantUploadDocuments.expert, EvidenceUploadExpert.ANSWERS_FOR_EXPERTS);
    ccdClaim.documentCaseSummaryRes = createCCDEvidenceUploadList(cuiEvidenceUpload.defendantUploadDocuments.trial, EvidenceUploadTrial.CASE_SUMMARY);
    ccdClaim.documentSkeletonArgumentRes = createCCDEvidenceUploadList(cuiEvidenceUpload.defendantUploadDocuments.trial, EvidenceUploadTrial.SKELETON_ARGUMENT);
    ccdClaim.documentAuthoritiesRes = createCCDEvidenceUploadList(cuiEvidenceUpload.defendantUploadDocuments.trial, EvidenceUploadTrial.AUTHORITIES);
    ccdClaim.documentCostsRes = createCCDEvidenceUploadList(cuiEvidenceUpload.defendantUploadDocuments.trial, EvidenceUploadTrial.COSTS);
    ccdClaim.documentEvidenceForTrialRes = createCCDEvidenceUploadList(cuiEvidenceUpload.defendantUploadDocuments.trial, EvidenceUploadTrial.DOCUMENTARY);
    ccdClaim.caseDocumentUploadDateRes = new Date();
  }

  return ccdClaim;
};

const createCCDEvidenceUploadList = (evidenceList?: UploadDocumentTypes[],
  evidenceType?: EvidenceUploadWitness | EvidenceUploadDisclosure | EvidenceUploadExpert | EvidenceUploadTrial) : UploadEvidenceElementCCD[] => {

  if(!evidenceList) return undefined;

  const ccdEvidenceList: UploadEvidenceElementCCD[] = [] as UploadEvidenceElementCCD[];
  let id: string;

  if(evidenceList)
  {
    for(let i = 0; i < evidenceList.length; i++) {

      if (evidenceList[i].documentType !== evidenceType || !evidenceList[i].caseDocument) {
        continue;
      }

      let evidenceItem: UploadEvidenceWitness | UploadEvidenceExpert | UploadEvidenceDocumentType;
      id = null;

      switch (evidenceList[i].documentType) {
        case EvidenceUploadWitness.WITNESS_STATEMENT:
        case EvidenceUploadWitness.WITNESS_SUMMARY:
        case EvidenceUploadWitness.NOTICE_OF_INTENTION:
          evidenceItem = evidenceList[i].caseDocument as UploadEvidenceWitness;
          break;
        case EvidenceUploadExpert.EXPERT_REPORT:
        case EvidenceUploadExpert.STATEMENT:
        case EvidenceUploadExpert.QUESTIONS_FOR_EXPERTS:
        case EvidenceUploadExpert.ANSWERS_FOR_EXPERTS:
          evidenceItem = evidenceList[i].caseDocument as UploadEvidenceExpert;
          break;
        case EvidenceUploadWitness.DOCUMENTS_REFERRED:
        case EvidenceUploadDisclosure.DISCLOSURE_LIST:
        case EvidenceUploadDisclosure.DOCUMENTS_FOR_DISCLOSURE:
        case EvidenceUploadTrial.CASE_SUMMARY:
        case EvidenceUploadTrial.SKELETON_ARGUMENT:
        case EvidenceUploadTrial.AUTHORITIES:
        case EvidenceUploadTrial.COSTS:
        case EvidenceUploadTrial.DOCUMENTARY:
          evidenceItem = evidenceList[i].caseDocument as UploadEvidenceDocumentType;
          break;
      }
      id = evidenceList[i].uuid == null ? uuidv4() : evidenceList[i].uuid ;

      ccdEvidenceList.push({id: id, value: evidenceItem});
    }
  }

  return ccdEvidenceList.length > 0 ? ccdEvidenceList : undefined;
};
