import {UploadYourDocumentsSectionBuilder} from 'common/models/caseProgression/uploadYourDocumentsSectionBuilder';
import {ClaimSummaryType} from 'form/models/claimSummarySection';
import {t} from 'i18next';

describe('UploadYourDocumentsSectionBuilder tests', ()=> {
  it('should create mainTitle', ()=> {
  //Given
    const mainTitleExpected = ({
      type: ClaimSummaryType.MAINTITLE,
      data: {
        text: 'text',
        variables: 'variables',
      },
    });

    //When
    const mainTitleBuilt = new UploadYourDocumentsSectionBuilder()
      .addMainTitle(mainTitleExpected.data.text,mainTitleExpected.data.variables)
      .build();

    //Then
    expect(mainTitleBuilt).toEqual([mainTitleExpected]);
  });

  it('should add leadParagraph', ()=> {
    //Given
    const leadParagraphExpected = ({
      type: ClaimSummaryType.LEAD_PARAGRAPH,
      data: {
        text: 'text',
        variables: 'variables',
        classes: 'classes',
      },
    });

    //When
    const leadParagraphBuilt = new UploadYourDocumentsSectionBuilder()
      .addLeadParagraph(leadParagraphExpected.data.text,leadParagraphExpected.data.variables,leadParagraphExpected.data.classes)
      .build();

    //Then
    expect(leadParagraphBuilt).toEqual([leadParagraphExpected]);
  });

  it('should add Inset Text', ()=> {
    //Given
    const insetTextExpected = ({
      type: ClaimSummaryType.INSET_TEXT,
      data: {
        html: t('text'),
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
