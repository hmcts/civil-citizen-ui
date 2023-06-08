import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {UploadDocumentsSectionBuilder} from 'models/caseProgression/uploadDocumentsSectionBuilder';
import {GenericForm} from 'form/models/genericForm';
import {
  DisclosureList,
  DocumentsForDisclosure,
  UploadDocumentsUserForm,
} from 'models/caseProgression/uploadDocumentsUserForm';

const documentsForDisclosureType = 'documentsForDisclosure';
const disclosureList = 'disclosureList';
const fileUpload = 'fileUpload';

export const buildDisclosureDocumentSection = (documentsForDisclosureValue: DocumentsForDisclosure = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  let missingInputError = '';
  let showRemoveButton = false;
  if(form){
    const errorFieldNamePrefix = 'documentsForDisclosure[documentsForDisclosure][' + index + ']';
    missingInputError = form.errorFor(errorFieldNamePrefix + '[typeOfDocument]', documentsForDisclosureType) !== undefined ? 'govuk-form-group--error govuk-input--error' : '';
    showRemoveButton = form.model.documentsForDisclosure.length > 1;
  }

  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.DISCLOSURE_DOCUMENTS')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.TYPE_OF_DOCUMENT', missingInputError, 'PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.TYPE_OF_DOCUMENT_EXAMPLE', documentsForDisclosureType, 'typeOfDocument', documentsForDisclosureValue?.typeOfDocument, index)
    .addDateArray('PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.DOCUMENT_ISSUE_DATE', 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', documentsForDisclosureType, documentsForDisclosureValue?.dateDay, documentsForDisclosureValue?.dateMonth, documentsForDisclosureValue?.dateYear, index)
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', documentsForDisclosureType, fileUpload, index)
    .addRemoveSectionButton(showRemoveButton)
    .build();
};

export const buildDisclosureListSection = (documentsList: DisclosureList = null, index = 0): ClaimSummarySection[] => {
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.DISCLOSURE_LIST')
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', disclosureList, fileUpload, index)
    .build();
};
