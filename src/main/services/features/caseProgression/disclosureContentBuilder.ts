import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {UploadDocumentsSectionBuilder} from 'models/caseProgression/uploadDocumentsSectionBuilder';
import {GenericForm} from 'form/models/genericForm';
import {
  FileOnlySection,
  TypeOfDocumentSection,
  UploadDocumentsUserForm,
} from 'models/caseProgression/uploadDocumentsUserForm';

const documentsForDisclosure = 'documentsForDisclosure';
const disclosureList = 'disclosureList';
const fileUpload = 'fileUpload';

const fieldNamePrefix = (index: number) => {
  const errorFieldNamePrefix = `${documentsForDisclosure}[${documentsForDisclosure}][${index}]`;
  return errorFieldNamePrefix;
}

export const buildDisclosureDocumentSection = (section: TypeOfDocumentSection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = fieldNamePrefix(index);
  const missingInputError = form?.errorFor(`${errorFieldNamePrefix}[typeOfDocument]`, documentsForDisclosure) !== undefined ? 'ERRORS.VALID_ENTER_TYPE_OF_DOCUMENT' : null;

  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.DISCLOSURE_DOCUMENTS')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.TYPE_OF_DOCUMENT', '', 'PAGES.UPLOAD_DOCUMENTS.TYPE_OF_DOCUMENT_EXAMPLE', documentsForDisclosure, 'typeOfDocument', section?.typeOfDocument, index, missingInputError)
    .addDateArray('PAGES.UPLOAD_DOCUMENTS.DOCUMENT_ISSUE_DATE', 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', documentsForDisclosure, section?.dateDay, section?.dateMonth, section?.dateYear, index)
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', documentsForDisclosure, fileUpload, index,section?.fileUpload?.fieldname, form?.errorFor(`${errorFieldNamePrefix}[${fileUpload}]`, documentsForDisclosure))
    .addRemoveSectionButton(form?.model.documentsForDisclosure?.length > 1 || false)
    .build();
};

export const buildDisclosureListSection = (section: FileOnlySection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = fieldNamePrefix(index);
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.DISCLOSURE_LIST')
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', disclosureList, fileUpload, index,section?.fileUpload?.fieldname, form?.errorFor(`${errorFieldNamePrefix}[${fileUpload}]`, disclosureList))
    .addRemoveSectionButton(form?.model.disclosureList?.length > 1 || false)
    .build();
};
