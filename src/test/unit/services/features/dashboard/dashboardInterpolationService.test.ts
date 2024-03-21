import {replaceDashboardPlaceholders} from 'services/dashboard/dashboardInterpolationService';
import {Claim} from 'models/claim';
import {addDaysToDate} from 'common/utils/dateUtils';
import {DocumentType} from 'common/models/document/documentType';

describe('dashboardInterpolationService', () => {
  const textToReplaceDynamic = 'You have {daysLeftToRespond} days left.';
  const textToReplaceUrl = '{VIEW_CLAIM_URL}';
  const textToReplaceRedirect = '{VIEW_DOCUMENT_DRAFT}';

  it('should replace placeholders with values when found', () => {

    const claim: Claim = new Claim();
    const currentDate = new Date();
    claim.respondent1ResponseDeadline = addDaysToDate(currentDate, 28);

    const textReplacedDynamic = replaceDashboardPlaceholders(textToReplaceDynamic, claim, '123');
    const textExpectedDynamic = 'You have 28 days left.';

    const textReplacedUrl = replaceDashboardPlaceholders(textToReplaceUrl, claim, '123');
    const textExpectedUrl = '#';

    expect(textReplacedDynamic).toEqual(textExpectedDynamic);
    expect(textReplacedUrl).toEqual(textExpectedUrl);
  });

  it('should replace placeholders with redirect when notificationId is present', () => {

    const claim: Claim = new Claim();
    claim.id = '123';
    const currentDate = new Date();
    claim.respondent1ResponseDeadline = addDaysToDate(currentDate, 28);

    const textReplacedRedirect = replaceDashboardPlaceholders(textToReplaceRedirect, claim, '123','456');
    const textExpectedRedirect = '/notification/456/redirect/VIEW_DOCUMENT_DRAFT/123';

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
});
