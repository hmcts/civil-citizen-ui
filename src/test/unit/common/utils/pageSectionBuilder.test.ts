import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {ClaimSummaryType} from 'form/models/claimSummarySection';
import {CASE_DOCUMENT_DOWNLOAD_URL, CITIZEN_CONTACT_THEM_URL} from 'routes/urls';
import {DocumentUri} from 'models/document/documentType';

describe('PageSectionBuilder tests', ()=> {
  it('should create title', ()=> {
    //Given
    const title = 'testTitle';
    const variables = 'testVariables';
    const titleExpected = ([{
      type: ClaimSummaryType.TITLE,
      data: {
        text: title,
        variables: variables,
      },
    }]);

    //When
    const result = new PageSectionBuilder()
      .addTitle(title,variables)
      .build();

    //Then
    expect(titleExpected).toEqual(result);
  });

  it('should create subTitle', ()=> {
    //Given
    const subTitle = 'testSubTitle';
    const variables = 'variables';
    const subTitleExpected = ([{
      type: ClaimSummaryType.SUBTITLE,
      data: {
        text: subTitle,
        variables: variables,
      },
    }]);

    //When
    const result = new PageSectionBuilder()
      .addSubTitle(subTitle,variables)
      .build();

    //Then
    expect(subTitleExpected).toEqual(result);
  });

  it('should add Paragraph', ()=> {
    //Given
    const paragraph = 'testParagraph';
    const variables = 'variables';
    const paragraphExpected = ([{
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: paragraph,
        variables: variables,
      },
    }]);

    //When
    const result = new PageSectionBuilder()
      .addParagraph(paragraph,variables)
      .build();

    //Then
    expect(paragraphExpected).toEqual(result);
  });

  it('should add leadParagraph', ()=> {
    //Given
    const leadParagraph = 'testLeadParagraph';
    const variables = 'variables';
    const leadParagraphExpected = ([{
      type: ClaimSummaryType.LEAD_PARAGRAPH,
      data: {
        text: leadParagraph,
        variables: variables,
      },
    }]);

    //When
    const result = new PageSectionBuilder()
      .addLeadParagraph(leadParagraph,variables)
      .build();

    //Then
    expect(leadParagraphExpected).toEqual(result);
  });

  it('should add link', ()=> {
    //Given
    const text = 'text';
    const href = 'href';
    const textBefore = 'textBefore';
    const textAfter= 'textAfter';
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

  it('should add contactLink', ()=> {
    //Given
    const text = 'text';
    const claimId = '01';
    const variables = 'variables';
    const textAfter = 'textAfter';
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

  it('should add Start Button', ()=> {
    //Given
    const title = 'test';
    const href = 'nextPage';
    const isStartButton = true;
    const startButtonExpected = ([{
      type: ClaimSummaryType.BUTTON,
      data: {
        text: title,
        href: href,
        isStartButton: isStartButton,
      },
    }]);

    //When
    const result = new PageSectionBuilder()
      .addStartButton(title,href)
      .build();

    //Then
    expect(startButtonExpected).toEqual(result);
  });

  it('should add ResponseDocumentLink', ()=> {
    //Given
    const text = 'text';
    const claimId = '01';
    const variables = 'variables';
    const textAfter = 'textAfter';
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
    const title = 'test';
    const href = 'nextPage';
    const buttonExpected = ([{
      type: ClaimSummaryType.BUTTON,
      data: {
        text: title,
        href: href,
      },
    }]);

    //When
    const result = new PageSectionBuilder()
      .addButton(title,href)
      .build();

    //Then
    expect(buttonExpected).toEqual(result);
  });

  it('should addLink with text before and after', ()=> {
    //Given
    const text = 'text';
    const href = 'href';
    const textBefore = 'before';
    const textAfter = 'after';
    const variables = 'variables';
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
    const text = 'text';
    const href = 'href';
    const textAfter: any = undefined;
    const textBefore: any = undefined;
    const contactLinkExpected = [({
      type: ClaimSummaryType.LINK,
      data: {
        text: text,
        href: href,
        textAfter: textAfter,
        textBefore: textBefore,
      },
    })];

    //When
    const result = new PageSectionBuilder()
      .addLink(text,href)
      .build();

    //Then
    expect(contactLinkExpected).toEqual(result);
  });
});
