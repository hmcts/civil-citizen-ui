import {UploadYourDocumentsSectionBuilder} from 'common/models/caseProgression/uploadYourDocumentsSectionBuilder';
import {ClaimSummaryType} from 'form/models/claimSummarySection';

describe('UploadYourDocumentsSectionBuilder tests', ()=> {
  it('should add Inset Text', ()=> {
    //Given
    const insetTextExpected = ({
      type: ClaimSummaryType.INSET_TEXT,
      data: {
        html: 'text',
        variables: 'variables',
      },
    });

    //When
    const insetTextBuilt = new UploadYourDocumentsSectionBuilder()
      .addInsetText('text', 'variables')
      .build();

    //Then
    expect(insetTextBuilt).toEqual([insetTextExpected]);
  });

  it('should add Start Button', ()=> {
    //Given
    const startButtonExpected = ({
      type: ClaimSummaryType.BUTTON,
      data: {
        text: 'text',
        href: 'href',
        isStartButton: true,
      },
    });

    //When
    const startButtonBuilt = new UploadYourDocumentsSectionBuilder()
      .addStartButton(startButtonExpected.data.text,startButtonExpected.data.href)
      .build();

    //Then
    expect(startButtonBuilt).toEqual([startButtonExpected]);
  });
});
