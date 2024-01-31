import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {UploadDocumentsSectionBuilder} from 'models/caseProgression/uploadDocumentsSectionBuilder';
import {GenericForm} from 'form/models/genericForm';
import {
  TypeOfDocumentYourNameSection,
  UploadDocumentsForm
} from 'form/models/mediation/uploadDocuments/uploadDocumentsForm';
import {TypeOfMediationDocuments} from 'models/mediation/uploadDocuments/uploadDocuments';

const documentsForYourStatement = 'documentsForYourStatement';

const fileUpload = 'fileUpload';
const MEDIATION_UPLOAD_DOCUMENTS_PAGE = 'PAGES.MEDIATION.UPLOAD_DOCUMENTS.';

export const buildYourStatementSection = (section: TypeOfDocumentYourNameSection = null, index = 0, form: GenericForm<UploadDocumentsForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${documentsForYourStatement}[${documentsForYourStatement}][${index}]`;
  const invalidDateErrors = {
    invalidDayError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][dateDay]`, documentsForYourStatement),
    invalidMonthError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][dateMonth]`, documentsForYourStatement),
    invalidYearError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][dateYear]`, documentsForYourStatement),
    invalidDateError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][date]`, documentsForYourStatement),
    invalidFileError: form?.errorFor(`${errorFieldNamePrefix}[fileUpload]`, documentsForYourStatement)
        || form?.errorFor(`${errorFieldNamePrefix}[fileUpload][mimetype]`, documentsForYourStatement)
        || form?.errorFor(`${errorFieldNamePrefix}[fileUpload][size]`, documentsForYourStatement),
  };
  return new UploadDocumentsSectionBuilder()
    .addTitle(`${MEDIATION_UPLOAD_DOCUMENTS_PAGE}TITLE.${TypeOfMediationDocuments.YOUR_STATEMENT}`, null, 'govuk-!-width-three-quarters')
    .addInputArray(`${MEDIATION_UPLOAD_DOCUMENTS_PAGE}YOUR_NAME.${TypeOfMediationDocuments.YOUR_STATEMENT}`, '', '', documentsForYourStatement, 'yourName', section?.yourName, index, form?.errorFor(`${errorFieldNamePrefix}[typeOfDocument]`, documentsForYourStatement))
    .addDateArray(`${MEDIATION_UPLOAD_DOCUMENTS_PAGE}DATE_INPUT.${TypeOfMediationDocuments.YOUR_STATEMENT}`, invalidDateErrors, 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', documentsForYourStatement, 'dateInputFields', 'date', section?.dateInputFields?.dateDay?.toString(), section?.dateInputFields?.dateMonth?.toString(), section?.dateInputFields?.dateYear?.toString(), index )
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', documentsForYourStatement, fileUpload, index,section?.fileUpload?.fieldname, invalidDateErrors.invalidFileError, section?.caseDocument)
    .addRemoveSectionButton(form?.model.documentsForYourStatement?.length > 1 || false, documentsForYourStatement, index )
    .build();
};
