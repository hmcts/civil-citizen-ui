import {LatestUpdateSectionBuilder} from 'models/LatestUpdateSectionBuilder/latestUpdateSectionBuilder';
import {ClaimSummaryType} from 'form/models/claimSummarySection';
import {CASE_DOCUMENT_DOWNLOAD_URL, CITIZEN_CONTACT_THEM_URL} from 'routes/urls';

describe('LatestUpdateSectionBuilder tests', ()=> {
  it('should add contactLink', ()=> {
    //Given
    const contactLinkExpected = ({
      type: ClaimSummaryType.LINK,
      data: {
        href: CITIZEN_CONTACT_THEM_URL.replace(':id', '1234'),
        text: 'text',
        textAfter: 'textAfter',
        variables: 'variables',
      },
    });

    //When
    const contactLinkBuilt = new LatestUpdateSectionBuilder()
      .addContactLink(contactLinkExpected.data.text,'1234',contactLinkExpected.data
        .variables,contactLinkExpected.data.textAfter)
      .build();

    //Then
    expect(contactLinkBuilt).toEqual([contactLinkExpected]);
  });

  it('should add ResponseDocumentLink', ()=> {
    //Given
    const responseDocumentLinkExpected = ({
      type: ClaimSummaryType.LINK,
      data: {
        text: 'text',
        href: CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', '1234')
          .replace(':documentId', 'documentUri'),
        textAfter: 'textAfter',
        variables: 'variables',
      },
    });

    //When
    const responseDocumentLinkBuilt = new LatestUpdateSectionBuilder()
      .addResponseDocumentLink(responseDocumentLinkExpected.data.text,'1234','documentUri', responseDocumentLinkExpected
        .data.variables,responseDocumentLinkExpected.data.textAfter)
      .build();

    //Then
    expect(responseDocumentLinkBuilt).toEqual([responseDocumentLinkExpected]);
  });

  it('should addWarning with just text', ()=> {
    //Given
    const warningExpected = ({
      type: ClaimSummaryType.WARNING,
      data: {
        text: 'text',
      },
    });

    //When
    const warningBuilt = new LatestUpdateSectionBuilder()
      .addWarning(warningExpected.data.text)
      .build();

    //Then
    expect(warningBuilt).toEqual([warningExpected]);
  });
});
