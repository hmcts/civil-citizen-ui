import {Claim} from 'models/claim';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {t} from 'i18next';
import {
  generateDocumentSection,
  buildDownloadSectionTitle,
} from 'services/features/dashboard/documentBuilderService';

const buildDownloadFinalOrderSection = (claim: Claim, claimId: string, lang: string): ClaimSummarySection [] => {
  const finalOrderDocumentCollection = claim.caseProgression?.finalOrderDocumentCollection;
  const claimDocumentsSections: ClaimSummarySection[] = [];
  if (finalOrderDocumentCollection && finalOrderDocumentCollection.length > 0) {
    claimDocumentsSections.push(buildDownloadSectionTitle(t('PAGES.CLAIM_SUMMARY.ORDERS', { lng: lang })));
    finalOrderDocumentCollection.forEach(document =>
      claimDocumentsSections.push(generateDocumentSection(document.value, claimId, lang)));
  }
  return claimDocumentsSections;
};

export {
  buildDownloadFinalOrderSection,
};
