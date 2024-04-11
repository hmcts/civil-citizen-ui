import {mapperMediationAgreementToDocumentView} from 'common/mappers/documentViewMapper';
import {
  DocumentInformation,
  DocumentLinkInformation,
  DocumentsViewComponent,
} from 'form/models/documents/DocumentsViewComponent';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {CASE_DOCUMENT_VIEW_URL} from 'routes/urls';
import {documentIdExtractor} from 'common/utils/stringUtils';
import {MEDIATION_AGREEMENT_MOCK} from '../../../../utils/mocks/Mediation/mediationAgreementMock';

describe('Test of Document View Mapper', () => {

  it('should map Mediation agreement to Document View', () => {
    //Given
    const mediationAgreement = MEDIATION_AGREEMENT_MOCK();
    const expected = new DocumentsViewComponent('PAGES.VIEW_MEDIATION_SETTLEMENT_AGREEMENT_DOCUMENT.DOCUMENT_TABLE_TITLE', Array.of(
      new DocumentInformation(
        mediationAgreement.case_data.mediationAgreement.name,
        formatDateToFullDate(mediationAgreement.case_data.mediationSettlementAgreedAt, 'lang'),
        new DocumentLinkInformation(
          CASE_DOCUMENT_VIEW_URL.replace(':id', mediationAgreement.id).replace(':documentId',
            documentIdExtractor(mediationAgreement.case_data.mediationAgreement.document.document_binary_url)),
          mediationAgreement.case_data.mediationAgreement.document.document_filename))));
    //When
    const result = mapperMediationAgreementToDocumentView(
      'PAGES.VIEW_MEDIATION_SETTLEMENT_AGREEMENT_DOCUMENT.DOCUMENT_TABLE_TITLE',
      mediationAgreement.case_data.mediationAgreement,
      mediationAgreement.case_data.mediationSettlementAgreedAt,
      mediationAgreement.id,
      'en',
    );
    //Then
    expect(expected).toEqual(result);
  });

});

