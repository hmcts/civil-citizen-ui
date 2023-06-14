import {CCDClaim} from 'models/civilClaimResponse';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {
  UploadDocuments,
  UploadDocumentTypes,
  UploadEvidenceElementCCD
} from 'models/caseProgression/uploadDocumentsType';
import {
  EvidenceUploadDisclosure,
  EvidenceUploadExpert,
  EvidenceUploadTrial,
  EvidenceUploadWitness,
} from 'models/document/documentType';

export const toCUICaseProgression = (ccdClaim: CCDClaim): CaseProgression => {
  if (ccdClaim) {
    const caseProgression : CaseProgression = new CaseProgression();
    caseProgression.claimantUploadDocuments = new UploadDocuments();
    caseProgression.defendantUploadDocuments = new UploadDocuments();

    //Claimant
    const uploadApplicantDisclosureDocuments = [] as UploadDocumentTypes[];
    convertToUploadDocumentTypes(ccdClaim?.documentDisclosureList, uploadApplicantDisclosureDocuments, EvidenceUploadDisclosure.DISCLOSURE_LIST);
    convertToUploadDocumentTypes(ccdClaim?.documentForDisclosure, uploadApplicantDisclosureDocuments, EvidenceUploadDisclosure.DOCUMENTS_FOR_DISCLOSURE);
    caseProgression.claimantUploadDocuments.disclosure = uploadApplicantDisclosureDocuments;

    const uploadApplicantWitnessDocuments = [] as UploadDocumentTypes[];
    convertToUploadDocumentTypes(ccdClaim?.documentWitnessStatement, uploadApplicantWitnessDocuments, EvidenceUploadWitness.WITNESS_STATEMENT);
    convertToUploadDocumentTypes(ccdClaim?.documentWitnessSummary, uploadApplicantWitnessDocuments, EvidenceUploadWitness.WITNESS_SUMMARY);
    convertToUploadDocumentTypes(ccdClaim?.documentHearsayNotice, uploadApplicantWitnessDocuments, EvidenceUploadWitness.NOTICE_OF_INTENTION);
    convertToUploadDocumentTypes(ccdClaim?.documentReferredInStatement, uploadApplicantWitnessDocuments, EvidenceUploadWitness.DOCUMENTS_REFERRED);
    caseProgression.claimantUploadDocuments.witness = uploadApplicantWitnessDocuments;

    const uploadApplicantExpertDocuments = [] as UploadDocumentTypes[];
    convertToUploadDocumentTypes(ccdClaim?.documentExpertReport, uploadApplicantExpertDocuments, EvidenceUploadExpert.EXPERT_REPORT);
    convertToUploadDocumentTypes(ccdClaim?.documentJointStatement, uploadApplicantExpertDocuments, EvidenceUploadExpert.STATEMENT);
    convertToUploadDocumentTypes(ccdClaim?.documentQuestions, uploadApplicantExpertDocuments, EvidenceUploadExpert.QUESTIONS_FOR_EXPERTS);
    convertToUploadDocumentTypes(ccdClaim?.documentAnswers, uploadApplicantExpertDocuments, EvidenceUploadExpert.ANSWERS_FOR_EXPERTS);
    caseProgression.claimantUploadDocuments.expert = uploadApplicantExpertDocuments;

    const uploadApplicantTrialDocuments = [] as UploadDocumentTypes[];
    convertToUploadDocumentTypes(ccdClaim?.documentCaseSummary, uploadApplicantTrialDocuments, EvidenceUploadTrial.CASE_SUMMARY);
    convertToUploadDocumentTypes(ccdClaim?.documentSkeletonArgument, uploadApplicantTrialDocuments, EvidenceUploadTrial.SKELETON_ARGUMENT);
    convertToUploadDocumentTypes(ccdClaim?.documentAuthorities, uploadApplicantTrialDocuments, EvidenceUploadTrial.AUTHORITIES);
    convertToUploadDocumentTypes(ccdClaim?.documentCosts, uploadApplicantTrialDocuments, EvidenceUploadTrial.COSTS);
    convertToUploadDocumentTypes(ccdClaim?.documentEvidenceForTrial, uploadApplicantTrialDocuments, EvidenceUploadTrial.DOCUMENTARY);
    caseProgression.claimantUploadDocuments.trial = uploadApplicantTrialDocuments;

    // Defendant
    const uploadDefendantDisclosureDocuments = [] as UploadDocumentTypes[];
    convertToUploadDocumentTypes(ccdClaim?.documentDisclosureListRes, uploadDefendantDisclosureDocuments, EvidenceUploadDisclosure.DISCLOSURE_LIST);
    convertToUploadDocumentTypes(ccdClaim?.documentForDisclosureRes, uploadDefendantDisclosureDocuments, EvidenceUploadDisclosure.DOCUMENTS_FOR_DISCLOSURE);
    caseProgression.defendantUploadDocuments.disclosure = uploadDefendantDisclosureDocuments;

    const uploadDefendantWitnessDocuments = [] as UploadDocumentTypes[];
    convertToUploadDocumentTypes(ccdClaim?.documentWitnessStatementRes, uploadDefendantWitnessDocuments, EvidenceUploadWitness.WITNESS_STATEMENT);
    convertToUploadDocumentTypes(ccdClaim?.documentWitnessSummaryRes, uploadDefendantWitnessDocuments, EvidenceUploadWitness.WITNESS_SUMMARY);
    convertToUploadDocumentTypes(ccdClaim?.documentHearsayNoticeRes, uploadDefendantWitnessDocuments, EvidenceUploadWitness.NOTICE_OF_INTENTION);
    convertToUploadDocumentTypes(ccdClaim?.documentReferredInStatementRes, uploadDefendantWitnessDocuments, EvidenceUploadWitness.DOCUMENTS_REFERRED);
    caseProgression.defendantUploadDocuments.witness = uploadDefendantWitnessDocuments;

    const uploadDefendantExpertDocuments = [] as UploadDocumentTypes[];
    convertToUploadDocumentTypes(ccdClaim?.documentExpertReportRes, uploadDefendantExpertDocuments, EvidenceUploadExpert.EXPERT_REPORT);
    convertToUploadDocumentTypes(ccdClaim?.documentJointStatementRes, uploadDefendantExpertDocuments, EvidenceUploadExpert.STATEMENT);
    convertToUploadDocumentTypes(ccdClaim?.documentQuestionsRes, uploadDefendantExpertDocuments, EvidenceUploadExpert.QUESTIONS_FOR_EXPERTS);
    convertToUploadDocumentTypes(ccdClaim?.documentAnswersRes, uploadDefendantExpertDocuments, EvidenceUploadExpert.ANSWERS_FOR_EXPERTS);
    caseProgression.defendantUploadDocuments.expert = uploadDefendantExpertDocuments;

    const uploadDefendantTrialDocuments = [] as UploadDocumentTypes[];
    convertToUploadDocumentTypes(ccdClaim?.documentCaseSummaryRes, uploadDefendantTrialDocuments, EvidenceUploadTrial.CASE_SUMMARY);
    convertToUploadDocumentTypes(ccdClaim?.documentSkeletonArgumentRes, uploadDefendantTrialDocuments, EvidenceUploadTrial.SKELETON_ARGUMENT);
    convertToUploadDocumentTypes(ccdClaim?.documentAuthoritiesRes, uploadDefendantTrialDocuments, EvidenceUploadTrial.AUTHORITIES);
    convertToUploadDocumentTypes(ccdClaim?.documentCostsRes, uploadDefendantTrialDocuments, EvidenceUploadTrial.COSTS);
    convertToUploadDocumentTypes(ccdClaim?.documentEvidenceForTrialRes, uploadDefendantTrialDocuments, EvidenceUploadTrial.DOCUMENTARY);
    caseProgression.defendantUploadDocuments.trial = uploadDefendantTrialDocuments;

    caseProgression.claimantLastUpload = ccdClaim.caseDocumentUploadDate;
    caseProgression.defendantLastUpload = ccdClaim.caseDocumentUploadDate;

    return caseProgression;
  }
};

const convertToUploadDocumentTypes = (ccdList: UploadEvidenceElementCCD[], cuiList: UploadDocumentTypes[],
  documentType: EvidenceUploadDisclosure| EvidenceUploadWitness | EvidenceUploadExpert | EvidenceUploadTrial) => {

  if(ccdList != null)
  {
    for(const ccdElement of ccdList)
    {
      const cuiElement: UploadDocumentTypes = new UploadDocumentTypes();
      cuiElement.uuid = ccdElement.id;
      cuiElement.caseDocument = ccdElement.value;
      cuiElement.documentType = documentType;
      cuiList.push(cuiElement);
    }
  }

};
