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

export const buildDisclosureDocumentSection = (section: TypeOfDocumentSection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${documentsForDisclosure}[${documentsForDisclosure}][${index}]`;
  const invalidDateErrors = {
    invalidDayError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][dateDay]`, documentsForDisclosure),
    invalidMonthError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][dateMonth]`, documentsForDisclosure),
    invalidYearError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][dateYear]`, documentsForDisclosure),
    invalidDateError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][date]`, documentsForDisclosure),
  };
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.DISCLOSURE_DOCUMENTS', null, 'govuk-!-width-three-quarters')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.TYPE_OF_DOCUMENT', '', 'PAGES.UPLOAD_DOCUMENTS.TYPE_OF_DOCUMENT_EXAMPLE', documentsForDisclosure, 'typeOfDocument', section?.typeOfDocument, index, form?.errorFor(`${errorFieldNamePrefix}[typeOfDocument]`, documentsForDisclosure))
    .addDateArray('PAGES.UPLOAD_DOCUMENTS.DOCUMENT_ISSUE_DATE', invalidDateErrors, 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', documentsForDisclosure, 'date', section?.dateInputFields?.dateDay.toString(), section?.dateInputFields?.dateMonth.toString(), section?.dateInputFields?.dateYear.toString(), index , 'dateInputFields')
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', documentsForDisclosure, fileUpload, index,section?.fileUpload?.fieldname, form?.errorFor(`${errorFieldNamePrefix}[${fileUpload}]`, documentsForDisclosure), section?.caseDocument)
    .addRemoveSectionButton(form?.model.documentsForDisclosure?.length > 1 || false)
    .build();
};

export const buildDisclosureListSection = (section: FileOnlySection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${disclosureList}[${disclosureList}][${index}]`;
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.DISCLOSURE_LIST', {}, 'govuk-!-width-three-quarters')
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', disclosureList, fileUpload, index,section?.fileUpload?.fieldname, form?.errorFor(`${errorFieldNamePrefix}[${fileUpload}]`, disclosureList), section?.caseDocument)
    .addRemoveSectionButton(form?.model.disclosureList?.length > 1 || false)
    .build();
};
