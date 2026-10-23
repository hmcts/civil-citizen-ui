import {Claim} from 'models/claim';
import {
  getDisclosureSummarySection,
  getExpertSummarySection,
  getTrialSummarySection,
  getWitnessSummarySection,
} from 'services/features/caseProgression/checkYourAnswers/buildEvidenceUploadedSummaryRows';
import {DocumentUploadSections} from 'models/caseProgression/documentUploadSections';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {
  FinaliseYourTrialSectionBuilder,
} from 'models/caseProgression/trialArrangements/finaliseYourTrialSectionBuilder';
import {
  TypeOfDocumentSection,
  UploadDocumentsUserForm,
  WitnessSection,
} from 'models/caseProgression/uploadDocumentsUserForm';
import {
  UploadDocuments,
  UploadDocumentTypes,
  UploadEvidenceDocumentType,
  UploadEvidenceExpert,
  UploadEvidenceWitness,
} from 'models/caseProgression/uploadDocumentsType';
import {
  EvidenceUploadDisclosure,
  EvidenceUploadExpert,
  EvidenceUploadTrial,
  EvidenceUploadWitness,
} from 'models/document/documentType';
import {CCDClaim} from 'models/civilClaimResponse';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {toCCDEvidenceUpload} from 'services/translation/caseProgression/convertToCCDEvidenceUpload';
import {AppRequest} from 'models/AppRequest';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {CaseEvent} from 'models/events/caseEvent';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {currencyFormatWithNoTrailingZeros} from 'common/utils/currencyFormat';
import {migrateLegacyCaseDocumentsOnForm, normaliseCaseDocuments} from 'common/utils/fileUploadUtils';
import {CaseDocument} from 'models/document/caseDocument';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

export const getSummarySections = (uploadedDocuments: UploadDocumentsUserForm, claimId: string, isSmallClaims: boolean, lang: string ): DocumentUploadSections => {

  return {
    witnessEvidenceSection: getWitnessSummarySection(uploadedDocuments, claimId, lang),
    disclosureEvidenceSection: getDisclosureSummarySection(uploadedDocuments, claimId, lang),
    expertEvidenceSection: getExpertSummarySection(uploadedDocuments, claimId, lang),
    trialEvidenceSection: getTrialSummarySection(uploadedDocuments, isSmallClaims, claimId, lang),
  };
};

export const getTopElements = (claim:Claim): ClaimSummarySection[] => {

  return new PageSectionBuilder()
    .addMicroText('PAGES.DASHBOARD.HEARINGS.HEARING')
    .addMainTitle('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.CHECK_YOUR_ANSWERS_TITLE')
    .addLeadParagraph('COMMON.CASE_NUMBER_PARAM', {claimId:caseNumberPrettify(claim.id)}, 'govuk-!-margin-bottom-1')
    .addLeadParagraph('COMMON.CLAIM_AMOUNT_WITH_VALUE', {claimAmount: currencyFormatWithNoTrailingZeros(claim.totalClaimAmount)})
    .addInsetText('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.CHECK_YOUR_ANSWERS_WARNING_FULL')
    .build();
};

export const getBottomElements = (): ClaimSummarySection[] => {

  return new FinaliseYourTrialSectionBuilder()
    .addMainTitle('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.CHECK_YOUR_ANSWERS_CONFIRMATION')
    .addWarning('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.CHECK_YOUR_ANSWERS_WARNING_SHORT')
    .build();
};

export const saveUploadedDocuments = async (claim: Claim, req: AppRequest): Promise<Claim> => {
  let newUploadDocuments: UploadDocumentsUserForm;
  let existingUploadDocuments: UploadDocuments;
  const caseProgression = new CaseProgression();
  let updatedCcdClaim = {} as CCDClaim;
  const oldClaim = await civilServiceClient.retrieveClaimDetails(req.params.id, req);

  if(claim.isClaimant())
  {
    newUploadDocuments = claim.caseProgression.claimantDocuments;
    migrateLegacyCaseDocumentsOnForm(newUploadDocuments);
    existingUploadDocuments = oldClaim.caseProgression.claimantUploadDocuments;
    caseProgression.claimantUploadDocuments = mapUploadedFileToDocumentType(newUploadDocuments, existingUploadDocuments);
    updatedCcdClaim = toCCDEvidenceUpload(caseProgression, updatedCcdClaim, true);
    return await civilServiceClient.submitEvent(CaseEvent.EVIDENCE_UPLOAD_APPLICANT, req.params.id, updatedCcdClaim, req);
  } else {
    newUploadDocuments = claim.caseProgression.defendantDocuments;
    migrateLegacyCaseDocumentsOnForm(newUploadDocuments);
    existingUploadDocuments = oldClaim.caseProgression.defendantUploadDocuments;
    caseProgression.defendantUploadDocuments =  mapUploadedFileToDocumentType(newUploadDocuments, existingUploadDocuments);
    updatedCcdClaim = toCCDEvidenceUpload(caseProgression, updatedCcdClaim, false);
    return await civilServiceClient.submitEvent(CaseEvent.EVIDENCE_UPLOAD_RESPONDENT, req.params.id, updatedCcdClaim, req);
  }
};

type EvidenceDocument = UploadEvidenceWitness | UploadEvidenceExpert | UploadEvidenceDocumentType;
type EvidenceDocumentType = EvidenceUploadWitness | EvidenceUploadDisclosure | EvidenceUploadExpert | EvidenceUploadTrial;

