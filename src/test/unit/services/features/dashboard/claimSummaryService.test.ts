import {getDocumentsContent} from 'services/features/dashboard/claimSummaryService';
import {
  buildDownloadHearingNoticeSection,
  buildDownloadSealedClaimSection,
} from 'services/features/dashboard/claimDocuments/claimDocumentContentBuilder';
import {Claim} from 'models/claim';
import {isCaseProgressionV1Enable} from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const isCaseProgressionV1EnableMock = isCaseProgressionV1Enable as jest.Mock;

describe('getDocumentsContent', () => {
  it('should return an array with one ClaimSummaryContent object with one content section containing the download claim section', async () => {
    // Given
    const claimId = '123';
    const lang = 'en';
    isCaseProgressionV1EnableMock.mockResolvedValue(true);

    // When
    const result = await getDocumentsContent(new Claim(), claimId, lang);

    // Then
    expect(result).toHaveLength(1);
    expect(result[0].contentSections).toHaveLength(2);

    const downloadClaimSection = buildDownloadSealedClaimSection(new Claim(), claimId, lang);
    const downloadHearingNoticeSection = buildDownloadHearingNoticeSection(new Claim(), claimId, lang);

    expect(result[0].contentSections[0]).toEqual(downloadClaimSection);
    expect(result[0].contentSections[1]).toEqual(downloadHearingNoticeSection);
  });
});
