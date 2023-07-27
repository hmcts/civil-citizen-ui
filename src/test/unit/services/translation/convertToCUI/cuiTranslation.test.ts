import {CCDClaim} from 'common/models/civilClaimResponse';
import {translateCCDCaseDataToCUIModel} from 'services/translation/convertToCUI/cuiTranslation';
import {TimeLineDocument, Document} from 'common/models/document/document';

describe('translateCCDCaseDataToCUIModel', () => {
  it('should return undefined if ccdClaim', () => {
    //Given
    const input: CCDClaim = undefined;
    //When
    const output = translateCCDCaseDataToCUIModel(input);
    //Then
    expect(output.specClaimTemplateDocumentFiles).toBe(undefined);
  });

  it('should return undefined if witness appear is undefined', () => {
    //Given
    const input: CCDClaim = {
      servedDocumentFiles: {
        timelineEventUpload: [
          <TimeLineDocument>{
            id: '6f5daf35-e492-4f89-891c-bbd948263653',
            value: <Document>{
              category_id: 'detailsOfClaim',
              document_url: 'http://dm-store-demo.service.core-compute-demo.internal/documents/74bf213e-72dd-4908-9e08-72fefaed9c5c',
              document_filename: 'timeline-event-summary.pdf',
              document_binary_url: 'http://dm-store-demo.service.core-compute-demo.internal/documents/74bf213e-72dd-4908-9e08-72fefaed9c5c/binary'
            },
          },
        ],
      },
    };
    //When
    const output = translateCCDCaseDataToCUIModel(input);
    //Then
    expect(output.specClaimTemplateDocumentFiles.category_id).toBe('detailsOfClaim');
    expect(output.specClaimTemplateDocumentFiles.document_binary_url).toBe('http://dm-store-demo.service.core-compute-demo.internal/documents/74bf213e-72dd-4908-9e08-72fefaed9c5c/binary');
    expect(output.specClaimTemplateDocumentFiles.document_filename).toBe('timeline-event-summary.pdf');
    expect(output.specClaimTemplateDocumentFiles.document_url).toBe('http://dm-store-demo.service.core-compute-demo.internal/documents/74bf213e-72dd-4908-9e08-72fefaed9c5c');

  });
});
