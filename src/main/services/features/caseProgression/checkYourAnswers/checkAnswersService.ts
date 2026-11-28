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
import {UploadDocumentsUserForm} from 'models/caseProgression/uploadDocumentsUserForm';
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
import {CaseDocument} from 'models/document/caseDocument';
import {getRouteParam} from 'common/utils/routeParamUtils';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('checkAnswersService');

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

export const getSummarySections = (uploadedDocuments: UploadDocumentsUserForm, claimId: string, isSmallClaims: boolean, lang: string ): DocumentUploadSections | null => {
  if (!hasValidNewDocuments(uploadedDocuments)) {
    return null;
  }
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
    newUploadDocuments = claim.caseProgression?.claimantDocuments;
    existingUploadDocuments = oldClaim.caseProgression?.claimantUploadDocuments;
    caseProgression.claimantUploadDocuments = mapUploadedFileToDocumentType(newUploadDocuments, existingUploadDocuments, getRouteParam(req, 'id'));
    updatedCcdClaim = toCCDEvidenceUpload(caseProgression, updatedCcdClaim, true);
    return await civilServiceClient.submitEvent(CaseEvent.EVIDENCE_UPLOAD_APPLICANT, req.params.id, updatedCcdClaim, req);
  } else {
    newUploadDocuments = claim.caseProgression?.defendantDocuments;
    existingUploadDocuments = oldClaim.caseProgression?.defendantUploadDocuments;
    caseProgression.defendantUploadDocuments =  mapUploadedFileToDocumentType(newUploadDocuments, existingUploadDocuments, getRouteParam(req, 'id'));
    updatedCcdClaim = toCCDEvidenceUpload(caseProgression, updatedCcdClaim, false);
    return await civilServiceClient.submitEvent(CaseEvent.EVIDENCE_UPLOAD_RESPONDENT, req.params.id, updatedCcdClaim, req);
  }
};

const isDocumentLinkPresent = (document: {caseDocument?: CaseDocument}): boolean => !!document?.caseDocument?.documentLink?.document_binary_url;

export const hasValidNewDocuments = (uploadedDocuments: UploadDocumentsUserForm): boolean => {
  if (!uploadedDocuments) {
    return false;
  }
  return Object.values(uploadedDocuments)
    .some(documents => Array.isArray(documents) && documents.some(isDocumentLinkPresent));
};

const hasDocumentLink = (document: {caseDocument?: CaseDocument}, claimId: string): boolean => {
  if (isDocumentLinkPresent(document)) {
    return true;
  }
  logger.warn(`Skipping evidence upload document with missing document link. ClaimId: ${claimId}`);
  return false;
};

const appendUploadedDocuments = <T extends {caseDocument?: CaseDocument}>(
  documents: T[] | undefined,
  claimId: string,
  target: UploadDocumentTypes[],
  documentType: EvidenceUploadDisclosure | EvidenceUploadWitness | EvidenceUploadExpert | EvidenceUploadTrial,
  createEvidence: (document: T) => UploadEvidenceDocumentType | UploadEvidenceWitness | UploadEvidenceExpert,
): void => {
  if (!documents) {
    return;
  }
  for (const document of documents) {
    if (!hasDocumentLink(document, claimId)) {
      continue;
    }
    target.push(new UploadDocumentTypes(null, createEvidence(document), documentType, null));
  }
};

