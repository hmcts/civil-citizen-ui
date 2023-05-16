import {ClaimSummaryContent} from 'form/models/claimSummarySection';
import {Claim} from 'models/claim';
import {buildDownloadSealedClaimSection, buildDownloadHearingNoticeSection} from './claimDocuments/claimDocumentContentBuilder';
import {isCaseProgressionV1Enable} from '../../../app/auth/launchdarkly/launchDarklyClient';

function getDocumentsContent(claim: Claim, claimId: string, lang?: string): ClaimSummaryContent[] {
  const downloadClaimSection = buildDownloadSealedClaimSection(claim, claimId, lang);
  const downloadHearingNoticeSection = isCaseProgressionV1Enable()
    ? buildDownloadHearingNoticeSection(claim, claimId, lang)
    : undefined;
  return [{
    contentSections: [
      downloadClaimSection,
      downloadHearingNoticeSection,
    ],
  }];
}

export {getDocumentsContent};
