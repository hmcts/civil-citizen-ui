import {CCDClaim} from 'models/civilClaimResponse';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {
  UploadDocuments,
  UploadDocumentTypes, UploadEvidenceDocumentType,
  UploadEvidenceElementCCD, UploadEvidenceExpert, UploadEvidenceWitness,
} from 'models/caseProgression/uploadDocumentsType';
import {
  EvidenceUploadDisclosure,
  EvidenceUploadExpert,
  EvidenceUploadTrial,
  EvidenceUploadWitness,
} from 'models/document/documentType';
import {TypesOfEvidenceUploadDocuments} from 'models/caseProgression/TypesOfEvidenceUploadDocument';
import {Bundle} from 'models/caseProgression/bundles/bundle';
import {
  FinalOrderDocumentCollection,
} from 'models/caseProgression/finalOrderDocumentCollectionType';
import {toCUITrialArrangements} from 'services/translation/convertToCUI/convertToCUITrialArrangements';
import {ApplyHelpFeesReferenceForm} from 'form/models/caseProgression/hearingFee/applyHelpFeesReferenceForm';

export const toCUICaseProgression = (ccdClaim: CCDClaim): CaseProgression => {
  if (!ccdClaim) {
    return undefined;
  } else {
    const caseProgression : CaseProgression = new CaseProgression();

    const applicantUploadDocuments = applicantDocuments(ccdClaim);
    const defendantUploadDocuments = defendantDocuments(ccdClaim);

    caseProgression.claimantUploadDocuments =
      new UploadDocuments(applicantUploadDocuments.disclosure, applicantUploadDocuments.witness, applicantUploadDocuments.expert, applicantUploadDocuments.trial);
    caseProgression.defendantUploadDocuments =
      new UploadDocuments(defendantUploadDocuments.disclosure, defendantUploadDocuments.witness, defendantUploadDocuments.expert, defendantUploadDocuments.trial);
    caseProgression.claimantLastUploadDate = ccdClaim.caseDocumentUploadDate ? new Date(ccdClaim.caseDocumentUploadDate) : undefined;
    caseProgression.defendantLastUploadDate = ccdClaim.caseDocumentUploadDateRes ? new Date(ccdClaim.caseDocumentUploadDateRes): undefined;

    caseProgression.caseBundles = [] as Bundle[];
    if(ccdClaim?.caseBundles) {
      ccdClaim?.caseBundles.forEach(element => {caseProgression.caseBundles.push(new Bundle(element.value?.title, element.value?.stitchedDocument, element.value?.createdOn, element.value?.bundleHearingDate));});
    }

    const claimantTrialArrangements =  toCUITrialArrangements(ccdClaim, true);
    if (claimantTrialArrangements) {
      caseProgression.claimantTrialArrangements = claimantTrialArrangements;
    }
    const defendantTrialArrangements = toCUITrialArrangements(ccdClaim, false);
    if (defendantTrialArrangements) {
      caseProgression.defendantTrialArrangements = defendantTrialArrangements;
    }

    caseProgression.finalOrderDocumentCollection = finalOrderDocuments(ccdClaim);

    if(ccdClaim.hearingFeeHelpWithFees?.helpWithFee) {
      caseProgression.helpFeeReferenceNumberForm = new ApplyHelpFeesReferenceForm(ccdClaim.hearingFeeHelpWithFees.helpWithFee.toLowerCase(), ccdClaim.hearingFeeHelpWithFees.helpWithFeesReferenceNumber);
    }

    return caseProgression;
  }
};

