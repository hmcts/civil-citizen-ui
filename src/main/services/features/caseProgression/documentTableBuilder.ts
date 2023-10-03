import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {Claim} from 'models/claim';
import {UploadDocumentTypes} from 'models/caseProgression/uploadDocumentsType';
import {TableCell} from 'models/summaryList/summaryList';
import {EvidenceUploadExpert} from 'models/document/documentType';
import {t} from 'i18next';
import {TabSectionBuilder} from 'models/caseProgression/TabSectionBuilder';
import {UploadedEvidenceFormatter} from 'services/features/caseProgression/uploadedEvidenceFormatter';

export function getEvidenceUploadDocuments(claim: Claim, lang: string): ClaimSummarySection[] {

  const disclosureHeading = 'PAGES.CLAIM_SUMMARY.DISCLOSURE_DOCUMENTS';
  const witnessHeading = 'PAGES.CLAIM_SUMMARY.WITNESS_EVIDENCE';
  const expertHeading = 'PAGES.CLAIM_SUMMARY.EXPERT_EVIDENCE';
  const trialOrHearingHeading: string = claim.isFastTrackClaim ? 'PAGES.CLAIM_SUMMARY.TRIAL_DOCUMENTS': 'PAGES.CLAIM_SUMMARY.HEARING_DOCUMENTS';

  const disclosureListClaimant = claim.caseProgression?.claimantUploadDocuments?.disclosure;
  const witnessListClaimant = claim.caseProgression?.claimantUploadDocuments?.witness;
  const expertListClaimant = claim.caseProgression?.claimantUploadDocuments?.expert;
  const trialListClaimant = claim.caseProgression?.claimantUploadDocuments?.trial;

  const disclosureListDefendant = claim.caseProgression?.defendantUploadDocuments?.disclosure;
  const witnessListDefendant = claim.caseProgression?.defendantUploadDocuments?.witness;
  const expertListDefendant = claim.caseProgression?.defendantUploadDocuments?.expert;
  const trialListDefendant = claim.caseProgression?.defendantUploadDocuments?.trial;

  const wrap = 'tableWrap';

  return new TabSectionBuilder()
    .addParagraph('PAGES.CLAIM_SUMMARY.EVIDENCE_UPLOAD_SUMMARY')
    .addTable(getTableHeaders(disclosureHeading, disclosureListClaimant, true, lang), getTableRows(disclosureListClaimant, claim, true, lang), wrap)
    .addTable(getTableHeaders(disclosureHeading, disclosureListDefendant, false, lang), getTableRows(disclosureListDefendant, claim, false, lang), wrap)
    .addTable(getTableHeaders(witnessHeading, witnessListClaimant, true, lang), getTableRows(witnessListClaimant, claim, true, lang), wrap)
    .addTable(getTableHeaders(witnessHeading, witnessListDefendant, false, lang), getTableRows(witnessListDefendant, claim, false, lang), wrap)
    .addTable(getTableHeaders(expertHeading, expertListClaimant, true, lang), getTableRows(expertListClaimant, claim, true, lang), wrap)
    .addTable(getTableHeaders(expertHeading, expertListDefendant, false, lang), getTableRows(expertListDefendant, claim, false, lang), wrap)
    .addTable(getTableHeaders(trialOrHearingHeading, trialListClaimant, true, lang), getTableRows(trialListClaimant, claim, true, lang), wrap)
    .addTable(getTableHeaders(trialOrHearingHeading, trialListDefendant, false, lang), getTableRows(trialListDefendant, claim, false, lang), wrap)
    .build();
}

function getTableHeaders(header: string, rows: UploadDocumentTypes[], isClaimant: boolean, lang: string){
  if(!rows || rows.length == 0) return null;

  const newHeader = isClaimant == true ? t('PAGES.CLAIM_SUMMARY.CLAIMANT', {lng: lang}) + t(header, {lng: lang}) : t('PAGES.CLAIM_SUMMARY.DEFENDANT', {lng: lang}) + t(header, {lng: lang});

  return [{html: newHeader, classes:'govuk-!-width-one-half'},{html: '', classes: 'govuk-!-width-one-half'}] as TableCell[];
}

function getTableRows(rows: UploadDocumentTypes[], claim: Claim, isClaimant: boolean, lang: string) {

  if (!rows || rows.length == 0) return null;

  const tableRows = [] as TableCell[][];

  orderDocumentByTypeAndNewestToOldest(rows);

  for(const upload of rows)
  {
    const uploadDateString: string  = upload.createdDateTimeFormatted;

    const uploaderName = isClaimant == true ? t('PAGES.CLAIM_SUMMARY.CLAIMANT', {lng: lang}) : t('PAGES.CLAIM_SUMMARY.DEFENDANT', {lng: lang});
    const documentTypeName = UploadedEvidenceFormatter.getDocumentTypeName(upload.documentType, lang);
    let documentName: string;

    if(upload.documentType == EvidenceUploadExpert.STATEMENT) {
      documentName = documentTypeName;
    } else {
      documentName = uploaderName + documentTypeName.toLowerCase();
    }

    tableRows.push([
      {html: documentName + '<br>' + t('PAGES.CLAIM_SUMMARY.DATE_DOCUMENT_UPLOADED', {lng: lang}) + uploadDateString,
        classes: 'govuk-!-width-one-half'},
      {html: UploadedEvidenceFormatter.getDocumentLink(upload, claim.id),
        classes: 'govuk-!-width-one-half govuk-table__cell--numeric'}],
    );
  }

  return tableRows;
}

export function orderDocumentByTypeAndNewestToOldest(documentsWithDates: UploadDocumentTypes[]): UploadDocumentTypes[] {

  documentsWithDates.sort((a: UploadDocumentTypes, b: UploadDocumentTypes) => {
    const typeAValue : number = typeValueMap[a.documentType];
    const typeBValue : number = typeValueMap[b.documentType];

    if (a.caseDocument?.createdDatetime > b.caseDocument?.createdDatetime) {
      return 1;
    } else if (a.caseDocument?.createdDatetime < b.caseDocument?.createdDatetime) {
      return -1;
    } else {
      if (typeAValue < typeBValue) {
        return -1;
      }
      if (typeAValue > typeBValue){
        return 1;
      }
    }
    return 0;
  });
  return documentsWithDates;
}

export const typeValueMap: Record<string, number> = {
  DOCUMENTS_FOR_DISCLOSURE: 1,
  DISCLOSURE_LIST: 2,
  WITNESS_STATEMENT: 3,
  WITNESS_SUMMARY: 4,
  NOTICE_OF_INTENTION: 5,
  DOCUMENTS_REFERRED: 6,
  EXPERT_REPORT: 7,
  STATEMENT: 8,
  QUESTIONS_FOR_EXPERTS: 9,
  ANSWERS_FOR_EXPERTS: 10,
  CASE_SUMMARY: 11,
  SKELETON_ARGUMENT: 12,
  AUTHORITIES: 13,
  COSTS: 14,
  DOCUMENTARY: 15,
};