const onePerUploadedFile = <S extends {caseDocuments?: CaseDocument[]}>(
  sections: S[] | undefined,
  documentType: EvidenceDocumentType,
  toEvidenceDocument: (section: S, caseDocument: CaseDocument) => EvidenceDocument,
): UploadDocumentTypes[] => {
  const toUploadDocument = (section: S, caseDocument: CaseDocument) =>
    new UploadDocumentTypes(null, toEvidenceDocument(section, caseDocument), documentType, null);
  return (sections ?? []).flatMap((section) =>
    normaliseCaseDocuments(section.caseDocuments).map((caseDocument) => toUploadDocument(section, caseDocument)));
};

const fileOnlyDocument = (_section: unknown, caseDocument: CaseDocument) =>
  new UploadEvidenceDocumentType(null, null, null, caseDocument.documentLink, caseDocument.createdDatetime);

const typedDocument = (section: TypeOfDocumentSection, caseDocument: CaseDocument) =>
  new UploadEvidenceDocumentType(null, section.typeOfDocument, section.dateInputFields.date, caseDocument.documentLink, caseDocument.createdDatetime);

const witnessDocument = (section: WitnessSection, caseDocument: CaseDocument) =>
  new UploadEvidenceWitness(section.witnessName, section.dateInputFields.date, caseDocument.documentLink, caseDocument.createdDatetime);

const appendUploadedFiles = (existingDocuments: UploadDocumentTypes[], ...newDocumentGroups: UploadDocumentTypes[][]): void => {
  const newDocuments = newDocumentGroups.flat();
  if (newDocuments.length) {
    existingDocuments.push(...newDocuments);
  }
};

const mapUploadedFileToDocumentType = (newUploadedDocuments: UploadDocumentsUserForm, existingUploadDocuments: UploadDocuments): UploadDocuments => {
  appendUploadedFiles(existingUploadDocuments.disclosure,
    onePerUploadedFile(newUploadedDocuments.documentsForDisclosure, EvidenceUploadDisclosure.DOCUMENTS_FOR_DISCLOSURE, typedDocument),
    onePerUploadedFile(newUploadedDocuments.disclosureList, EvidenceUploadDisclosure.DISCLOSURE_LIST, fileOnlyDocument),
  );

  appendUploadedFiles(existingUploadDocuments.witness,
    onePerUploadedFile(newUploadedDocuments.witnessStatement, EvidenceUploadWitness.WITNESS_STATEMENT, witnessDocument),
    onePerUploadedFile(newUploadedDocuments.witnessSummary, EvidenceUploadWitness.WITNESS_SUMMARY, witnessDocument),
    onePerUploadedFile(newUploadedDocuments.noticeOfIntention, EvidenceUploadWitness.NOTICE_OF_INTENTION, witnessDocument),
    onePerUploadedFile(newUploadedDocuments.documentsReferred, EvidenceUploadWitness.DOCUMENTS_REFERRED, (section, caseDocument) =>
      new UploadEvidenceDocumentType(section.witnessName, section.typeOfDocument, section.dateInputFields.date, caseDocument.documentLink, caseDocument.createdDatetime)),
  );

  appendUploadedFiles(existingUploadDocuments.expert,
    onePerUploadedFile(newUploadedDocuments.expertStatement, EvidenceUploadExpert.STATEMENT, (section, caseDocument) =>
      new UploadEvidenceExpert(section.expertName, null, section.fieldOfExpertise, null, null, null, section.dateInputFields.date, caseDocument.documentLink, caseDocument.createdDatetime)),
    onePerUploadedFile(newUploadedDocuments.expertReport, EvidenceUploadExpert.EXPERT_REPORT, (section, caseDocument) =>
      new UploadEvidenceExpert(section.expertName, section.fieldOfExpertise, null, null, null, null, section.dateInputFields.date, caseDocument.documentLink, caseDocument.createdDatetime)),
    onePerUploadedFile(newUploadedDocuments.questionsForExperts, EvidenceUploadExpert.QUESTIONS_FOR_EXPERTS, (section, caseDocument) =>
      new UploadEvidenceExpert(section.expertName, section.fieldOfExpertise, null, section.otherPartyName, section.questionDocumentName, null, new Date(), caseDocument.documentLink, caseDocument.createdDatetime)),
    onePerUploadedFile(newUploadedDocuments.answersForExperts, EvidenceUploadExpert.ANSWERS_FOR_EXPERTS, (section, caseDocument) =>
      new UploadEvidenceExpert(section.expertName, section.fieldOfExpertise, null, section.otherPartyName, null, section.otherPartyQuestionsDocumentName, new Date(), caseDocument.documentLink, caseDocument.createdDatetime)),
  );

  appendUploadedFiles(existingUploadDocuments.trial,
    onePerUploadedFile(newUploadedDocuments.trialCaseSummary, EvidenceUploadTrial.CASE_SUMMARY, fileOnlyDocument),
    onePerUploadedFile(newUploadedDocuments.trialSkeletonArgument, EvidenceUploadTrial.SKELETON_ARGUMENT, fileOnlyDocument),
    onePerUploadedFile(newUploadedDocuments.trialAuthorities, EvidenceUploadTrial.AUTHORITIES, fileOnlyDocument),
    onePerUploadedFile(newUploadedDocuments.trialCosts, EvidenceUploadTrial.COSTS, fileOnlyDocument),
    onePerUploadedFile(newUploadedDocuments.trialDocumentary, EvidenceUploadTrial.DOCUMENTARY, typedDocument),
  );

  return existingUploadDocuments;
};