//Claimant
const applicantDocuments =  (ccdClaim: CCDClaim): UploadDocuments => {
  const caseProgression = new CaseProgression;
  caseProgression.claimantUploadDocuments = new UploadDocuments();
  caseProgression.claimantUploadDocuments.disclosure = [] as UploadDocumentTypes[];
  const uploadApplicantDisclosureDocuments = [] as UploadDocumentTypes[];
  convertToUploadDocumentTypes(ccdClaim.documentDisclosureList, uploadApplicantDisclosureDocuments, EvidenceUploadDisclosure.DISCLOSURE_LIST);
  convertToUploadDocumentTypes(ccdClaim.documentForDisclosure, uploadApplicantDisclosureDocuments, EvidenceUploadDisclosure.DOCUMENTS_FOR_DISCLOSURE);

  caseProgression.claimantUploadDocuments.disclosure = uploadApplicantDisclosureDocuments;

  caseProgression.claimantUploadDocuments.witness = [] as UploadDocumentTypes[];
  const uploadApplicantWitnessDocuments = [] as UploadDocumentTypes[];
  convertToUploadDocumentTypes(ccdClaim.documentWitnessStatement, uploadApplicantWitnessDocuments, EvidenceUploadWitness.WITNESS_STATEMENT);
  convertToUploadDocumentTypes(ccdClaim.documentWitnessSummary, uploadApplicantWitnessDocuments, EvidenceUploadWitness.WITNESS_SUMMARY);
  convertToUploadDocumentTypes(ccdClaim.documentHearsayNotice, uploadApplicantWitnessDocuments, EvidenceUploadWitness.NOTICE_OF_INTENTION);
  convertToUploadDocumentTypes(ccdClaim.documentReferredInStatement, uploadApplicantWitnessDocuments, EvidenceUploadWitness.DOCUMENTS_REFERRED);

  caseProgression.claimantUploadDocuments.witness = uploadApplicantWitnessDocuments;

  caseProgression.claimantUploadDocuments.expert = [] as UploadDocumentTypes[];
  const uploadApplicantExpertDocuments = [] as UploadDocumentTypes[];
  convertToUploadDocumentTypes(ccdClaim.documentExpertReport, uploadApplicantExpertDocuments, EvidenceUploadExpert.EXPERT_REPORT);
  convertToUploadDocumentTypes(ccdClaim.documentJointStatement, uploadApplicantExpertDocuments, EvidenceUploadExpert.STATEMENT);
  convertToUploadDocumentTypes(ccdClaim.documentQuestions, uploadApplicantExpertDocuments, EvidenceUploadExpert.QUESTIONS_FOR_EXPERTS);
  convertToUploadDocumentTypes(ccdClaim.documentAnswers, uploadApplicantExpertDocuments, EvidenceUploadExpert.ANSWERS_FOR_EXPERTS);

  caseProgression.claimantUploadDocuments.expert = uploadApplicantExpertDocuments;

  caseProgression.claimantUploadDocuments.trial = [] as UploadDocumentTypes[];
  const uploadApplicantTrialDocuments = [] as UploadDocumentTypes[];
  convertToUploadDocumentTypes(ccdClaim.documentCaseSummary, uploadApplicantTrialDocuments, EvidenceUploadTrial.CASE_SUMMARY);
  convertToUploadDocumentTypes(ccdClaim.documentSkeletonArgument, uploadApplicantTrialDocuments, EvidenceUploadTrial.SKELETON_ARGUMENT);
  convertToUploadDocumentTypes(ccdClaim.documentAuthorities, uploadApplicantTrialDocuments, EvidenceUploadTrial.AUTHORITIES);
  convertToUploadDocumentTypes(ccdClaim.documentCosts, uploadApplicantTrialDocuments, EvidenceUploadTrial.COSTS);
  convertToUploadDocumentTypes(ccdClaim.documentEvidenceForTrial, uploadApplicantTrialDocuments, EvidenceUploadTrial.DOCUMENTARY);

  caseProgression.claimantUploadDocuments.trial = uploadApplicantTrialDocuments;

  return caseProgression.claimantUploadDocuments;
};

