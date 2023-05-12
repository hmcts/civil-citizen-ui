import {LatestUpdateSectionBuilder} from 'models/LatestUpdateSectionBuilder/latestUpdateSectionBuilder';
import {ClaimSummaryType} from 'form/models/claimSummarySection';
import {CASE_DOCUMENT_DOWNLOAD_URL, CITIZEN_CONTACT_THEM_URL} from 'routes/urls';
import {DocumentUri} from 'models/document/documentType';

const text = 'text';
const variables = 'variables';
const textAfter= 'textAfter';
const claimId = '01';

describe('LatestUpdateSectionBuilder tests', ()=> {
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
    const result = new LatestUpdateSectionBuilder()
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
    const result = new LatestUpdateSectionBuilder()
      .addResponseDocumentLink(text,claimId,variables,textAfter)
      .build();

    //Then
    expect(responseDocumentLinkExpected).toEqual(result);
  });

  it('should addWarning with just text', ()=> {
    //Given
    const warningObject = ({
      type: ClaimSummaryType.WARNING,
      data: {
        text: 'text',
      },
    });
    //When
    const warningObjectExpected = new LatestUpdateSectionBuilder()
      .addWarning(warningObject.data.text)
      .build();
    //Then
    expect(warningObjectExpected).toEqual([warningObject]);
  });
});
