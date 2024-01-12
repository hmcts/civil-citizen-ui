import {t} from 'i18next';
import {ClaimSummaryType} from 'common/form/models/claimSummarySection';
import {Claim} from 'common/models/claim';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import { CaseDocumentInfoExtractor } from 'services/features/caseProgression/SystemDocumentInfoExtractor';
import { DocumentType } from 'models/document/documentType';
import { DirectionQuestionnaireType } from 'models/directionsQuestionnaire/directionQuestionnaireType';
import { CASE_DOCUMENT_DOWNLOAD_URL } from 'routes/urls';
import { CaseState } from 'common/form/models/claimDetails';

export const getClaimantResponseStatus = (claim: Claim, statement: string, lang: string) => {
  const claimNumber = claim.legacyCaseReference;
  // TODO: update this date as submission date When submission implemented on check-and-send page
  const responseSubmitDate = formatDateToFullDate(new Date(), lang);
  
  let htmlContent = `<span class='govuk-!-font-size-27'>${t('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CLAIM_NUMBER', { lng: lang })}</span>
  <br><strong>${claimNumber}</strong><br>
  <span class='govuk-!-font-weight-bold govuk-!-font-size-24'>${responseSubmitDate}</span>`;
  
  if (claim.ccdState == CaseState.IN_MEDIATION) {
    const documentId = CaseDocumentInfoExtractor.getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.DIRECTIONS_QUESTIONNAIRE, DirectionQuestionnaireType.CLAIMANT);
    const documentLinkUrl = CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claim.id).replace(':documentId', documentId);
    htmlContent = htmlContent + `<br><span class='govuk-!-font-size-27'> <a class="white-link" href = "${documentLinkUrl}" > ${t('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.REJECTED_DEFENDANT_RESPONSE.DOWNLOAD_YOUR_HEARING_REQUIREMENTS', { lng: lang })}</a></span >`;
  }
  return [
    {
      type: ClaimSummaryType.PANEL,
      data: {
        title: `<span class='govuk-!-font-size-36'>${t(statement, {lng: lang})}</span>`,
        html: htmlContent,
      },
    },
  ];
};

export const getRCDisputeNotContinueNextSteps = (claim: Claim, lang: string) => {
  const defendantName = claim.getDefendantFullName();
  return [
    {
      type: ClaimSummaryType.TITLE,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT', {lng: lang}),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.RC_DISPUTE.CLAIM_ENDED', {defendantName, lng: lang}),
      },
    },
  ];
};
