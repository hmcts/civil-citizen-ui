import {Claim} from 'models/claim';
import {ClaimSummaryContent, ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {SummaryRow} from 'models/summaryList/summaryList';
import {t} from 'i18next';
import {
  formatDocumentAlignedViewURL,
  formatDocumentWithHintText,
} from 'common/utils/formatDocumentURL';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {alignText} from 'form/models/alignText';
import {CaseDocument} from 'models/document/caseDocument';
import {DocumentType} from 'models/document/documentType';
import { SystemGeneratedCaseDocuments } from 'common/models/document/systemGeneratedCaseDocuments';

export function getJudgementContent(claimId: string, claim: Claim, lang: string, redirectUrl: string): ClaimSummaryContent[] {

  const claimSummaryContent = [] as ClaimSummaryContent[];
  claimSummaryContent.push(getJudgements(claimId, claim, lang));
  claimSummaryContent.push(getButton(claimId, claim, lang, redirectUrl));

  return claimSummaryContent;
}

function getJudgements(claimId: string, claim: Claim, lang: string): ClaimSummaryContent {

  const judgementHeaders = getJudgementsHeader(lang);
  const judgementSummary = getJudgementSummary(claim, lang);

  const hearingsSection = [] as ClaimSummarySection[];
  hearingsSection.push(judgementHeaders);
  hearingsSection.push(judgementSummary);

  return {contentSections: hearingsSection, hasDivider: false};
}

function getJudgementsHeader(lang: string): ClaimSummarySection {
  return {
    type: ClaimSummaryType.TITLE,
    data: {text: t('PAGES.DASHBOARD.JUDGMENTS.JUDGMENT', {lng: lang})},
  };
}

function getJudgementSummary(claim: Claim, lang: string): ClaimSummarySection {

  const judgementRows = [] as SummaryRow[];
  const judgementDocument: CaseDocument = getJudgementDocument(claim);

  if (judgementDocument != undefined) {
    const judgementDocumentLink = formatDocumentAlignedViewURL(judgementDocument?.documentName, claim.id, judgementDocument?.documentLink.document_binary_url, alignText.ALIGN_TO_THE_RIGHT);
    const judgementDoc = formatDocumentWithHintText(t('PAGES.DASHBOARD.JUDGMENTS.JUDGMENT', {lng: lang}), judgementDocument?.createdDatetime, lang);
    judgementRows.push({
      key: {html: judgementDoc, classes: 'govuk-!-width-one-half'},
      value: {html: judgementDocumentLink},
    });
  }

  return {type: ClaimSummaryType.SUMMARY, data: {rows: judgementRows}};
}

function getButton(claimId: string, claim: Claim, lang: string, redirectUrl: string): ClaimSummaryContent {

  const buttonSection = new PageSectionBuilder()
    .addButton(t('COMMON.BUTTONS.CLOSE_AND_RETURN_TO_CASE_OVERVIEW', {lng: lang}), constructResponseUrlWithIdParams(claimId, redirectUrl))
    .build();

  return {contentSections: buttonSection, hasDivider: false};
}

function getJudgementDocument(claim: Claim): CaseDocument {
  const documentTypes = {
    claimant: [DocumentType.DEFAULT_JUDGMENT, DocumentType.JUDGMENT_BY_ADMISSION_CLAIMANT, DocumentType.JUDGMENT_BY_DETERMINATION_CLAIMANT, DocumentType.DEFAULT_JUDGMENT_CLAIMANT1, DocumentType.DEFAULT_JUDGMENT_CLAIMANT2],
    defendant: [DocumentType.DEFAULT_JUDGMENT, DocumentType.JUDGMENT_BY_ADMISSION_DEFENDANT, DocumentType.JUDGMENT_BY_DETERMINATION_DEFENDANT, DocumentType.DEFAULT_JUDGMENT_DEFENDANT1, DocumentType.DEFAULT_JUDGMENT_DEFENDANT2],
  };

  let judgementDocument;

  const checkDocumentType = (documentType: any, documentTypesArray: string | any[]) => documentTypesArray.includes(documentType);

  const findJudgementDocument = (documents: SystemGeneratedCaseDocuments[]) => {
    for (const document of documents) {
      if (claim.isClaimant() && checkDocumentType(document.value.documentType, documentTypes.claimant)) {
        judgementDocument = document.value;
        break;
      } else if (!claim.isClaimant() && checkDocumentType(document.value.documentType, documentTypes.defendant)) {
        judgementDocument = document.value;
        break;
      }
    }
  };

  const systemGeneratedCaseDocuments = claim.systemGeneratedCaseDocuments;
  if (systemGeneratedCaseDocuments && systemGeneratedCaseDocuments.length > 0) {
    findJudgementDocument(systemGeneratedCaseDocuments);
  }

  const defaultJudgmentDocuments = claim.defaultJudgmentDocuments;
  if (judgementDocument === undefined && defaultJudgmentDocuments && defaultJudgmentDocuments.length > 0) {
    findJudgementDocument(defaultJudgmentDocuments);
  }

  return judgementDocument;
}
