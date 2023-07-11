import {getDocumentsContent} from 'services/features/dashboard/claimSummaryService';
import {buildDownloadSealedClaimSection} from 'services/features/dashboard/claimDocuments/claimDocumentContentBuilder';

import {Claim} from 'models/claim';
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('getDocumentsContent', () => {
  it('should return an array with one ClaimSummaryContent object with one content section containing the download claim section', async () => {
    // Given
    const claimId = '123';
    const lang = 'en';

    // When
    const result = getDocumentsContent(new Claim(), claimId, lang);

    // Then
    expect(result).toHaveLength(1);
    expect(result[0].contentSections).toHaveLength(2);

    const downloadClaimSection = buildDownloadSealedClaimSection(new Claim(), claimId, lang);

    expect(result[0].contentSections[0]).toEqual(downloadClaimSection);
  });
});
