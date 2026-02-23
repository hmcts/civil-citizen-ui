import {buildYourStatementSection} from 'services/features/mediation/uploadDocuments/yourStatementContentBuilder';
import {UploadDocumentsSectionBuilder} from 'models/caseProgression/uploadDocumentsSectionBuilder';
import {UploadDocumentsForm} from 'form/models/mediation/uploadDocuments/uploadDocumentsForm';
import {getYourStatement} from '../../../../../utils/mocks/Mediation/uploadFilesMediationMocks';
import {GenericForm} from 'form/models/genericForm';

const invalidDateErrors:any = {
  invalidDayError : undefined,
  invalidMonthError : undefined,
  invalidYearError : undefined,
  invalidDateError : undefined,
  invalidFileError: undefined,
};
describe('Your Statement content builder service For Mediation', () => {

  it('should create ClaimSummarySection with remove button (single row, hidden by CSS)', async () => {
    //given - remove button is always added; visibility when only one row is controlled by CSS
    const uploadDocumentsSectionBuilderExpected = new UploadDocumentsSectionBuilder()
      .addTitle('PAGES.MEDIATION.UPLOAD_DOCUMENTS.TITLE.YOUR_STATEMENT', null, 'govuk-!-width-three-quarters')
      .addInputArray('PAGES.MEDIATION.UPLOAD_DOCUMENTS.YOUR_NAME.YOUR_STATEMENT','','','documentsForYourStatement', 'yourName', null, 0)
      .addDateArray('PAGES.MEDIATION.UPLOAD_DOCUMENTS.DATE_INPUT.YOUR_STATEMENT', invalidDateErrors, 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', 'documentsForYourStatement', 'date', undefined, undefined, undefined, 0,'dateInputFields')
      .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '','documentsForYourStatement', 'fileUpload', 0,undefined, undefined, undefined)
      .addRemoveSectionButton('documentsForYourStatement', 0)
      .build();
    //When
    const result = buildYourStatementSection();

    //Then
    expect(result).toEqual(uploadDocumentsSectionBuilderExpected);
  });

  it('should create ClaimSummarySection with remove button', async () => {
    //given
    const uploadDocumentsForm = new UploadDocumentsForm();
    uploadDocumentsForm.documentsForYourStatement = getYourStatement();
    uploadDocumentsForm.documentsForYourStatement.push(getYourStatement()[0]);

    const form = new GenericForm<UploadDocumentsForm>(uploadDocumentsForm);

    const uploadDocumentsSectionBuilderExpected = new UploadDocumentsSectionBuilder()
      .addTitle('PAGES.MEDIATION.UPLOAD_DOCUMENTS.TITLE.YOUR_STATEMENT', null, 'govuk-!-width-three-quarters')
      .addInputArray('PAGES.MEDIATION.UPLOAD_DOCUMENTS.YOUR_NAME.YOUR_STATEMENT','','','documentsForYourStatement', 'yourName', null, 0)
      .addDateArray('PAGES.MEDIATION.UPLOAD_DOCUMENTS.DATE_INPUT.YOUR_STATEMENT', invalidDateErrors, 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', 'documentsForYourStatement', 'date', undefined, undefined, undefined, 0,'dateInputFields')
      .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '','documentsForYourStatement', 'fileUpload', 0,undefined, undefined, undefined)
      .addRemoveSectionButton('documentsForYourStatement', 0)
      .build();
    //When
    const result = buildYourStatementSection(undefined,0,form);

    //Then
    expect(result).toEqual(uploadDocumentsSectionBuilderExpected);
  });
});

