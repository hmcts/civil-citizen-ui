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
      },
    });

    //When
    const titleBuilt = new PageSectionBuilder()
      .addTitle(titleExpected.data.text,titleExpected.data.variables)
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
      },
    });

    //When
    const contactLinkBuilt = new PageSectionBuilder()
      .addLink(contactLinkExpected.data.text,contactLinkExpected.data.href)
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
});
