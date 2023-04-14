import {LastUpdateSectionBuilder} from 'models/LastUpdateSectionBuilder/latestUpdateBuilder';

describe('LatestUpdateTest tests', ()=> {
  it('should create title', ()=> {
    //Given
    const title = 'testTitle';
    const titleObject = new LastUpdateSectionBuilder()
      .addTitle(title)
      .build();

    //When
    const result = new LastUpdateSectionBuilder()
      .addTitle(title)
      .build();
    //When Then
    expect(titleObject).toEqual(result);
  });

  it('should add Paragraph', ()=> {
    //Given
    const paragraph = 'testTitle';
    const paragraphExpected = new LastUpdateSectionBuilder()
      .addParagraph(paragraph)
      .build();

    //When
    const result = new LastUpdateSectionBuilder()
      .addParagraph(paragraph)
      .build();
    //When Then
    expect(paragraphExpected).toEqual(result);
  });

  it('should add contactLink', ()=> {
    //Given
    const contactLinkObject = {
      text: 'text',
      claimId: '01',
    };

    const contactLinkExpected = new LastUpdateSectionBuilder()
      .addContactLink(contactLinkObject.text,contactLinkObject.claimId)
      .build();

    //When
    const result = new LastUpdateSectionBuilder()
      .addContactLink(contactLinkObject.text,contactLinkObject.claimId)
      .build();
    //When Then
    expect(contactLinkExpected).toEqual(result);
  });

  it('should add ResponseDocumentLink', ()=> {
    //Given
    const contactLinkObject = {
      text: 'text',
      claimId: '01',
    };

    const contactLinkExpected = new LastUpdateSectionBuilder()
      .addResponseDocumentLink(contactLinkObject.text,contactLinkObject.claimId)
      .build();

    //When
    const result = new LastUpdateSectionBuilder()
      .addResponseDocumentLink(contactLinkObject.text,contactLinkObject.claimId)
      .build();
    //When Then
    expect(contactLinkExpected).toEqual(result);
  });

});
