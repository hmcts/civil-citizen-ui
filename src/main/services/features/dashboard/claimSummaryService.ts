import {ClaimSummaryContent} from 'form/models/claimSummarySection';
import {Claim} from 'models/claim';
import {buildDownloadSealedClaimSection, buildDownloadHearingNoticeSection} from './claimDocuments/claimDocumentContentBuilder';

function getDocumentsContent(claim: Claim, claimId: string, lang?: string): ClaimSummaryContent[] {
  const downloadClaimSection = buildDownloadSealedClaimSection(claim, claimId, lang);
  const downloadHearingNoticeSection = buildDownloadHearingNoticeSection(claim, claimId, lang);
  return [{
    contentSections: [
      downloadClaimSection,
      downloadHearingNoticeSection,
    ],
  }];
}

export {getDocumentsContent};
