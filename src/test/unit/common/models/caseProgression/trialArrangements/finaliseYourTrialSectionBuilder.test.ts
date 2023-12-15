import {FinaliseYourTrialSectionBuilder} from 'models/caseProgression/trialArrangements/finaliseYourTrialSectionBuilder';
import {ClaimSummaryType} from 'form/models/claimSummarySection';
import {t} from 'i18next';

describe('FinaliseYourTrialSectionBuilder tests', ()=> {
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
    const mainTitleBuilt = new FinaliseYourTrialSectionBuilder()
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
      },
    });

    //When
    const leadParagraphBuilt = new FinaliseYourTrialSectionBuilder()
      .addLeadParagraph(leadParagraphExpected.data.text,leadParagraphExpected.data.variables)
      .build();

    //Then
    expect(leadParagraphBuilt).toEqual([leadParagraphExpected]);
  });

  it('should add Inset Text', ()=> {
    //Given
    const insetTextExpected = ({
      type: ClaimSummaryType.INSET_TEXT,
      data: {
        html: '<STRONG>'+ t('text') +'</STRONG>' + t('text1') +'<P>' + t('text2') +'</P>',
        variables: 'variables',
      },
    });

    //When
    const insetTextBuilt = new FinaliseYourTrialSectionBuilder()
      .addCustomInsetText('text', 'text1', 'text2', 'variables')
      .build();

    //Then
    expect(insetTextBuilt).toEqual([insetTextExpected]);
  });

  it('should add warning text', ()=> {
    //Given
    const warningTextExpected = ({
      type: ClaimSummaryType.WARNING,
      data: {
        text: 'text',
        variables: 'variables',
      },
    });

    //When
    const warningTextBuilt = new FinaliseYourTrialSectionBuilder()
      .addWarning(warningTextExpected.data.text, warningTextExpected.data.variables)
      .build();

    //Then
    expect(warningTextBuilt).toEqual([warningTextExpected]);
  });

  it('should add leadParagraph with no bottom margin', ()=> {
    //Given
    const leadParaWithNoMarginExpected = ({
      type: ClaimSummaryType.LEAD_PARAGRAPH,
      data: {
        text: 'text',
        variables: 'variables',
        classes: 'classes',
      },
    });

    //When
    const leadParagraphBuilt = new FinaliseYourTrialSectionBuilder()
      .addLeadParagraph(leadParaWithNoMarginExpected.data.text,leadParaWithNoMarginExpected.data.variables,leadParaWithNoMarginExpected.data.classes)
      .build();

    //Then
    expect(leadParagraphBuilt).toEqual([leadParaWithNoMarginExpected]);
  });

  it('should add Start Button with cancel link', ()=> {
    //Given
    const startButtonExpected = ({
      type: ClaimSummaryType.BUTTON_WITH_CANCEL_LINK,
      data: {
        text: 'text',
        href: 'href',
        isStartButton: true,
        cancelHref: 'cancelHref',
      },
    });

    //When
    const startButtonBuilt = new FinaliseYourTrialSectionBuilder()
      .addStartButtonWithLink(startButtonExpected.data.text,startButtonExpected.data.href,startButtonExpected.data.cancelHref)
      .build();

    //Then
    expect(startButtonBuilt).toEqual([startButtonExpected]);
  });

  it('should create insetText', ()=> {
    //Given
    const insetTextExpected = ({
      type: ClaimSummaryType.INSET_TEXT,
      data: {
        html: 'text',
        variables: 'variables',
      },
    });

    //When
    const insetTextBuilt = new FinaliseYourTrialSectionBuilder()
      .addInsetText('text', insetTextExpected.data.variables)
      .build();

    //Then
    expect(insetTextBuilt).toEqual([insetTextExpected]);
  });

  it('should create ParagraphWithHTML', ()=> {
    //Given
    const htmlParagraphExpected = ({
      type: ClaimSummaryType.HTML,
      data: {
        html: '<p class="govuk-body">text</p>',
        variables: 'variables',
      },
    });

    //When
    const mainTitleBuilt = new FinaliseYourTrialSectionBuilder()
      .addParagraphWithHTML('text', htmlParagraphExpected.data.variables)
      .build();

    //Then
    expect(mainTitleBuilt).toEqual([htmlParagraphExpected]);
  });

});