// Defendant
const defendantDocuments =  (ccdClaim: CCDClaim): UploadDocuments => {
  const caseProgression = new CaseProgression;
  caseProgression.defendantUploadDocuments = new UploadDocuments();
  caseProgression.defendantUploadDocuments.disclosure = [] as UploadDocumentTypes[];
  const uploadDefendantDisclosureDocuments = [] as UploadDocumentTypes[];
  convertToUploadDocumentTypes(ccdClaim.documentDisclosureListRes, uploadDefendantDisclosureDocuments, EvidenceUploadDisclosure.DISCLOSURE_LIST);
  convertToUploadDocumentTypes(ccdClaim.documentForDisclosureRes, uploadDefendantDisclosureDocuments, EvidenceUploadDisclosure.DOCUMENTS_FOR_DISCLOSURE);

  caseProgression.defendantUploadDocuments.disclosure = uploadDefendantDisclosureDocuments;

  caseProgression.defendantUploadDocuments.witness = [] as UploadDocumentTypes[];
  const uploadDefendantWitnessDocuments = [] as UploadDocumentTypes[];
  convertToUploadDocumentTypes(ccdClaim.documentWitnessStatementRes, uploadDefendantWitnessDocuments, EvidenceUploadWitness.WITNESS_STATEMENT);
  convertToUploadDocumentTypes(ccdClaim.documentWitnessSummaryRes, uploadDefendantWitnessDocuments, EvidenceUploadWitness.WITNESS_SUMMARY);
  convertToUploadDocumentTypes(ccdClaim.documentHearsayNoticeRes, uploadDefendantWitnessDocuments, EvidenceUploadWitness.NOTICE_OF_INTENTION);
  convertToUploadDocumentTypes(ccdClaim.documentReferredInStatementRes, uploadDefendantWitnessDocuments, EvidenceUploadWitness.DOCUMENTS_REFERRED);

  caseProgression.defendantUploadDocuments.witness = uploadDefendantWitnessDocuments;

  caseProgression.defendantUploadDocuments.expert = [] as UploadDocumentTypes[];
  const uploadDefendantExpertDocuments = [] as UploadDocumentTypes[];
  convertToUploadDocumentTypes(ccdClaim.documentExpertReportRes, uploadDefendantExpertDocuments, EvidenceUploadExpert.EXPERT_REPORT);
  convertToUploadDocumentTypes(ccdClaim.documentJointStatementRes, uploadDefendantExpertDocuments, EvidenceUploadExpert.STATEMENT);
  convertToUploadDocumentTypes(ccdClaim.documentQuestionsRes, uploadDefendantExpertDocuments, EvidenceUploadExpert.QUESTIONS_FOR_EXPERTS);
  convertToUploadDocumentTypes(ccdClaim.documentAnswersRes, uploadDefendantExpertDocuments, EvidenceUploadExpert.ANSWERS_FOR_EXPERTS);

  caseProgression.defendantUploadDocuments.expert = uploadDefendantExpertDocuments;

  caseProgression.defendantUploadDocuments.trial = [] as UploadDocumentTypes[];
  const uploadDefendantTrialDocuments = [] as UploadDocumentTypes[];
  convertToUploadDocumentTypes(ccdClaim.documentCaseSummaryRes, uploadDefendantTrialDocuments, EvidenceUploadTrial.CASE_SUMMARY);
  convertToUploadDocumentTypes(ccdClaim.documentSkeletonArgumentRes, uploadDefendantTrialDocuments, EvidenceUploadTrial.SKELETON_ARGUMENT);
  convertToUploadDocumentTypes(ccdClaim.documentAuthoritiesRes, uploadDefendantTrialDocuments, EvidenceUploadTrial.AUTHORITIES);
  convertToUploadDocumentTypes(ccdClaim.documentCostsRes, uploadDefendantTrialDocuments, EvidenceUploadTrial.COSTS);
  convertToUploadDocumentTypes(ccdClaim.documentEvidenceForTrialRes, uploadDefendantTrialDocuments, EvidenceUploadTrial.DOCUMENTARY);

  caseProgression.defendantUploadDocuments.trial = uploadDefendantTrialDocuments;

  return caseProgression.defendantUploadDocuments;
};

// Judge Final Orders
const finalOrderDocuments =  (ccdClaim: CCDClaim): FinalOrderDocumentCollection[] => {
  let finalOrderDocumentCollection = [] as FinalOrderDocumentCollection[];
  const finalOrderDocumentList = ccdClaim.finalOrderDocumentCollection;
  if (finalOrderDocumentList != null) {
    for (const ccdElement of finalOrderDocumentList) {
      finalOrderDocumentCollection.push(ccdElement);
    }
  }
  if (finalOrderDocumentCollection.length == 0) {
    finalOrderDocumentCollection = undefined;
  }
  return finalOrderDocumentCollection;
};

const convertToUploadDocumentTypes = (ccdList: UploadEvidenceElementCCD[], cuiList: UploadDocumentTypes[],
  documentType: EvidenceUploadDisclosure| EvidenceUploadWitness | EvidenceUploadExpert | EvidenceUploadTrial) => {

  if(ccdList != null)
  {
    for(const ccdElement of ccdList)
    {
      const cuiElement: UploadDocumentTypes =
        new UploadDocumentTypes(false, mapCCDElementValue(ccdElement.value), documentType, ccdElement.id);
      cuiList.push(cuiElement);
    }
  }
};

const mapCCDElementValue = (documentType: UploadEvidenceDocumentType | UploadEvidenceWitness | UploadEvidenceExpert): UploadEvidenceDocumentType | UploadEvidenceWitness | UploadEvidenceExpert => {

  if(TypesOfEvidenceUploadDocuments.DOCUMENT_TYPE in documentType)
  {
    documentType = documentType as UploadEvidenceDocumentType;
    documentType = new UploadEvidenceDocumentType(documentType.typeOfDocument, documentType.documentIssuedDate, documentType.documentUpload, documentType.createdDatetime);
  }
  else if(TypesOfEvidenceUploadDocuments.WITNESS in documentType)
  {
    documentType = documentType as UploadEvidenceWitness;
    documentType = new UploadEvidenceWitness(documentType.witnessOptionName, documentType.witnessOptionUploadDate, documentType.witnessOptionDocument, documentType.createdDatetime);
  }
  else if(TypesOfEvidenceUploadDocuments.EXPERT in documentType)
  {
    documentType = documentType as UploadEvidenceExpert;
    documentType = new UploadEvidenceExpert(documentType.expertOptionName, documentType.expertOptionExpertise, documentType.expertOptionExpertises, documentType.expertOptionOtherParty, documentType.expertDocumentQuestion, documentType.expertDocumentAnswer, documentType.expertOptionUploadDate, documentType.expertDocument, documentType.createdDatetime);
  }

  return documentType;
};
