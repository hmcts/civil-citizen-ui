import {replaceDashboardPlaceholders} from 'services/dashboard/dashboardInterpolationService';
import {Claim} from 'models/claim';
import {addDaysToDate} from 'common/utils/dateUtils';
import {DocumentType} from 'common/models/document/documentType';
import {MediationAgreement} from 'models/mediation/mediationAgreement';
import {Document} from 'models/document/document';

describe('dashboardInterpolationService', () => {
  const textToReplaceDynamic = 'You have {daysLeftToRespond} days left.';
  const textToReplaceUrl = '{VIEW_CLAIM_URL}';
  const textToReplaceRedirect = '{VIEW_ORDERS_AND_NOTICES_REDIRECT}';

  it('should replace placeholders with values when found', () => {

    const claim: Claim = new Claim();
    const currentDate = new Date();
    claim.respondent1ResponseDeadline = addDaysToDate(currentDate, 28);

    const textReplacedDynamic = replaceDashboardPlaceholders(textToReplaceDynamic, claim, '123');
    const textExpectedDynamic = 'You have 28 days left.';

    const textReplacedUrl = replaceDashboardPlaceholders(textToReplaceUrl, claim, '123');
    const textExpectedUrl = '/case/123/response/claim-details';

    expect(textReplacedDynamic).toEqual(textExpectedDynamic);
    expect(textReplacedUrl).toEqual(textExpectedUrl);
  });

  it('should replace placeholders with redirect when notificationId is present', () => {

    const claim: Claim = new Claim();
    claim.id = '123';
    const currentDate = new Date();
    claim.respondent1ResponseDeadline = addDaysToDate(currentDate, 28);

    const textReplacedRedirect = replaceDashboardPlaceholders(textToReplaceRedirect, claim, '123','456');
    const textExpectedRedirect = '/notification/456/redirect/VIEW_ORDERS_AND_NOTICES/123';

    expect(textReplacedRedirect).toEqual(textExpectedRedirect);
  });

  it('should replace dynamic text with nothing when claim is empty', () => {
    const claim: Claim = new Claim();

    const textReplacedDynamic = replaceDashboardPlaceholders(textToReplaceDynamic, claim, '123');
    const textExpectedDynamic = 'You have  days left.';

    expect(textReplacedDynamic).toEqual(textExpectedDynamic);
  });

  it('should replace dynamic text with nothing when claim is undefined', () => {
    const claim: Claim = new Claim();

    const textReplacedDynamic = replaceDashboardPlaceholders(textToReplaceDynamic, claim, '123');
    const textExpectedDynamic = 'You have  days left.';

    expect(textReplacedDynamic).toEqual(textExpectedDynamic);

  });

  it('should replace placeholders with redirect url for claimant dq', () => {
    const claim: Claim = new Claim();
    claim.id = '1710172392502478';
    claim.systemGeneratedCaseDocuments = [{
      id: '123', value: {
        createdBy: 'Civil',
        documentLink: {
          document_url: 'http://dm-store:8080/documents/14fb2e52-c47d-414c-8ccd-919479f4b52c/binary',
          document_filename: 'claimant_directions_questionnaire_form_000MC094.pdf',
          document_binary_url: 'http://dm-store:8080/documents/14fb2e52-c47d-414c-8ccd-919479f4b52c/binary',
        },
        documentName: 'claimant_directions_questionnaire_form_000MC005.pdf',
        documentSize: 65663,
        documentType: DocumentType.DIRECTIONS_QUESTIONNAIRE,
        createdDatetime: new Date('2024-03-11T10:57:18'),
      },
    }];
    const textToReplaceUrl = '{VIEW_CLAIMANT_HEARING_REQS}';

    const textReplacedDynamic = replaceDashboardPlaceholders(textToReplaceUrl, claim, claim.id);
    const textExpectedDynamic = '/case/1710172392502478/view-documents/14fb2e52-c47d-414c-8ccd-919479f4b52c';

    expect(textReplacedDynamic).toEqual(textExpectedDynamic);
  });

  it('should replace placeholders with redirect url for mediation document', () => {
    const claim: Claim = new Claim();
    claim.id = '1710172392502478';
    claim.mediationAgreement = <MediationAgreement>{
      name: 'test',
      document: <Document>{
        document_url: 'http://dm-store:8080/documents/14fb2e52-c47d-414c-8ccd-919479f4b52c',
        document_filename: 'MEDIATION_AGREEMENT.pdf',
        document_binary_url: 'http://dm-store:8080/documents/14fb2e52-c47d-414c-8ccd-919479f4b52c/binary',
      },
      documentType: DocumentType.MEDIATION_AGREEMENT,
    };
    const textToReplaceUrl = '{MEDIATION_SUCCESSFUL_URL}';

    const textReplacedDynamic = replaceDashboardPlaceholders(textToReplaceUrl, claim, claim.id);
    const textExpectedDynamic = '/case/1710172392502478/view-documents/14fb2e52-c47d-414c-8ccd-919479f4b52c';

    expect(textReplacedDynamic).toEqual(textExpectedDynamic);
  });

  it('should replace placeholders with redirect url for claimant response', () => {
    const claim: Claim = new Claim();
    claim.id = '1710172392502478';
    const textToReplaceUrl = '{CLAIMANT_RESPONSE_TASK_LIST}';

    const textReplacedDynamic = replaceDashboardPlaceholders(textToReplaceUrl, claim, claim.id);
    const textExpectedDynamic = '/case/1710172392502478/claimant-response/task-list';

    expect(textReplacedDynamic).toEqual(textExpectedDynamic);
  });

  it('should replace placeholders with redirect url for settlement agreement', () => {
    const claim: Claim = new Claim();
    claim.id = '1710172392502478';
    claim.systemGeneratedCaseDocuments = [{
      id: '123', value: {
        createdBy: 'Civil',
        documentLink: {
          document_url: 'http://dm-store:8080/documents/14fb2e52-c47d-414c-8ccd-919479f4b52c/binary',
          document_filename: 'settlement_agreement_form_000MC094.pdf',
          document_binary_url: 'http://dm-store:8080/documents/14fb2e52-c47d-414c-8ccd-919479f4b52c/binary',
        },
        documentName: 'settlement_agreement_form_000MC005.pdf',
        documentSize: 65663,
        documentType: DocumentType.SETTLEMENT_AGREEMENT,
        createdDatetime: new Date('2024-03-11T10:57:18'),
      },
    }];
    const textToReplaceUrl = '{VIEW_SETTLEMENT_AGREEMENT}';

    const textReplacedDynamic = replaceDashboardPlaceholders(textToReplaceUrl, claim, claim.id);
    const textExpectedDynamic = '/case/1710172392502478/view-documents/14fb2e52-c47d-414c-8ccd-919479f4b52c';

    expect(textReplacedDynamic).toEqual(textExpectedDynamic);
  });

  it('should replace placeholders with document size for claimant dq', () => {
    const claim: Claim = new Claim();
    claim.id = '1710172392502478';
    claim.systemGeneratedCaseDocuments = [{
      id: '123', value: {
        createdBy: 'Civil',
        documentLink: {
          document_url: 'http://dm-store:8080/documents/14fb2e52-c47d-414c-8ccd-919479f4b52c/binary',
          document_filename: 'claimant_directions_questionnaire_form_000MC094.pdf',
          document_binary_url: 'http://dm-store:8080/documents/14fb2e52-c47d-414c-8ccd-919479f4b52c/binary',
        },
        documentName: 'claimant_directions_questionnaire_form_000MC005.pdf',
        documentSize: 65663,
        documentType: DocumentType.DIRECTIONS_QUESTIONNAIRE,
        createdDatetime: new Date('2024-03-11T10:57:18'),
      },
    }];
    const textToReplaceUrl = '{VIEW_CLAIMANT_HEARING_REQS_SIZE}';

    const textReplacedDynamic = replaceDashboardPlaceholders(textToReplaceUrl, claim, claim.id);
    const sizeExpected = '64 KB';

    expect(textReplacedDynamic).toEqual(sizeExpected);
  });

  it('should not replace placeholders with document size when no claimant dq', () => {
    const claim: Claim = new Claim();
    claim.id = '1710172392502478';
    claim.systemGeneratedCaseDocuments = [];
    const textToReplaceUrl = '{VIEW_CLAIMANT_HEARING_REQS_SIZE}';

    const textReplacedDynamic = replaceDashboardPlaceholders(textToReplaceUrl, claim, claim.id);
    const sizeExpected = '{VIEW_CLAIMANT_HEARING_REQS_SIZE}';

    expect(textReplacedDynamic).toEqual(sizeExpected);
  });

  it('should replace placeholders for apply help with fees', () => {
    const claim: Claim = new Claim();
    claim.id = '123';
    const textToReplaceUrl = '{APPLY_HELP_WITH_FEES_START}';

    const textReplacedDynamic = replaceDashboardPlaceholders(textToReplaceUrl, claim, claim.id, '1234');
    const sizeExpected = '/case/123/apply-help-with-fees/start';

    expect(textReplacedDynamic).toEqual(sizeExpected);
  });

  it('should replace placeholders for pay hearing fee', () => {
    const claim: Claim = new Claim();
    claim.id = '123';
    const textToReplaceUrl = '{PAY_HEARING_FEE_URL_REDIRECT}';

    const textReplacedDynamic = replaceDashboardPlaceholders(textToReplaceUrl, claim, claim.id, '1234');
    const sizeExpected = '/notification/1234/redirect/PAY_HEARING_FEE_URL/123';

    expect(textReplacedDynamic).toEqual(sizeExpected);
  });

});
