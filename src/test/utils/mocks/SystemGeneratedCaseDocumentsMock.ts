import {SystemGeneratedCaseDocuments} from 'models/document/systemGeneratedCaseDocuments';
import {DocumentType} from 'models/document/documentType';

export const SystemGeneratedCaseDocumentsWithSDOMock = () : SystemGeneratedCaseDocuments[] => {
  return [
    {
      id: '1',
      value: {
        createdBy: 'cui',
        documentType: DocumentType.SDO_ORDER,
        documentLink: {
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
export const SystemGeneratedCaseDocumentsWithSEALEDCLAIMMock = () : SystemGeneratedCaseDocuments[] => {
  return [
    {
      id: '1',
      value: {
        createdBy: 'cui',
        documentType: DocumentType.DEFENDANT_DEFENCE,
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
};export const SystemGeneratedCaseDocumentsWithSEALEDCLAIMAndSDOMock = () : SystemGeneratedCaseDocuments[] => {
  return [
    {
      id: '1',
      value: {
        createdBy: 'cui',
        documentType: DocumentType.SEALED_CLAIM,
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
    {
      id: '2',
      value: {
        createdBy: 'cui',
        documentType: DocumentType.SDO_ORDER,
        documentLink:  {
          document_url: 'url2',
          document_filename: 'filename2',
          document_binary_url: 'documents/123/binary',
        },
        documentName: 'documentName',
        createdDatetime: new Date(Date.now()),
        documentSize: 1,
      },
    },
    {
      id: '3',
      value: {
        createdBy: 'cui',
        documentType: DocumentType.HEARING_FORM,
        documentLink:  {
          document_url: 'url3',
          document_filename: 'filename3',
          document_binary_url: 'documents/123/binary',
        },
        documentName: 'documentName',
        createdDatetime: new Date(Date.now()),
        documentSize: 1,
      },
    },
  ];
};
