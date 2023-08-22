import {ClaimSummaryType} from 'form/models/claimSummarySection';
import {buildDownloadSectionTitle} from 'services/features/dashboard/documentBuilderService';

describe('documentBuilderService.ts', () => {
  it('build download section title', ()=> {
    //Given
    const titleExpected = ({
      type: ClaimSummaryType.TITLE,
      data: {
        text: 'text',
      },
    });

    //When
    const titleBuilt = [buildDownloadSectionTitle(titleExpected.data.text)];

    //Then
    expect(titleBuilt).toEqual([titleExpected]);
  });
});
