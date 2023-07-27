import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {ClaimSummaryType} from 'form/models/claimSummarySection';

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
});
