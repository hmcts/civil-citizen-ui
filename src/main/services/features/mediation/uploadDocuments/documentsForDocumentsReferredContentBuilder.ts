import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {UploadDocumentsSectionBuilder} from 'models/caseProgression/uploadDocumentsSectionBuilder';
import {GenericForm} from 'form/models/genericForm';
import {
  TypeOfDocumentSection,
} from 'models/caseProgression/uploadDocumentsUserForm';
import {UploadDocumentsForm} from 'form/models/mediation/uploadDocuments/uploadDocumentsForm';
import {TypeOfMediationDocuments} from 'models/mediation/uploadDocuments/uploadDocuments';

const documentsForDocumentsReferred = 'documentsForDocumentsReferred';
const fileUpload = 'fileUpload';
const MEDIATION_UPLOAD_DOCUMENTS_PAGE = 'PAGES.MEDIATION.UPLOAD_DOCUMENTS.';

export const buildDocumentsReferredSection = (section: TypeOfDocumentSection = null, index = 0, form: GenericForm<UploadDocumentsForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${documentsForDocumentsReferred}[${documentsForDocumentsReferred}][${index}]`;
  const invalidDateErrors = {
    invalidDayError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][dateDay]`, documentsForDocumentsReferred),
    invalidMonthError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][dateMonth]`, documentsForDocumentsReferred),
    invalidYearError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][dateYear]`, documentsForDocumentsReferred),
    invalidDateError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][date]`, documentsForDocumentsReferred),
    invalidFileError: form?.errorFor(`${errorFieldNamePrefix}[fileUpload]`, documentsForDocumentsReferred)
        || form?.errorFor(`${errorFieldNamePrefix}[fileUpload][mimetype]`, documentsForDocumentsReferred)
        || form?.errorFor(`${errorFieldNamePrefix}[fileUpload][size]`, documentsForDocumentsReferred),
  };
  return new UploadDocumentsSectionBuilder()
    .addTitle(`${MEDIATION_UPLOAD_DOCUMENTS_PAGE}TITLE.${TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT}`, null, 'govuk-!-width-three-quarters')
    .addInputArray(`${MEDIATION_UPLOAD_DOCUMENTS_PAGE}YOUR_NAME.${TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT}`, '', '', documentsForDocumentsReferred, 'typeOfDocument', section?.typeOfDocument, index, form?.errorFor(`${errorFieldNamePrefix}[typeOfDocument]`, documentsForDocumentsReferred))
    .addDateArray(`${MEDIATION_UPLOAD_DOCUMENTS_PAGE}DATE_INPUT.${TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT}`, invalidDateErrors, 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', documentsForDocumentsReferred, 'dateInputFields', 'date', section?.dateInputFields?.dateDay.toString(), section?.dateInputFields?.dateMonth.toString(), section?.dateInputFields?.dateYear.toString(), index )
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', documentsForDocumentsReferred, fileUpload, index,section?.fileUpload?.fieldname, invalidDateErrors.invalidFileError, section?.caseDocument)
    .addRemoveSectionButton(form?.model.documentsForDocumentsReferred?.length > 1 || false, documentsForDocumentsReferred, index )
    .build();
};