const mapUploadedFileToDocumentType = (newUploadedDocuments: UploadDocumentsUserForm, existingUploadDocuments: UploadDocuments, claimId: string): UploadDocuments => {

  existingUploadDocuments = existingUploadDocuments ?? new UploadDocuments();
  existingUploadDocuments.disclosure = existingUploadDocuments.disclosure ?? [];
  existingUploadDocuments.witness = existingUploadDocuments.witness ?? [];
  existingUploadDocuments.expert = existingUploadDocuments.expert ?? [];
  existingUploadDocuments.trial = existingUploadDocuments.trial ?? [];

  if (!newUploadedDocuments) {
    return existingUploadDocuments;
  }

  appendUploadedDocuments(newUploadedDocuments.documentsForDisclosure, claimId, existingUploadDocuments.disclosure, EvidenceUploadDisclosure.DOCUMENTS_FOR_DISCLOSURE, document =>
    new UploadEvidenceDocumentType(null, document.typeOfDocument, document.dateInputFields?.date, document.caseDocument.documentLink, document.caseDocument.createdDatetime));
  appendUploadedDocuments(newUploadedDocuments.disclosureList, claimId, existingUploadDocuments.disclosure, EvidenceUploadDisclosure.DISCLOSURE_LIST, document =>
    new UploadEvidenceDocumentType(null, null, null, document.caseDocument.documentLink, document.caseDocument.createdDatetime));
  appendUploadedDocuments(newUploadedDocuments.witnessStatement, claimId, existingUploadDocuments.witness, EvidenceUploadWitness.WITNESS_STATEMENT, document =>
    new UploadEvidenceWitness(document.witnessName, document.dateInputFields?.date, document.caseDocument.documentLink, document.caseDocument.createdDatetime));
  appendUploadedDocuments(newUploadedDocuments.witnessSummary, claimId, existingUploadDocuments.witness, EvidenceUploadWitness.WITNESS_SUMMARY, document =>
    new UploadEvidenceWitness(document.witnessName, document.dateInputFields?.date, document.caseDocument.documentLink, document.caseDocument.createdDatetime));
  appendUploadedDocuments(newUploadedDocuments.noticeOfIntention, claimId, existingUploadDocuments.witness, EvidenceUploadWitness.NOTICE_OF_INTENTION, document =>
    new UploadEvidenceWitness(document.witnessName, document.dateInputFields?.date, document.caseDocument.documentLink, document.caseDocument.createdDatetime));
  appendUploadedDocuments(newUploadedDocuments.documentsReferred, claimId, existingUploadDocuments.witness, EvidenceUploadWitness.DOCUMENTS_REFERRED, document =>
    new UploadEvidenceDocumentType(document.witnessName, document.typeOfDocument, document.dateInputFields?.date, document.caseDocument.documentLink, document.caseDocument.createdDatetime));
  appendUploadedDocuments(newUploadedDocuments.expertStatement, claimId, existingUploadDocuments.expert, EvidenceUploadExpert.STATEMENT, document =>
    new UploadEvidenceExpert(document.expertName, null, document.fieldOfExpertise, null, null, null, document.dateInputFields?.date, document.caseDocument.documentLink, document.caseDocument.createdDatetime));
  appendUploadedDocuments(newUploadedDocuments.expertReport, claimId, existingUploadDocuments.expert, EvidenceUploadExpert.EXPERT_REPORT, document =>
    new UploadEvidenceExpert(document.expertName, document.fieldOfExpertise, null, null, null, null, document.dateInputFields?.date, document.caseDocument.documentLink, document.caseDocument.createdDatetime));
  appendUploadedDocuments(newUploadedDocuments.questionsForExperts, claimId, existingUploadDocuments.expert, EvidenceUploadExpert.QUESTIONS_FOR_EXPERTS, document =>
    new UploadEvidenceExpert(document.expertName, document.fieldOfExpertise, null, document.otherPartyName, document.questionDocumentName, null, new Date(), document.caseDocument.documentLink, document.caseDocument.createdDatetime));
  appendUploadedDocuments(newUploadedDocuments.answersForExperts, claimId, existingUploadDocuments.expert, EvidenceUploadExpert.ANSWERS_FOR_EXPERTS, document =>
    new UploadEvidenceExpert(document.expertName, document.fieldOfExpertise, null, document.otherPartyName, null, document.otherPartyQuestionsDocumentName, new Date(), document.caseDocument.documentLink, document.caseDocument.createdDatetime));
  appendUploadedDocuments(newUploadedDocuments.trialCaseSummary, claimId, existingUploadDocuments.trial, EvidenceUploadTrial.CASE_SUMMARY, document =>
    new UploadEvidenceDocumentType(null, null, null, document.caseDocument.documentLink, document.caseDocument.createdDatetime));
  appendUploadedDocuments(newUploadedDocuments.trialSkeletonArgument, claimId, existingUploadDocuments.trial, EvidenceUploadTrial.SKELETON_ARGUMENT, document =>
    new UploadEvidenceDocumentType(null, null, null, document.caseDocument.documentLink, document.caseDocument.createdDatetime));
  appendUploadedDocuments(newUploadedDocuments.trialAuthorities, claimId, existingUploadDocuments.trial, EvidenceUploadTrial.AUTHORITIES, document =>
    new UploadEvidenceDocumentType(null, null, null, document.caseDocument.documentLink, document.caseDocument.createdDatetime));
  appendUploadedDocuments(newUploadedDocuments.trialCosts, claimId, existingUploadDocuments.trial, EvidenceUploadTrial.COSTS, document =>
    new UploadEvidenceDocumentType(null, null, null, document.caseDocument.documentLink, document.caseDocument.createdDatetime));
  appendUploadedDocuments(newUploadedDocuments.trialDocumentary, claimId, existingUploadDocuments.trial, EvidenceUploadTrial.DOCUMENTARY, document =>
    new UploadEvidenceDocumentType(null, document.typeOfDocument, document.dateInputFields?.date, document.caseDocument.documentLink, document.caseDocument.createdDatetime));

  return existingUploadDocuments;
};
