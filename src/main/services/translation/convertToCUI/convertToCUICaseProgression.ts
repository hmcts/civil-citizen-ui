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
import {
  FinalOrderDocumentCollection,
} from 'models/caseProgression/finalOrderDocumentCollectionType';

export const toCUICaseProgression = (ccdClaim: CCDClaim): CaseProgression => {
  if (ccdClaim) {
    const caseProgression : CaseProgression = new CaseProgression();

    //Claimant
    let uploadApplicantDisclosureDocuments = [] as UploadDocumentTypes[];
    convertToUploadDocumentTypes(ccdClaim?.documentDisclosureList, uploadApplicantDisclosureDocuments, EvidenceUploadDisclosure.DISCLOSURE_LIST);
    convertToUploadDocumentTypes(ccdClaim?.documentForDisclosure, uploadApplicantDisclosureDocuments, EvidenceUploadDisclosure.DOCUMENTS_FOR_DISCLOSURE);
    if(uploadApplicantDisclosureDocuments.length == 0)
    {
      uploadApplicantDisclosureDocuments = undefined;
    }

    let uploadApplicantWitnessDocuments = [] as UploadDocumentTypes[];
    convertToUploadDocumentTypes(ccdClaim?.documentWitnessStatement, uploadApplicantWitnessDocuments, EvidenceUploadWitness.WITNESS_STATEMENT);
    convertToUploadDocumentTypes(ccdClaim?.documentWitnessSummary, uploadApplicantWitnessDocuments, EvidenceUploadWitness.WITNESS_SUMMARY);
    convertToUploadDocumentTypes(ccdClaim?.documentHearsayNotice, uploadApplicantWitnessDocuments, EvidenceUploadWitness.NOTICE_OF_INTENTION);
    convertToUploadDocumentTypes(ccdClaim?.documentReferredInStatement, uploadApplicantWitnessDocuments, EvidenceUploadWitness.DOCUMENTS_REFERRED);
    if(uploadApplicantWitnessDocuments.length == 0)
    {
      uploadApplicantWitnessDocuments = undefined;
    }

    let uploadApplicantExpertDocuments = [] as UploadDocumentTypes[];
    convertToUploadDocumentTypes(ccdClaim?.documentExpertReport, uploadApplicantExpertDocuments, EvidenceUploadExpert.EXPERT_REPORT);
    convertToUploadDocumentTypes(ccdClaim?.documentJointStatement, uploadApplicantExpertDocuments, EvidenceUploadExpert.STATEMENT);
    convertToUploadDocumentTypes(ccdClaim?.documentQuestions, uploadApplicantExpertDocuments, EvidenceUploadExpert.QUESTIONS_FOR_EXPERTS);
    convertToUploadDocumentTypes(ccdClaim?.documentAnswers, uploadApplicantExpertDocuments, EvidenceUploadExpert.ANSWERS_FOR_EXPERTS);
    if(uploadApplicantExpertDocuments.length == 0)
    {
      uploadApplicantExpertDocuments = undefined;
    }

    let uploadApplicantTrialDocuments = [] as UploadDocumentTypes[];
    convertToUploadDocumentTypes(ccdClaim?.documentCaseSummary, uploadApplicantTrialDocuments, EvidenceUploadTrial.CASE_SUMMARY);
    convertToUploadDocumentTypes(ccdClaim?.documentSkeletonArgument, uploadApplicantTrialDocuments, EvidenceUploadTrial.SKELETON_ARGUMENT);
    convertToUploadDocumentTypes(ccdClaim?.documentAuthorities, uploadApplicantTrialDocuments, EvidenceUploadTrial.AUTHORITIES);
    convertToUploadDocumentTypes(ccdClaim?.documentCosts, uploadApplicantTrialDocuments, EvidenceUploadTrial.COSTS);
    convertToUploadDocumentTypes(ccdClaim?.documentEvidenceForTrial, uploadApplicantTrialDocuments, EvidenceUploadTrial.DOCUMENTARY);
    if(uploadApplicantTrialDocuments.length == 0)
    {
      uploadApplicantTrialDocuments = undefined;
    }

    // Defendant
    let uploadDefendantDisclosureDocuments = [] as UploadDocumentTypes[];
    convertToUploadDocumentTypes(ccdClaim?.documentDisclosureListRes, uploadDefendantDisclosureDocuments, EvidenceUploadDisclosure.DISCLOSURE_LIST);
    convertToUploadDocumentTypes(ccdClaim?.documentForDisclosureRes, uploadDefendantDisclosureDocuments, EvidenceUploadDisclosure.DOCUMENTS_FOR_DISCLOSURE);
    if(uploadDefendantDisclosureDocuments.length == 0)
    {
      uploadDefendantDisclosureDocuments = undefined;
    }

    let uploadDefendantWitnessDocuments = [] as UploadDocumentTypes[];
    convertToUploadDocumentTypes(ccdClaim?.documentWitnessStatementRes, uploadDefendantWitnessDocuments, EvidenceUploadWitness.WITNESS_STATEMENT);
    convertToUploadDocumentTypes(ccdClaim?.documentWitnessSummaryRes, uploadDefendantWitnessDocuments, EvidenceUploadWitness.WITNESS_SUMMARY);
    convertToUploadDocumentTypes(ccdClaim?.documentHearsayNoticeRes, uploadDefendantWitnessDocuments, EvidenceUploadWitness.NOTICE_OF_INTENTION);
    convertToUploadDocumentTypes(ccdClaim?.documentReferredInStatementRes, uploadDefendantWitnessDocuments, EvidenceUploadWitness.DOCUMENTS_REFERRED);
    if(uploadDefendantWitnessDocuments.length == 0)
    {
      uploadDefendantWitnessDocuments = undefined;
    }

    let uploadDefendantExpertDocuments = [] as UploadDocumentTypes[];
    convertToUploadDocumentTypes(ccdClaim?.documentExpertReportRes, uploadDefendantExpertDocuments, EvidenceUploadExpert.EXPERT_REPORT);
    convertToUploadDocumentTypes(ccdClaim?.documentJointStatementRes, uploadDefendantExpertDocuments, EvidenceUploadExpert.STATEMENT);
    convertToUploadDocumentTypes(ccdClaim?.documentQuestionsRes, uploadDefendantExpertDocuments, EvidenceUploadExpert.QUESTIONS_FOR_EXPERTS);
    convertToUploadDocumentTypes(ccdClaim?.documentAnswersRes, uploadDefendantExpertDocuments, EvidenceUploadExpert.ANSWERS_FOR_EXPERTS);
    if(uploadDefendantExpertDocuments.length == 0)
    {
      uploadDefendantExpertDocuments = undefined;
    }

    let uploadDefendantTrialDocuments = [] as UploadDocumentTypes[];
    convertToUploadDocumentTypes(ccdClaim?.documentCaseSummaryRes, uploadDefendantTrialDocuments, EvidenceUploadTrial.CASE_SUMMARY);
    convertToUploadDocumentTypes(ccdClaim?.documentSkeletonArgumentRes, uploadDefendantTrialDocuments, EvidenceUploadTrial.SKELETON_ARGUMENT);
    convertToUploadDocumentTypes(ccdClaim?.documentAuthoritiesRes, uploadDefendantTrialDocuments, EvidenceUploadTrial.AUTHORITIES);
    convertToUploadDocumentTypes(ccdClaim?.documentCostsRes, uploadDefendantTrialDocuments, EvidenceUploadTrial.COSTS);
    convertToUploadDocumentTypes(ccdClaim?.documentEvidenceForTrialRes, uploadDefendantTrialDocuments, EvidenceUploadTrial.DOCUMENTARY);
    if(uploadDefendantTrialDocuments.length == 0)
    {
      uploadDefendantTrialDocuments = undefined;
    }

    // Judge Final Orders
    let finalOrderDocumentCollection = [] as FinalOrderDocumentCollection[];
    const finalOrderDocumentList = ccdClaim.finalOrderDocumentCollection;
    if(finalOrderDocumentList != null) {
      for (const ccdElement of finalOrderDocumentList) {
        finalOrderDocumentCollection.push(ccdElement);
      }
    }
    if (finalOrderDocumentCollection.length == 0) {
      finalOrderDocumentCollection = undefined;
    }

    caseProgression.claimantUploadDocuments =
      new UploadDocuments(uploadApplicantDisclosureDocuments, uploadApplicantWitnessDocuments, uploadApplicantExpertDocuments, uploadApplicantTrialDocuments);
    caseProgression.defendantUploadDocuments =
      new UploadDocuments(uploadDefendantDisclosureDocuments, uploadDefendantWitnessDocuments, uploadDefendantExpertDocuments, uploadDefendantTrialDocuments);
    caseProgression.claimantLastUploadDate = ccdClaim?.caseDocumentUploadDate ? new Date(ccdClaim?.caseDocumentUploadDate) : undefined;
    caseProgression.defendantLastUploadDate = ccdClaim?.caseDocumentUploadDateRes ? new Date(ccdClaim?.caseDocumentUploadDateRes): undefined;

    caseProgression.finalOrderDocumentCollection = finalOrderDocumentCollection;

    return caseProgression as CaseProgression;
  }
  return undefined;
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
