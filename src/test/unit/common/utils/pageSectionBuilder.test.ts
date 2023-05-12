import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {ClaimSummaryType} from 'form/models/claimSummarySection';

const text = 'text';
const variables = 'variables';
const href = 'nextPage';
const textBefore = 'textBefore';
const textAfter= 'textAfter';

describe('PageSectionBuilder tests', ()=> {
  it('should create title', ()=> {
    //Given
    const titleExpected = ([{
      type: ClaimSummaryType.TITLE,
      data: {
        text: text,
        variables: variables,
      },
    }]);

    //When
    const result = new PageSectionBuilder()
      .addTitle(text,variables)
      .build();

    //Then
    expect(titleExpected).toEqual(result);
  });

  it('should add Paragraph', ()=> {
    //Given
    const paragraphExpected = ([{
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: text,
        variables: variables,
      },
    }]);

    //When
    const result = new PageSectionBuilder()
      .addParagraph(text,variables)
      .build();

    //Then
    expect(paragraphExpected).toEqual(result);
  });

  it('should add link', ()=> {
    //Given
    const linkExpected = ([{
      type: ClaimSummaryType.LINK,
      data: {
        text: text,
        href: href,
        textBefore: textBefore,
        textAfter: textAfter,
      },
    }]);

    //When
    const result = new PageSectionBuilder()
      .addLink(text,href,textBefore,textAfter)
      .build();

    //Then
    expect(linkExpected).toEqual(result);
  });

  it('should addLink with text before and after', ()=> {
    //Given
    const contactLinkExpected = [({
      type: ClaimSummaryType.LINK,
      data: {
        text: text,
        href: href,
        textBefore: textBefore,
        textAfter: textAfter,
        variables: variables,
      },
    })];

    //When
    const result = new PageSectionBuilder()
      .addLink(text,href,textBefore,textAfter,variables)
      .build();

    //Then
    expect(contactLinkExpected).toEqual(result);
  });

  it('should addLink with just text', ()=> {
    //Given
    const textAfterUnd: any = undefined;
    const textBeforeUnd: any = undefined;
    const contactLinkExpected = [({
      type: ClaimSummaryType.LINK,
      data: {
        text: text,
        href: href,
        textAfter: textAfterUnd,
        textBefore: textBeforeUnd,
      },
    })];

    //When
    const result = new PageSectionBuilder()
      .addLink(text,href)
      .build();

    //Then
    expect(contactLinkExpected).toEqual(result);
  });

  it('should add Green Button', ()=> {
    //Given
    const buttonExpected = ([{
      type: ClaimSummaryType.BUTTON,
      data: {
        text: text,
        href: href,
      },
    }]);

    //When
    const result = new PageSectionBuilder()
      .addButton(text,href)
      .build();

    //Then
    expect(buttonExpected).toEqual(result);
  });
});
