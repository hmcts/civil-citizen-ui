import {UploadDocumentsSectionBuilder} from 'models/caseProgression/uploadDocumentsSectionBuilder';
import {UploadDocumentsForm} from 'form/models/mediation/uploadDocuments/uploadDocumentsForm';
import {getReferredDocument} from '../../../../../utils/mocks/Mediation/uploadFilesMediationMocks';
import {GenericForm} from 'form/models/genericForm';
import {
  buildDocumentsReferredSection,
} from 'services/features/mediation/uploadDocuments/documentsForDocumentsReferredContentBuilder';

const invalidDateErrors:any = {
  invalidDayError : undefined,
  invalidMonthError : undefined,
  invalidYearError : undefined,
  invalidDateError : undefined,
  invalidFileError: undefined,
};
describe('Documents For Documents Referred Content Builder service For Mediation', () => {

  it('should create ClaimSummarySection with remove button (single row, hidden by CSS)', async () => {
    //given - remove button is always added; visibility when only one row is controlled by CSS
    const uploadDocumentsSectionBuilderExpected = new UploadDocumentsSectionBuilder()
      .addTitle('PAGES.MEDIATION.UPLOAD_DOCUMENTS.TITLE.DOCUMENTS_REFERRED_TO_IN_STATEMENT', null, 'govuk-!-width-three-quarters')
      .addInputArray('PAGES.MEDIATION.UPLOAD_DOCUMENTS.YOUR_NAME.DOCUMENTS_REFERRED_TO_IN_STATEMENT','','','documentsForDocumentsReferred', 'typeOfDocument', null, 0)
      .addDateArray('PAGES.MEDIATION.UPLOAD_DOCUMENTS.DATE_INPUT.DOCUMENTS_REFERRED_TO_IN_STATEMENT', invalidDateErrors, 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', 'documentsForDocumentsReferred', 'date', undefined, undefined, undefined, 0,'dateInputFields')
      .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '','documentsForDocumentsReferred', 'fileUpload', 0,undefined, undefined, undefined)
      .addRemoveSectionButton('documentsForDocumentsReferred', 0)
      .build();
    //When
    const result = buildDocumentsReferredSection();

    //Then
    expect(result).toEqual(uploadDocumentsSectionBuilderExpected);
  });

  it('should create ClaimSummarySection with remove button', async () => {
    //given
    const uploadDocumentsForm = new UploadDocumentsForm();
    uploadDocumentsForm.documentsForDocumentsReferred = getReferredDocument();
    uploadDocumentsForm.documentsForDocumentsReferred.push(getReferredDocument()[0]);

    const form = new GenericForm<UploadDocumentsForm>(uploadDocumentsForm);

    const uploadDocumentsSectionBuilderExpected = new UploadDocumentsSectionBuilder()
      .addTitle('PAGES.MEDIATION.UPLOAD_DOCUMENTS.TITLE.DOCUMENTS_REFERRED_TO_IN_STATEMENT', null, 'govuk-!-width-three-quarters')
      .addInputArray('PAGES.MEDIATION.UPLOAD_DOCUMENTS.YOUR_NAME.DOCUMENTS_REFERRED_TO_IN_STATEMENT','','','documentsForDocumentsReferred', 'typeOfDocument', null, 0)
      .addDateArray('PAGES.MEDIATION.UPLOAD_DOCUMENTS.DATE_INPUT.DOCUMENTS_REFERRED_TO_IN_STATEMENT', invalidDateErrors, 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', 'documentsForDocumentsReferred', 'date', undefined, undefined, undefined, 0,'dateInputFields')
      .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '','documentsForDocumentsReferred', 'fileUpload', 0,undefined, undefined, undefined)
      .addRemoveSectionButton('documentsForDocumentsReferred', 0)
      .build();
    //When
    const result = buildDocumentsReferredSection(undefined,0,form);

    //Then
    expect(result).toEqual(uploadDocumentsSectionBuilderExpected);
  });
});

