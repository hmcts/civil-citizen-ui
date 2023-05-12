import {UploadYourDocumentsSectionBuilder} from 'common/models/caseProgression/uploadYourDocumentsSectionBuilder';
import {ClaimSummaryType} from 'form/models/claimSummarySection';

const text = 'text';
const variables = 'variables';
const href = 'nextPage';

describe('UploadYourDocumentsSectionBuilder tests', ()=> {
  it('should create caption', ()=> {
    //Given
    const captionExpected = ([{
      type: ClaimSummaryType.CAPTION,
      data: {
        text: text,
        variables: variables,
      },
    }]);

    //When
    const result = new UploadYourDocumentsSectionBuilder()
      .addCaption(text,variables)
      .build();

    //Then
    expect(captionExpected).toEqual(result);
  });

  it('should create mainTitle', ()=> {
  //Given
    const mainTitleExpected = ([{
      type: ClaimSummaryType.MAINTITLE,
      data: {
        text: text,
        variables: variables,
      },
    }]);

    //When
    const result = new UploadYourDocumentsSectionBuilder()
      .addMainTitle(text,variables)
      .build();

    //Then
    expect(mainTitleExpected).toEqual(result);
  });

  it('should add leadParagraph', ()=> {
    //Given
    const leadParagraphExpected = ([{
      type: ClaimSummaryType.LEAD_PARAGRAPH,
      data: {
        text: text,
        variables: variables,
      },
    }]);

    //When
    const result = new UploadYourDocumentsSectionBuilder()
      .addLeadParagraph(text,variables)
      .build();

    //Then
    expect(leadParagraphExpected).toEqual(result);
  });
  it('should add Start Button', ()=> {
    //Given
    const startButtonExpected = ([{
      type: ClaimSummaryType.BUTTON,
      data: {
        text: text,
        href: href,
        isStartButton: true,
      },
    }]);

    //When
    const result = new UploadYourDocumentsSectionBuilder()
      .addStartButton(text,href)
      .build();

    //Then
    expect(startButtonExpected).toEqual(result);
  });
});
