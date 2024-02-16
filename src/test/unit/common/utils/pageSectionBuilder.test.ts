import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {ClaimSummaryType} from 'form/models/claimSummarySection';
import {t} from 'i18next';

describe('PageSectionBuilder tests', ()=> {
  it('should create title', ()=> {
    //Given
    const titleExpected = ({
      type: ClaimSummaryType.TITLE,
      data: {
        text: 'text',
        variables: 'variables',
        classes: 'classes',
      },
    });

    //When
    const titleBuilt = new PageSectionBuilder()
      .addTitle(titleExpected.data.text,titleExpected.data.variables,titleExpected.data.classes)
      .build();

    //Then
    expect(titleBuilt).toEqual([titleExpected]);
  });

  it('should add span', ()=> {
    //Given
    const spanExpected = ({
      type: ClaimSummaryType.SPAN,
      data: {
        text: 'text',
        variables: 'variable',
        classes: 'class',
      },
    });

    //When
    const spanResult = new PageSectionBuilder()
      .addSpan('text', 'variable', 'class')
      .build();

    //Then
    expect(spanResult).toEqual([spanExpected]);
  });

  it('should add Paragraph', ()=> {
    //Given
    const paragraphExpected = ({
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: 'text',
        variables: 'variables',
      },
    });

    //When
    const paragraphBuilt = new PageSectionBuilder()
      .addParagraph(paragraphExpected.data.text,paragraphExpected.data.variables)
      .build();

    //Then
    expect(paragraphBuilt).toEqual([paragraphExpected]);
  });

  it('should add link', ()=> {
    //Given
    const linkExpected = ({
      type: ClaimSummaryType.LINK,
      data: {
        text: 'text',
        href: 'href',
        textBefore: 'textBefore',
        textAfter: 'textAfter',
        externalLink: false,
      },
    });

    //When
    const linkBuilt = new PageSectionBuilder()
      .addLink(linkExpected.data.text,linkExpected.data.href,linkExpected.data.textBefore,linkExpected.data.textAfter)
      .build();

    //Then
    expect(linkBuilt).toEqual([linkExpected]);
  });

  it('should addLink with text before and after', ()=> {
    //Given
    const contactLinkExpected = ({
      type: ClaimSummaryType.LINK,
      data: {
        text: 'text',
        href: 'href',
        textBefore: 'textBefore',
        textAfter: 'textAfter',
        variables: 'variables',
        externalLink: false,
      },
    });

    //When
    const contactLinkBuilt = new PageSectionBuilder()
      .addLink(contactLinkExpected.data.text,contactLinkExpected.data.href,contactLinkExpected
        .data.textBefore,contactLinkExpected.data.textAfter,contactLinkExpected.data.variables)
      .build();

    //Then
    expect(contactLinkBuilt).toEqual([contactLinkExpected]);
  });

  it('should addLink with just text', ()=> {
    //Given
    const textAfterUnd: any = undefined;
    const textBeforeUnd: any = undefined;
    const contactLinkExpected = ({
      type: ClaimSummaryType.LINK,
      data: {
        text: 'text',
        href: 'href',
        textAfter: textAfterUnd,
        textBefore: textBeforeUnd,
        externalLink: false,
      },
    });

    //When
    const contactLinkBuilt = new PageSectionBuilder()
      .addLink(contactLinkExpected.data.text,contactLinkExpected.data.href)
      .build();

    //Then
    expect(contactLinkBuilt).toEqual([contactLinkExpected]);
  });

  it('should open the link in external window with just text', () => {
    //Given
    const textAfterUnd: any = undefined;
    const textBeforeUnd: any = undefined;
    const contactLinkExpected = ({
      type: ClaimSummaryType.LINK,
      data: {
        text: 'text',
        href: 'href',
        textAfter: textAfterUnd,
        textBefore: textBeforeUnd,
        externalLink: true,
      },
    });

    //When
    const contactLinkBuilt = new PageSectionBuilder()
      .addLink(contactLinkExpected.data.text, contactLinkExpected.data.href, textBeforeUnd, textAfterUnd, undefined, contactLinkExpected.data.externalLink)
      .build();

    //Then
    expect(contactLinkBuilt).toEqual([contactLinkExpected]);
  });

  it('should add Green Button', ()=> {
    //Given
    const buttonExpected = ({
      type: ClaimSummaryType.BUTTON,
      data: {
        text: 'text',
        href: 'href',
      },
    });

    //When
    const buttonBuilt = new PageSectionBuilder()
      .addButton(buttonExpected.data.text,buttonExpected.data.href)
      .build();

    //Then
    expect(buttonBuilt).toEqual([buttonExpected]);
  });

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
    const mainTitleBuilt = new PageSectionBuilder()
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
    const leadParagraphBuilt = new PageSectionBuilder()
      .addLeadParagraph(leadParagraphExpected.data.text,leadParagraphExpected.data.variables,leadParagraphExpected.data.classes)
      .build();

    //Then
    expect(leadParagraphBuilt).toEqual([leadParagraphExpected]);
  });

  it('should add HTML element', () => {
    //Given
    const deadline = '11 July 2023';
    const FINALISE_TRIAL_ARRANGEMENTS = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.FINALISE_TRIAL_ARRANGEMENTS';
    const htmlElement = `<p class="govuk-body">${t(`${FINALISE_TRIAL_ARRANGEMENTS}.IF_THERE_ARE_CHANGES_BEGINNING`)}
                                <span class="govuk-body govuk-!-font-weight-bold">${t(`${FINALISE_TRIAL_ARRANGEMENTS}.IF_THERE_ARE_CHANGES_END`, {finalisingTrialArrangementsDeadline: deadline})}</span>.
                              </p>`;
    const expectedHtmlElement = ({
      type: ClaimSummaryType.HTML,
      data: {
        html: htmlElement,
      },
    });
    //When
    const htmlElementBuilt = new PageSectionBuilder()
      .addRawHtml(htmlElement)
      .build();
    //Then
    expect(htmlElementBuilt).toEqual([expectedHtmlElement]);
  });

  it('should add micro text', ()=> {
    //Given
    const microTextExpected = ({
      type: ClaimSummaryType.MICRO_TEXT,
      data: {
        text: 'text',
        variables: 'variables',
      },
    });

    //When
    const microTextResult = new PageSectionBuilder()
      .addMicroText('text', microTextExpected.data.variables)
      .build();

    //Then
    expect(microTextResult).toEqual([microTextExpected]);
  });

  it('should add addButtonWithCancelLink', ()=> {
    //Given
    const buttonWithCancelLinkExpected = ({
      type: ClaimSummaryType.BUTTON_WITH_CANCEL_LINK,
      data: {
        text: 'title',
        href: 'href',
        isStartButton: true,
        cancelHref: 'cancelHref',
      },
    });
    //When
    const buttonWithCancelLinkResult = new PageSectionBuilder()
      .addButtonWithCancelLink('title', 'href', true, 'cancelHref')
      .build();

    //Then
    expect(buttonWithCancelLinkResult).toEqual([buttonWithCancelLinkExpected]);
  });

  it('should add Warning', ()=> {
    //Given
    const addWarningResultExpected = ({
      type: ClaimSummaryType.WARNING,
      data: {
        text: 'text',
        variables: 'variables',
      },
    });
    //When
    const addWarningResult = new PageSectionBuilder()
      .addWarning('text', 'variables')
      .build();

    //Then
    expect(addWarningResult).toEqual([addWarningResultExpected]);
  });
});
