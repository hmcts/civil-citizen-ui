import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {ClaimSummaryType} from 'form/models/claimSummarySection';
import {CASE_DOCUMENT_DOWNLOAD_URL, CITIZEN_CONTACT_THEM_URL} from 'routes/urls';
import {DocumentUri} from 'models/document/documentType';

const text = 'text';
const variables = 'variables';
const href = 'nextPage';
const textBefore = 'textBefore';
const textAfter= 'textAfter';
const claimId = '01';

describe('PageSectionBuilder tests', ()=> {
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
    const result = new PageSectionBuilder()
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
    const result = new PageSectionBuilder()
      .addMainTitle(text,variables)
      .build();

    //Then
    expect(mainTitleExpected).toEqual(result);
  });

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
    const result = new PageSectionBuilder()
      .addLeadParagraph(text,variables)
      .build();

    //Then
    expect(leadParagraphExpected).toEqual(result);
  });

  it('should add contactLink', ()=> {
    //Given
    const contactLinkExpected = ([{
      type: ClaimSummaryType.LINK,
      data: {
        href: CITIZEN_CONTACT_THEM_URL.replace(':id', claimId),
        text: text,
        textAfter: textAfter,
        variables: variables,
      },
    }]);

    //When
    const result = new PageSectionBuilder()
      .addContactLink(text,claimId,variables,textAfter)
      .build();

    //Then
    expect(contactLinkExpected).toEqual(result);
  });

  it('should add ResponseDocumentLink', ()=> {
    //Given
    const responseDocumentLinkExpected = ([{
      type: ClaimSummaryType.LINK,
      data: {
        text: text,
        href: CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claimId)
          .replace(':documentType', DocumentUri.SEALED_CLAIM),
        textAfter: textAfter,
        variables: variables,
      },
    }]);

    //When
    const result = new PageSectionBuilder()
      .addResponseDocumentLink(text,claimId,variables,textAfter)
      .build();

    //Then
    expect(responseDocumentLinkExpected).toEqual(result);
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
    const result = new PageSectionBuilder()
      .addStartButton(text,href)
      .build();

    //Then
    expect(startButtonExpected).toEqual(result);
  });
});
