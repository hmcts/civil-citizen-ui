import {
  TypeOfDocuments,
  TypeOfMediationDocuments,
} from 'models/mediation/uploadDocuments/uploadDocuments';
import {TypeOfDocumentYourNameSection} from 'form/models/mediation/uploadDocuments/uploadDocumentsForm';
import {TypeOfDocumentSection} from 'models/caseProgression/uploadDocumentsUserForm';
import {CaseDocument} from 'models/document/caseDocument';
import {
  MediationDocumentsReferred,
  MediationMediationNonAttendanceDocs,
  MediationUploadDocumentsCCD,
} from 'models/mediation/uploadDocuments/uploadDocumentsCCD';
import {v4 as uuidv4} from 'uuid';
import {mapperMediationDocumentToCCDDocuments} from 'models/mediation/uploadDocuments/mapperCaseDocumentToCCDDocuments';
import {CivilClaimResponse} from 'models/civilClaimResponse';

export const CLAIMANT_ONE_MEDIATION_DOCS = 'ClaimantOneMediationDocs';
export const DEFENDANT_ONE_MEDIATION_DOCS = 'DefendantOneMediationDocs';

const MOCK_CASE_DOCUMENT: CaseDocument = <CaseDocument>{  createdBy: 'test',
  documentLink: {document_url: 'http://dm-store:8080/documents/757f50dc-6978-4cf8-8fa0-38e05bde2d51', document_binary_url:'http://dm-store:8080/documents/757f50dc-6978-4cf8-8fa0-38e05bde2d51/binary', document_filename:'fileName'},
  documentName: 'name',
  documentType: null,
  documentSize: 12345,
  createdDatetime: new Date()};

const TYPE_OF_DOCUMENT_YOUR_NAME_SECTION = new TypeOfDocumentYourNameSection('1','1', '2024');
TYPE_OF_DOCUMENT_YOUR_NAME_SECTION.yourName = 'John Smith';
TYPE_OF_DOCUMENT_YOUR_NAME_SECTION.caseDocument = MOCK_CASE_DOCUMENT;

const TYPE_OF_DOCUMENT = new TypeOfDocumentSection('1','1', '2024');
TYPE_OF_DOCUMENT.typeOfDocument = 'John Smith';
TYPE_OF_DOCUMENT.caseDocument = MOCK_CASE_DOCUMENT;

const TYPE_OF_DOCUMENTS = Array.of(new TypeOfDocuments(
  1,
  TypeOfMediationDocuments.YOUR_STATEMENT,
  true,
  Array.of(TYPE_OF_DOCUMENT_YOUR_NAME_SECTION),
),
new TypeOfDocuments(
  2,
  TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT,
  true,
  Array.of(TYPE_OF_DOCUMENT),
),
);

export const getReferredDocument = (): TypeOfDocumentSection[] => {
  return TYPE_OF_DOCUMENTS.find(document => document.type === TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT).uploadDocuments as TypeOfDocumentSection[];
};

export const getYourStatement = (): TypeOfDocumentYourNameSection[] => {
  return TYPE_OF_DOCUMENTS.find(document => document.type === TypeOfMediationDocuments.YOUR_STATEMENT).uploadDocuments as TypeOfDocumentYourNameSection[];
};

export const getReferredDocumentCCD = (categoryId: string) => {
  return getReferredDocument().map((newDoc : TypeOfDocumentSection) => {
    const mediationUploadDocumentsCCD = new MediationUploadDocumentsCCD();
    mediationUploadDocumentsCCD.id = uuidv4();
    mediationUploadDocumentsCCD.value = new MediationDocumentsReferred(mapperMediationDocumentToCCDDocuments(newDoc.caseDocument, categoryId), newDoc.dateInputFields.date, newDoc.typeOfDocument, new Date());
    return mediationUploadDocumentsCCD;
  });
};

export const getNonAttendanceDocumentsCCD = (categoryId: string) => {
  return getYourStatement().map((newDoc : TypeOfDocumentYourNameSection) => {
    const mediationUploadDocumentsCCD = new MediationUploadDocumentsCCD();
    mediationUploadDocumentsCCD.id = uuidv4();
    mediationUploadDocumentsCCD.value = new MediationMediationNonAttendanceDocs(mapperMediationDocumentToCCDDocuments(newDoc.caseDocument, categoryId), newDoc.yourName, newDoc.dateInputFields.date, new Date());
    return mediationUploadDocumentsCCD;
  });
};

export const getTypeOfDocuments = () => {
  return TYPE_OF_DOCUMENTS;
};

export const getTypeOfDocumentsWithYourStatement = () => {
  return Array.of(new TypeOfDocuments(
    1,
    TypeOfMediationDocuments.YOUR_STATEMENT,
    true,
    Array.of(TYPE_OF_DOCUMENT_YOUR_NAME_SECTION),
  ));
};

export const getTypeOfDocumentsWithReferredDocuments = () => {
  return Array.of(new TypeOfDocuments(
    2,
    TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT,
    true,
    Array.of(TYPE_OF_DOCUMENT),
  ),
  );
};

export const MEDIATION_DOCUMENTS_MOCK = (claimId: string): CivilClaimResponse => {
  const civilClaimResponse = new CivilClaimResponse();
  civilClaimResponse.id = claimId;
  civilClaimResponse.case_data =
      {
        'app1MediationDocumentsReferred' : getReferredDocumentCCD(CLAIMANT_ONE_MEDIATION_DOCS),
        'app1MediationNonAttendanceDocs' : getNonAttendanceDocumentsCCD(CLAIMANT_ONE_MEDIATION_DOCS),
        'res1MediationDocumentsReferred' : getReferredDocumentCCD(DEFENDANT_ONE_MEDIATION_DOCS),
        'res1MediationNonAttendanceDocs' : getNonAttendanceDocumentsCCD(DEFENDANT_ONE_MEDIATION_DOCS),
      };
  return civilClaimResponse;
};
