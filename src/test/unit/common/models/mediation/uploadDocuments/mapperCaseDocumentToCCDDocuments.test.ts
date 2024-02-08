import {TypeOfDocumentsForm} from 'form/models/mediation/uploadDocuments/typeOfDocumentsForm';
import {
  UploadDocuments,
} from 'models/mediation/uploadDocuments/uploadDocuments';
import {mapperMediationDocumentToCCDDocuments} from 'models/mediation/uploadDocuments/mapperCaseDocumentToCCDDocuments';
import {Document} from 'models/document/document';
import {CaseDocument} from 'models/document/caseDocument';

const uploadDocuments = new UploadDocuments([]);
const typeOfDocumentsForm = new TypeOfDocumentsForm('title', 'hint');
describe('Mapper MediationDocument To CCDDocuments', () => {
  beforeEach(() => {
    typeOfDocumentsForm.typeOfDocuments = [];
    uploadDocuments.typeOfDocuments = [];
  });

  it('should Mapper to Mediation CCDDocuments', () => {
    //Given
    const mockCaseDocument: CaseDocument = <CaseDocument>{  createdBy: 'test',
      documentLink: {document_url: '', document_binary_url:'', document_filename:''},
      documentName: 'name',
      documentType: null,
      documentSize: 12345,
      createdDatetime: new Date()};
    const expected: Document = {
      category_id: 'category_id',
      document_url: '',
      document_filename: '',
      document_binary_url: '',
    } as Document;

    //When
    const result = mapperMediationDocumentToCCDDocuments(mockCaseDocument, 'category_id');
    //Then
    expect(result).toEqual(expected);
  });

});

