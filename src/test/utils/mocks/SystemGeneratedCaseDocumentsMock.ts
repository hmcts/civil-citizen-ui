import {SystemGeneratedCaseDocuments} from 'models/document/systemGeneratedCaseDocuments';
import {DocumentType} from 'models/document/documentType';

export const SystemGeneratedCaseDocumentsWithSDOMock = () : SystemGeneratedCaseDocuments[] => {
  return [
    {
      id: '1',
      value: {
        createdBy: 'cui',
        documentType: DocumentType.SDO_ORDER,
        documentLink:  {
          document_url: 'url1',
          document_filename: 'filename1',
          document_binary_url: 'documents/123/binary',
        },
        documentName: 'documentName',
        createdDatetime: new Date(Date.now()),
        documentSize: 1,
      },
    },
  ];
};
