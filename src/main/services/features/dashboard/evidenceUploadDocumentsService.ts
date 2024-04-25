import {Claim} from 'models/claim';
import {ClaimSummaryContent, ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {t} from 'i18next';
import {UploadDocumentTypes} from 'models/caseProgression/uploadDocumentsType';
import {orderDocumentNewestToOldest} from 'services/features/caseProgression/documentTableBuilder';
import {UploadedEvidenceFormatter} from 'services/features/caseProgression/uploadedEvidenceFormatter';
import {formatEvidenceDocumentWithHintText} from 'common/utils/formatDocumentURL';
import {DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

export function getEvidenceUploadContent(claim: Claim, lang: string): ClaimSummaryContent[] {
  const claimSummaryContent = [] as ClaimSummaryContent[];
  claimSummaryContent.push(getDocuments(claim, lang));

  return claimSummaryContent;
}

function getDocuments(claim: Claim, lang: string): ClaimSummaryContent {

  const documentSection = [] as ClaimSummarySection[];
  documentSection.push(addParagraph(lang));

  documentSection.push(getDisclosureClaimant(claim, lang));
  documentSection.push(getDisclosureDefendant(claim, lang));

  documentSection.push(getWitnessSummaryClaimant(claim, lang));
  documentSection.push(getWitnessSummaryDefendant(claim, lang));

  documentSection.push(getExpertListClaimant(claim, lang));
  documentSection.push(getExpertListDefendant(claim, lang));

  documentSection.push(getTrialListClaimant(claim, lang));
  documentSection.push(getTrialListDefendant(claim, lang));

  documentSection.push(addSeparation());
  documentSection.push(addButton(claim, lang));

  return {contentSections: documentSection, hasDivider: false};
}

function getDisclosureClaimant(claim: Claim, lang: string): ClaimSummarySection {

  const disclosureHeading = 'PAGES.CLAIM_SUMMARY.DISCLOSURE_DOCUMENTS';
  const disclosureListClaimant = claim.caseProgression?.claimantUploadDocuments?.disclosure;

  return {
    type : ClaimSummaryType.HTML,
    data: { html: getDocumentHTML(disclosureListClaimant, disclosureHeading, claim, true, lang)},
  };
}

function getDisclosureDefendant(claim: Claim, lang: string): ClaimSummarySection {

  const disclosureHeading = 'PAGES.CLAIM_SUMMARY.DISCLOSURE_DOCUMENTS';
  const disclosureListDefendant = claim.caseProgression?.defendantUploadDocuments?.disclosure;

  return {
    type: ClaimSummaryType.HTML,
    data: {html: getDocumentHTML(disclosureListDefendant, disclosureHeading, claim, false, lang)},
  };
}

function getWitnessSummaryClaimant(claim: Claim, lang: string): ClaimSummarySection {

  const witnessHeading = 'PAGES.CLAIM_SUMMARY.WITNESS_EVIDENCE';
  const witnessListClaimant = claim.caseProgression?.claimantUploadDocuments?.witness;

  return {
    type : ClaimSummaryType.HTML,
    data: { html: getDocumentHTML(witnessListClaimant, witnessHeading, claim, true, lang)},
  };
}

function getWitnessSummaryDefendant(claim: Claim, lang: string): ClaimSummarySection {

  const witnessHeading = 'PAGES.CLAIM_SUMMARY.WITNESS_EVIDENCE';
  const witnessListDefendant = claim.caseProgression?.defendantUploadDocuments?.witness;

  return {
    type : ClaimSummaryType.HTML,
    data: { html: getDocumentHTML(witnessListDefendant, witnessHeading, claim, false, lang)},
  };
}

function getExpertListClaimant(claim: Claim, lang: string): ClaimSummarySection {

  const expertHeading = 'PAGES.CLAIM_SUMMARY.EXPERT_EVIDENCE';
  const expertListClaimant = claim.caseProgression?.claimantUploadDocuments?.expert;

  return {
    type : ClaimSummaryType.HTML,
    data: { html: getDocumentHTML(expertListClaimant, expertHeading, claim, true, lang)},
  };
}

function getExpertListDefendant(claim: Claim, lang: string): ClaimSummarySection {

  const expertHeading = 'PAGES.CLAIM_SUMMARY.EXPERT_EVIDENCE';
  const expertListDefendant = claim.caseProgression?.defendantUploadDocuments?.expert;

  return {
    type : ClaimSummaryType.HTML,
    data: { html: getDocumentHTML(expertListDefendant, expertHeading, claim, false, lang)},
  };
}

function getTrialListClaimant(claim: Claim, lang: string): ClaimSummarySection {

  const trialOrHearingHeading: string = claim.isFastTrackClaim ? 'PAGES.CLAIM_SUMMARY.TRIAL_DOCUMENTS': 'PAGES.CLAIM_SUMMARY.HEARING_DOCUMENTS';
  const trialListClaimant = claim.caseProgression?.claimantUploadDocuments?.trial;

  return {
    type : ClaimSummaryType.HTML,
    data: { html: getDocumentHTML(trialListClaimant, trialOrHearingHeading, claim, true, lang)},
  };
}

function getTrialListDefendant(claim: Claim, lang: string): ClaimSummarySection {

  const trialOrHearingHeading: string = claim.isFastTrackClaim ? 'PAGES.CLAIM_SUMMARY.TRIAL_DOCUMENTS': 'PAGES.CLAIM_SUMMARY.HEARING_DOCUMENTS';
  const trialListDefendant = claim.caseProgression?.defendantUploadDocuments?.trial;

  return {
    type : ClaimSummaryType.HTML,
    data: { html: getDocumentHTML(trialListDefendant, trialOrHearingHeading, claim, false, lang)},
  };
}

function addSeparation(): ClaimSummarySection {
  return {
    type: ClaimSummaryType.HTML,
    data: { html: '<br><br>'},
  };
}

function addButton(claim: Claim, lang: string): ClaimSummarySection {
  const dashboardUrl = claim.isClaimant()
    ? DASHBOARD_CLAIMANT_URL.replace(':id', claim.id)
    : DEFENDANT_SUMMARY_URL.replace(':id', claim.id);
  return ({
    type: ClaimSummaryType.BUTTON,
    data: {
      text: t('COMMON.BUTTONS.CLOSE_AND_RETURN_TO_CASE_OVERVIEW', {lng:lang}),
      href: constructResponseUrlWithIdParams(claim.id, dashboardUrl),
    },
  });

}

function addParagraph (lang: string): ClaimSummarySection {
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
    const header = isClaimant
      ? t('PAGES.CLAIM_SUMMARY.CLAIMANT', {lng: lang}) + t(title, {lng: lang})
      : t('PAGES.CLAIM_SUMMARY.DEFENDANT', {lng: lang}) + t(title, {lng: lang});
    documentsHTML = documentsHTML.concat('<p class="govuk-body"><span class="govuk-body govuk-!-font-weight-bold">' + header + '</span></p>');
    documentsHTML = documentsHTML.concat('<hr class="govuk-section-break govuk-section-break--m govuk-section-break--visible">');
  }

  for(const upload of rows) {

    const uploaderName = isClaimant  ? t('PAGES.CLAIM_SUMMARY.CLAIMANT', {lng: lang}) : t('PAGES.CLAIM_SUMMARY.DEFENDANT', {lng: lang});
    const documentTypeName = UploadedEvidenceFormatter.getDocumentTypeName(upload.documentType, lang);

    const documentName = uploaderName + documentTypeName.toLowerCase();

    documentsHTML = documentsHTML.concat('<div class="govuk-grid-row">');
    documentsHTML = documentsHTML.concat(formatEvidenceDocumentWithHintText(documentName, upload.caseDocument.createdDatetime, lang));
    documentsHTML = documentsHTML.concat(UploadedEvidenceFormatter.getEvidenceDocumentLinkAlignedToRight(upload, claim.id));
    documentsHTML = documentsHTML.concat('</div>');
  }
  if (rows.length > 0) {
    documentsHTML = documentsHTML.concat('<hr class="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-7">');
  }
  return documentsHTML;
}

