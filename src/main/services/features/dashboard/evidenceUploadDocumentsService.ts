import {Claim} from 'models/claim';
import {ClaimSummaryContent, ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {t} from 'i18next';
import {UploadDocumentTypes, UploadOtherDocumentType} from 'models/caseProgression/uploadDocumentsType';
import {orderDocumentNewestToOldest} from 'services/features/caseProgression/documentTableBuilder';
import {UploadedEvidenceFormatter} from 'services/features/caseProgression/uploadedEvidenceFormatter';
import {
  EvidenceUploadDisclosure,
  EvidenceUploadExpert,
  EvidenceUploadTrial,
  EvidenceUploadWitness, OtherManageUpload,
} from 'models/document/documentType';
import {formatEvidenceDocumentWithHintText} from 'common/utils/formatDocumentURL';
import {DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

export function getEvidenceUploadContent(claim: Claim, lang: string): ClaimSummaryContent[] {
  const claimSummaryContent = [] as ClaimSummaryContent[];
  claimSummaryContent.push(getDocuments(claim, lang));

  return claimSummaryContent;
}

function getDocuments(claim: Claim, lang: string): ClaimSummaryContent {

  const sections: ClaimSummarySection[] = [
    addParagraph(lang),
    getDisclosureClaimant(claim, lang),
    getDisclosureDefendant(claim, lang),
    getWitnessSummaryClaimant(claim, lang),
    getWitnessSummaryDefendant(claim, lang),
    getExpertListClaimant(claim, lang),
    getExpertListDefendant(claim, lang),
    getTrialListClaimant(claim, lang),
    getTrialListDefendant(claim, lang),
    getAdditionalList(claim, lang),
    addSeparation(),
    addButton(claim, lang),
  ];
  return {contentSections: sections, hasDivider: false};
}

function getDisclosureClaimant(claim: Claim, lang: string): ClaimSummarySection {

  const disclosureHeading = 'PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.CLAIMANT.DISCLOSURE_DOCUMENTS';
  const disclosureListClaimant = claim.caseProgression?.claimantUploadDocuments?.disclosure;

  return {
    type: ClaimSummaryType.HTML,
    data: {html: getDocumentHTML(disclosureListClaimant, disclosureHeading, claim, true, lang)},
  };
}

function getDisclosureDefendant(claim: Claim, lang: string): ClaimSummarySection {

  const disclosureHeading = 'PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.DEFENDANT.DISCLOSURE_DOCUMENTS';
  const disclosureListDefendant = claim.caseProgression?.defendantUploadDocuments?.disclosure;

  return {
    type: ClaimSummaryType.HTML,
    data: {html: getDocumentHTML(disclosureListDefendant, disclosureHeading, claim, false, lang)},
  };
}

function getWitnessSummaryClaimant(claim: Claim, lang: string): ClaimSummarySection {

  const witnessHeading = 'PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.CLAIMANT.WITNESS_EVIDENCE';
  const witnessListClaimant = claim.caseProgression?.claimantUploadDocuments?.witness;

  return {
    type: ClaimSummaryType.HTML,
    data: {html: getDocumentHTML(witnessListClaimant, witnessHeading, claim, true, lang)},
  };
}

function getWitnessSummaryDefendant(claim: Claim, lang: string): ClaimSummarySection {

  const witnessHeading = 'PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.DEFENDANT.WITNESS_EVIDENCE';
  const witnessListDefendant = claim.caseProgression?.defendantUploadDocuments?.witness;

  return {
    type: ClaimSummaryType.HTML,
    data: {html: getDocumentHTML(witnessListDefendant, witnessHeading, claim, false, lang)},
  };
}

function getExpertListClaimant(claim: Claim, lang: string): ClaimSummarySection {

  const expertHeading = 'PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.CLAIMANT.EXPERT_EVIDENCE';
  const expertListClaimant = claim.caseProgression?.claimantUploadDocuments?.expert;

  return {
    type: ClaimSummaryType.HTML,
    data: {html: getDocumentHTML(expertListClaimant, expertHeading, claim, true, lang)},
  };
}

function getExpertListDefendant(claim: Claim, lang: string): ClaimSummarySection {

  const expertHeading = 'PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.DEFENDANT.EXPERT_EVIDENCE';
  const expertListDefendant = claim.caseProgression?.defendantUploadDocuments?.expert;

  return {
    type: ClaimSummaryType.HTML,
    data: {html: getDocumentHTML(expertListDefendant, expertHeading, claim, false, lang)},
  };
}

function getTrialListClaimant(claim: Claim, lang: string): ClaimSummarySection {

  const trialOrHearingHeading: string = claim.isFastTrackClaim
    ? 'PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.CLAIMANT.TRIAL_DOCUMENTS'
    : 'PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.CLAIMANT.HEARING_DOCUMENTS';
  const trialListClaimant = claim.caseProgression?.claimantUploadDocuments?.trial;

  return {
    type: ClaimSummaryType.HTML,
    data: {html: getDocumentHTML(trialListClaimant, trialOrHearingHeading, claim, true, lang)},
  };
}

function getTrialListDefendant(claim: Claim, lang: string): ClaimSummarySection {

  const trialOrHearingHeading: string = claim.isFastTrackClaim
    ? 'PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.DEFENDANT.TRIAL_DOCUMENTS'
    : 'PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.DEFENDANT.HEARING_DOCUMENTS';
  const trialListDefendant = claim.caseProgression?.defendantUploadDocuments?.trial;

  return {
    type: ClaimSummaryType.HTML,
    data: {html: getDocumentHTML(trialListDefendant, trialOrHearingHeading, claim, false, lang)},
  };
}

function getAdditionalList(claim: Claim, lang: string): ClaimSummarySection {

  const additionalDocumentHeading = 'PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.COMMON.CLAIM_DOCUMENTS';
  const additionalList = claim.caseProgression?.defendantUploadDocuments?.otherManaged;

  return {
    type: ClaimSummaryType.HTML,
    data: {html: getAdditionalDocumentHTML(additionalList, additionalDocumentHeading, claim, lang)},
  };
}

function addSeparation(): ClaimSummarySection {
  return {
    type: ClaimSummaryType.HTML,
    data: {html: '<br><br>'},
  };
}

function addButton(claim: Claim, lang: string): ClaimSummarySection {
  const dashboardUrl = claim.isClaimant()
    ? DASHBOARD_CLAIMANT_URL.replace(':id', claim.id)
    : DEFENDANT_SUMMARY_URL.replace(':id', claim.id);
  return ({
    type: ClaimSummaryType.BUTTON,
    data: {
      text: t('COMMON.BUTTONS.CLOSE_AND_RETURN_TO_CASE_OVERVIEW', {lng: lang}),
      href: constructResponseUrlWithIdParams(claim.id, dashboardUrl),
    },
  });

}

function addParagraph(lang: string): ClaimSummarySection {
  return ({
    type: ClaimSummaryType.PARAGRAPH,
    data: {
      text: t('PAGES.CLAIM_SUMMARY.EVIDENCE_UPLOAD_SUMMARY_HEARING', {lng: lang}),
      classes: 'govuk-!-margin-bottom-7',
    },
  });
}

function getDocumentHTML(rows: UploadDocumentTypes[], title: string, claim: Claim, isClaimant: boolean, lang: string) {

  let documentsHTML = '';

  if (rows.length > 0) {
    orderDocumentNewestToOldest(rows);
    const header = t(title, {lng: lang});
    documentsHTML = documentsHTML.concat('<h2 class="govuk-body"><span class="govuk-body govuk-!-font-weight-bold">' + header + '</span></h2>');
    documentsHTML = documentsHTML.concat('<hr class="govuk-section-break govuk-section-break--m govuk-section-break--visible">');
  }

  for (const upload of rows) {

    const documentTypeName = getDocumentTypeName(isClaimant, upload.documentType, lang);

    documentsHTML = documentsHTML.concat('<div class="govuk-grid-row">');
    documentsHTML = documentsHTML.concat(formatEvidenceDocumentWithHintText(documentTypeName, upload.caseDocument.createdDatetime, lang));
    documentsHTML = documentsHTML.concat(UploadedEvidenceFormatter.getEvidenceDocumentLinkAlignedToRight(upload, claim.id));
    documentsHTML = documentsHTML.concat('</div>');
  }
  if (rows.length > 0) {
    documentsHTML = documentsHTML.concat('<hr class="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-7">');
  }
  return documentsHTML;
}

function getAdditionalDocumentHTML(rows: UploadDocumentTypes[], title: string, claim: Claim, lang: string) {

  let documentsHTML = '';
  if (rows?.length > 0) {
    orderDocumentNewestToOldest(rows);
    const header = t(title, {lng: lang});
    documentsHTML = documentsHTML.concat('<h2 class="govuk-body"><span class="govuk-body govuk-!-font-weight-bold">' + header + '</span></h2>');
    documentsHTML = documentsHTML.concat('<hr class="govuk-section-break govuk-section-break--m govuk-section-break--visible">');
    for (const upload of rows) {

      const documentTypeName = t('PAGES.CLAIM_SUMMARY.DOCUMENTS_FOR_CLAIM', {lng: lang});
      documentsHTML = documentsHTML.concat('<div class="govuk-grid-row">');
      documentsHTML = documentsHTML.concat(formatEvidenceDocumentWithHintText(documentTypeName, upload.caseDocument.createdDatetime, lang));
      const document = upload.caseDocument as UploadOtherDocumentType;
      const documentName = document.documentLink?.document_filename;
      const documentBinary = document.documentLink?.document_binary_url;
      documentsHTML = documentsHTML.concat(UploadedEvidenceFormatter.getOtherDocumentLinkAlignedToRight(documentName, documentBinary, claim.id));
      documentsHTML = documentsHTML.concat('</div>');
    }
    documentsHTML = documentsHTML.concat('<hr class="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-7">');
  }
  return documentsHTML;
}

function getDocumentTypeName(isClaimant: boolean,
  documentType: EvidenceUploadDisclosure | EvidenceUploadWitness | EvidenceUploadExpert | EvidenceUploadTrial | OtherManageUpload,
  lang: string) {
  let key: string;
  switch (documentType) {
    case EvidenceUploadDisclosure.DOCUMENTS_FOR_DISCLOSURE:
      key = isClaimant ? 'PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.CLAIMANT.DOCUMENTS_FOR_DISCLOSURE'
        : 'PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.DEFENDANT.DOCUMENTS_FOR_DISCLOSURE';
      break;
    case EvidenceUploadDisclosure.DISCLOSURE_LIST:
      key = isClaimant ? 'PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.CLAIMANT.DISCLOSURE_LIST'
        : 'PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.DEFENDANT.DISCLOSURE_LIST';
      break;
    case EvidenceUploadWitness.WITNESS_STATEMENT:
      key = isClaimant ? 'PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.CLAIMANT.WITNESS_STATEMENT'
        : 'PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.DEFENDANT.WITNESS_STATEMENT';
      break;
    case EvidenceUploadWitness.WITNESS_SUMMARY:
      key = isClaimant ? 'PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.CLAIMANT.WITNESS_SUMMARY'
        : 'PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.DEFENDANT.WITNESS_SUMMARY';
      break;
    case EvidenceUploadWitness.NOTICE_OF_INTENTION:
      key = isClaimant ? 'PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.CLAIMANT.NOTICE_OF_INTENTION'
        : 'PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.DEFENDANT.NOTICE_OF_INTENTION';
      break;
    case EvidenceUploadWitness.DOCUMENTS_REFERRED:
      key = isClaimant ? 'PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.CLAIMANT.DOCUMENTS_REFERRED_TO_STATEMENT'
        : 'PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.DEFENDANT.DOCUMENTS_REFERRED_TO_STATEMENT';
      break;
    case EvidenceUploadExpert.STATEMENT:
      key = isClaimant ? 'PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.CLAIMANT.JOINT_STATEMENT_OF_EXPERTS'
        : 'PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.DEFENDANT.JOINT_STATEMENT_OF_EXPERTS';
      break;
    case EvidenceUploadExpert.EXPERT_REPORT:
      key = isClaimant ? 'PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.CLAIMANT.EXPERT_REPORT'
        : 'PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.DEFENDANT.EXPERT_REPORT';
      break;
    case EvidenceUploadExpert.QUESTIONS_FOR_EXPERTS:
      key = isClaimant ? 'PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.CLAIMANT.QUESTIONS_FOR_OTHER_PARTY'
        : 'PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.DEFENDANT.QUESTIONS_FOR_OTHER_PARTY';
      break;
    case EvidenceUploadExpert.ANSWERS_FOR_EXPERTS:
      key = isClaimant ? 'PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.CLAIMANT.ANSWERS_TO_QUESTIONS'
        : 'PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.DEFENDANT.ANSWERS_TO_QUESTIONS';
      break;
    case EvidenceUploadTrial.CASE_SUMMARY:
      key = isClaimant ? 'PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.CLAIMANT.CASE_SUMMARY'
        : 'PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.DEFENDANT.CASE_SUMMARY';
      break;
    case EvidenceUploadTrial.SKELETON_ARGUMENT:
      key = isClaimant ? 'PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.CLAIMANT.SKELETON_ARGUMENT'
        : 'PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.DEFENDANT.SKELETON_ARGUMENT';
      break;
    case EvidenceUploadTrial.AUTHORITIES:
      key = isClaimant ? 'PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.CLAIMANT.LEGAL_AUTHORITIES'
        : 'PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.DEFENDANT.LEGAL_AUTHORITIES';
      break;
    case EvidenceUploadTrial.COSTS:
      key = isClaimant ? 'PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.CLAIMANT.COSTS'
        : 'PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.DEFENDANT.COSTS';
      break;
    case EvidenceUploadTrial.DOCUMENTARY:
      key = isClaimant ? 'PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.CLAIMANT.DOCUMENTARY_EVIDENCE'
        : 'PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.DEFENDANT.DOCUMENTARY_EVIDENCE';
      break;
  }
  return t(key, {lng: lang});
}

