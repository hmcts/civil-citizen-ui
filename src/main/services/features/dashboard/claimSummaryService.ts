import {ClaimSummaryContent} from 'form/models/claimSummarySection';
import {Claim} from 'models/claim';
import {
  buildDownloadHearingNoticeSection,
  buildSystemGeneratedDocumentSections,
  buildDownloadSealedClaimSectionTitle, buildDownloadFinalOrderSection,
} from './claimDocuments/claimDocumentContentBuilder';
import {getEvidenceUploadDocuments} from 'services/features/caseProgression/documentTableBuilder';
import {isCaseProgressionV1Enable} from '../../../app/auth/launchdarkly/launchDarklyClient';

async function getDocumentsContent(claim: Claim, claimId: string, lang?: string): Promise<ClaimSummaryContent[]> {
  const downloadOrdersSection = await isCaseProgressionV1Enable() ? buildDownloadFinalOrderSection(claim, claimId, lang): [];

  const downloadClaimTitle = buildDownloadSealedClaimSectionTitle(lang);
  const downloadClaimSection = buildSystemGeneratedDocumentSections(claim, claimId, lang);
  const downloadHearingNoticeSection = await isCaseProgressionV1Enable() ? buildDownloadHearingNoticeSection(claim, claimId, lang) : undefined;

  return [{
    contentSections: [
      ...downloadOrdersSection,
      downloadClaimTitle,
      ...downloadClaimSection,
      downloadHearingNoticeSection,
    ],
    hasDivider: false,
  }];
}

function getEvidenceUploadContent(claim: Claim): ClaimSummaryContent[] {
  return [{
    contentSections: getEvidenceUploadDocuments(claim),
    hasDivider: false,
  }];
}

export {getDocumentsContent, getEvidenceUploadContent};
