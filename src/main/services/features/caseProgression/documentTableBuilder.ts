import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {Claim} from 'models/claim';
import {UploadDocumentTypes} from 'models/caseProgression/uploadDocumentsType';
import {TableCell} from 'models/summaryList/summaryList';
import {EvidenceUploadExpert} from 'models/document/documentType';
import {t} from 'i18next';
import {TabSectionBuilder} from 'models/caseProgression/TabSectionBuilder';
import { UploadedEvidenceFormatter} from 'services/features/caseProgression/uploadedEvidenceFormatter';

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

  const evidenceUploadTab = new TabSectionBuilder()
    .addParagraph(t('PAGES.CLAIM_SUMMARY.EVIDENCE_UPLOAD_SUMMARY', {lng: lang}))
    .addTable(getTableHeaders(disclosureHeading, disclosureListClaimant, true, lang), getTableRows(disclosureListClaimant, claim,true, lang), wrap)
    .addTable(getTableHeaders(disclosureHeading, disclosureListDefendant, false, lang), getTableRows(disclosureListDefendant, claim,false, lang), wrap)
    .addTable(getTableHeaders(witnessHeading, witnessListClaimant, true, lang), getTableRows(witnessListClaimant, claim,true, lang), wrap)
    .addTable(getTableHeaders(witnessHeading, witnessListDefendant, false, lang), getTableRows(witnessListDefendant, claim,false, lang), wrap)
    .addTable(getTableHeaders(expertHeading, expertListClaimant, true, lang), getTableRows(expertListClaimant, claim,true, lang), wrap)
    .addTable(getTableHeaders(expertHeading, expertListDefendant, false, lang), getTableRows(expertListDefendant, claim,false, lang), wrap)
    .addTable(getTableHeaders(trialOrHearingHeading, trialListClaimant, true, lang), getTableRows(trialListClaimant, claim,true, lang), wrap)
    .addTable(getTableHeaders(trialOrHearingHeading, trialListDefendant, false, lang), getTableRows(trialListDefendant, claim, false, lang), wrap)
    .build();

  return evidenceUploadTab;
}

function getTableHeaders(header: string, rows: UploadDocumentTypes[], isClaimant: boolean, lang: string){
  if(!rows || rows.length == 0) return null;

  const newHeader = isClaimant == true ? t('PAGES.CLAIM_SUMMARY.CLAIMANT', {lng: lang}) + t(header, {lng: lang}) : t('PAGES.CLAIM_SUMMARY.DEFENDANT', {lng: lang}) + t(header, {lng: lang});

  return [{html: newHeader, classes:'govuk-!-width-one-half'},{html: '', classes: 'govuk-!-width-one-half'}] as TableCell[];
}

function getTableRows(rows: UploadDocumentTypes[], claim: Claim, isClaimant: boolean, lang: string) {

  if (!rows || rows.length == 0) return null;

  const tableRows = [] as TableCell[][];

  orderDocumentNewestToOldest(rows);

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

function orderDocumentNewestToOldest(documentsWithDates: UploadDocumentTypes[]): UploadDocumentTypes[] {

  documentsWithDates.sort((a: UploadDocumentTypes, b: UploadDocumentTypes) => {
    return +b.caseDocument?.createdDatetime - +a.caseDocument?.createdDatetime;
  });

  return documentsWithDates;
}
