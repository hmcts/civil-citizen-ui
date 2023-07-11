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
const fileUpload = 'file_upload';

export const buildDisclosureDocumentSection = (section: TypeOfDocumentSection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${documentsForDisclosure}[${documentsForDisclosure}][${index}]`;

  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.DISCLOSURE_DOCUMENTS')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.TYPE_OF_DOCUMENT', '', 'PAGES.UPLOAD_DOCUMENTS.TYPE_OF_DOCUMENT_EXAMPLE', documentsForDisclosure, 'typeOfDocument', section?.typeOfDocument, index, form?.errorFor(`${errorFieldNamePrefix}[typeOfDocument]`, documentsForDisclosure))
    .addDateArray('PAGES.UPLOAD_DOCUMENTS.DOCUMENT_ISSUE_DATE', 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', documentsForDisclosure, section?.dateDay, section?.dateMonth, section?.dateYear, index)
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', documentsForDisclosure, fileUpload, index)
    .addRemoveSectionButton(form?.model.documentsForDisclosure?.length > 1 || false)
    .build();
};

export const buildDisclosureListSection = (section: FileOnlySection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.DISCLOSURE_LIST')
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', disclosureList, fileUpload, index)
    .addRemoveSectionButton(form?.model.disclosureList?.length > 1 || false)
    .build();
};
