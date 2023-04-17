import {LatestUpdateSectionBuilder} from 'models/LatestUpdateSectionBuilder/latestUpdateSectionBuilder';

describe('LatestUpdateSectionBuilder tests', ()=> {
  it('should create title', ()=> {
    //Given
    const title = 'testTitle';
    const titleObject = new LatestUpdateSectionBuilder()
      .addTitle(title)
      .build();

    //When
    const result = new LatestUpdateSectionBuilder()
      .addTitle(title)
      .build();
    //Then
    expect(titleObject).toEqual(result);
  });

  it('should add Paragraph', ()=> {
    //Given
    const paragraph = 'testTitle';
    const paragraphExpected = new LatestUpdateSectionBuilder()
      .addParagraph(paragraph)
      .build();

    //When
    const result = new LatestUpdateSectionBuilder()
      .addParagraph(paragraph)
      .build();
    //Then
    expect(paragraphExpected).toEqual(result);
  });

  it('should add contactLink', ()=> {
    //Given
    const contactLinkObject = {
      text: 'text',
      claimId: '01',
    };

    const contactLinkExpected = new LatestUpdateSectionBuilder()
      .addContactLink(contactLinkObject.text,contactLinkObject.claimId)
      .build();

    //When
    const result = new LatestUpdateSectionBuilder()
      .addContactLink(contactLinkObject.text,contactLinkObject.claimId)
      .build();
    //Then
    expect(contactLinkExpected).toEqual(result);
  });

  it('should add ResponseDocumentLink', ()=> {
    //Given
    const contactLinkObject = {
      text: 'text',
      claimId: '01',
    };

    const contactLinkExpected = new LatestUpdateSectionBuilder()
      .addResponseDocumentLink(contactLinkObject.text,contactLinkObject.claimId)
      .build();

    //When
    const result = new LatestUpdateSectionBuilder()
      .addResponseDocumentLink(contactLinkObject.text,contactLinkObject.claimId)
      .build();
    //Then
    expect(contactLinkExpected).toEqual(result);
  });

});
