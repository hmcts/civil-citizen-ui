import {DocumentType} from 'models/document/documentType';
import {FinalOrderDocumentCollection} from 'models/caseProgression/finalOrderDocumentCollectionType';
import {FIXED_DATE} from '../dateUtils';

export const mockUUID = '3445';

export const mockFinalOrderDocument1 = {
  id: '1177a9b6-8f66-4241-a00b-0618bfb40733',
  value: {
    createdBy: 'Civil',
    documentLink: {
      category_id: 'finalOrders',
      document_url: 'http://dm-store:8080/documents/20712d13-18c2-4779-b1f4-8b7d3e0312b9',
      document_filename: 'Order_2023-08-17.pdf',
      document_binary_url: 'http://dm-store:8080/documents/20712d13-18c2-4779-b1f4-8b7d3e0312b9/binary',
    },
    documentName: 'Order_2023-08-17.pdf',
    documentSize: 21069,
    documentType: DocumentType.JUDGE_FINAL_ORDER,
    createdDatetime: FIXED_DATE,
  },
};

export const mockFinalOrderDocument2 = {
  id: 'a4e5a43f-349b-4f03-8ee3-7350e3c7fe7b',
  value: {
    createdBy: 'Civil',
    documentLink: {
      category_id: 'finalOrders',
      document_url: 'http://dm-store:8080/documents/bc4f4ccb-2f30-4143-b1f8-b1e8dccc70e1',
      document_filename: 'Order_2023-08-18.pdf',
      document_binary_url: 'http://dm-store:8080/documents/bc4f4ccb-2f30-4143-b1f8-b1e8dccc70e1/binary',
    },
    documentName: 'Order_2023-08-18.pdf',
    documentSize: 37901,
    documentType: DocumentType.JUDGE_FINAL_ORDER,
    createdDatetime: FIXED_DATE,
  },
};

export const getFinalOrderDocumentCollectionMock = (): FinalOrderDocumentCollection => {
  return new FinalOrderDocumentCollection(mockFinalOrderDocument1.id, mockFinalOrderDocument1.value);
};
