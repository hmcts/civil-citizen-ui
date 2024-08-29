import mockApplication from '../../../../../utils/mocks/applicationMock.json';
import {ApplicationResponse, JudicialDecisionOptions} from 'models/generalApplication/applicationResponse';
import {
  getApplicantDocuments,
  getApplicationSections,
  getCourtDocuments,
  getJudgeResponseSummary,
  getRespondentDocuments,
  getJudgesDirectionsOrder, getRequestWrittenRepresentations,
} from 'services/features/generalApplication/viewApplication/viewApplicationService';
import {GaServiceClient} from 'client/gaServiceClient';
import * as requestModels from 'models/AppRequest';
import {Claim} from 'models/claim';
import * as utilityService from 'modules/utilityService';
import {CaseRole} from 'form/models/caseRoles';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {DocumentType} from 'models/document/documentType';
import {
  DocumentInformation,
  DocumentLinkInformation,
  DocumentsViewComponent,
} from 'form/models/documents/DocumentsViewComponent';
import {CcdHearingDocument} from 'models/ccdGeneralApplication/ccdGeneralApplicationAddlDocument';

jest.mock('../../../../../../main/modules/i18n');
jest.mock('../../../../../../main/app/client/gaServiceClient');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));
declare const appRequest: requestModels.AppRequest;
const mockedAppRequest = requestModels as jest.Mocked<typeof appRequest>;
mockedAppRequest.params = {id:'1'};

function setMockAdditionalDocuments() {
  return [{
    'id': '7425a595-842d-45ac-b8ac-a8ef422cd69d',
    'value': {
      'createdBy': 'Applicant',
      'documentLink': {
        'category_id': 'applications',
        'document_url': 'http://dm-store:8080/documents/4feaa073-c310-4096-979d-cd5b12ebddf8',
        'document_filename': '000MC039-settlement-agreement.pdf',
        'document_binary_url': 'http://dm-store:8080/documents/4feaa073-c310-4096-979d-cd5b12ebddf8/binary',
      },
      'documentName': 'Test applicant',
      'createdDatetime':new Date('2024-08-01'),
    },
  },
  {
    'id': 'b4b50368-84dc-4c05-b9e7-7d01bd6a9119',
    'value': {
      'createdBy': 'Respondent One',
      'documentLink': {
        'category_id': 'applications',
        'document_url': 'http://dm-store:8080/documents/f0508c67-d3cf-4774-b3f3-0903f77d2664',
        'document_filename': 'CIV_13420_test_results.docx',
        'document_binary_url': 'http://dm-store:8080/documents/f0508c67-d3cf-4774-b3f3-0903f77d2664/binary',
      },
      'documentName': 'Test resp1',
      'createdDatetime':  new Date('2024-08-01'),
    },
  }];
}

function setMockHearingOrderDocuments(): CcdHearingDocument[] {
  return [{
    'id': '4810a582-2e16-48e9-8b64-9f96b4d12cc4',
    'value': {
      'createdBy': 'Civil',
      'documentLink': {
        'category_id': 'applications',
        'document_url': 'http://dm-store:8080/documents/136767cf-033a-4fb1-9222-48bc7decf831',
        'document_filename': 'Application_Hearing_Notice_2024-08-02 12:15:34.pdf',
        'document_binary_url': 'http://dm-store:8080/documents/136767cf-033a-4fb1-9222-48bc7decf831/binary',
      },
      'documentName': 'Application_Hearing_Notice_2024-08-02 12:15:34.pdf',
      'documentType': DocumentType.HEARING_NOTICE,
      'createdDatetime':  new Date('2024-08-01'),
    },
  }];
}

describe('View Application service', () => {
  const mockGetApplication = jest.spyOn(GaServiceClient.prototype, 'getApplication');
  const mockGetClaimById = jest.spyOn(utilityService, 'getClaimById');
  describe('Build view application content for general application', () => {

    it('view application content test for applicant', async () => {
      const application = Object.assign(new ApplicationResponse(), mockApplication);
      mockGetApplication.mockResolvedValueOnce(application);
      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      mockGetClaimById.mockResolvedValueOnce(claim);
      const result = await getApplicationSections(mockedAppRequest, '1718105701451856', 'en');

      expect(result).toHaveLength(12);
      expect(result.map(({key, value}) => [key.text, value.html])).toStrictEqual([
        ['PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.TITLE',
          'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.AWAITING_RESPONSE'],
        ['PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.APPLICATION_TYPE',
          'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.CHANGE_HEARING'],
        ['PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PARTIES_AGREED',
          'COMMON.VARIATION.YES'],
        ['PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHAT_ORDER',
          '<p class="govuk-body">The hearing arranged for [enter date] be moved to the first available date after [enter date], avoiding [enter dates to avoid]. <br> </p>'],
        ['PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHY_REQUESTING',
          'reasons'],
        ['PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.UPLOAD_DOCUMENTS',
          'COMMON.VARIATION.NO'],
        ['PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.CHOOSE_PREFERRED_TYPE',
          'PAGES.GENERAL_APPLICATION.APPLICATION_HEARING_ARRANGEMENTS.HEARING_TYPE.PERSON_AT_COURT'],
        ['PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHY_PREFER',
          'sdf'],
        ['PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PREFERRED_COURT_LOCATION',
          'Barnet Civil and Family Centre'],
        ['PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PREFERRED_TELEPHONE',
          '01632960001'],
        ['PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PREFERRED_EMAIL',
          'civilmoneyclaimsdemo@gmail.com'],
        ['PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.NEED_ADJUSTMENTS',
          '<ul class="no-list-style"><li>PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.HEARING_LOOP</li></ul>'],
      ]);
    });

    it('should include withNotice field when the claim has not been agreed', async () => {
      const application = Object.assign(new ApplicationResponse(), {
        ...mockApplication,
        case_data: {
          ...mockApplication.case_data,
          generalAppRespondentAgreement: { hasAgreed: YesNoUpperCamelCase.NO },
        }});
      mockGetApplication.mockResolvedValueOnce(application);
      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      mockGetClaimById.mockResolvedValueOnce(claim);
      const result = await getApplicationSections(mockedAppRequest, '1718105701451856', 'en');

      expect(result).toHaveLength(13);
      expect(result).toContainEqual({
        key: { text: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PARTIES_AGREED'},
        value: { html: 'COMMON.VARIATION.NO'},
      });
      expect(result).toContainEqual({
        key: { text: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.INFORM_OTHER_PARTIES'},
        value: { html: 'COMMON.VARIATION.YES'},
      });
    });

    it('view application content test for respondent', async () => {
      const application = Object.assign(new ApplicationResponse(), mockApplication);
      application.case_data.parentClaimantIsApplicant = YesNoUpperCamelCase.NO;
      application.case_data.generalAppAskForCosts = YesNoUpperCamelCase.YES;
      mockGetApplication.mockResolvedValueOnce(application);

      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      mockGetClaimById.mockResolvedValueOnce(claim);
      const result = await getApplicationSections(mockedAppRequest, '1718105701451856', 'en');
      expect(result).toHaveLength(11);
      expect(result.map(({key, value}) => [key.text, value.html])).toStrictEqual([
        ['PAGES.GENERAL_APPLICATION.RESPONDENT_VIEW_APPLICATION.APPLICATION_TYPE_AND_DESC',
          'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.CHANGE_HEARING.</br>PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_CHANGE_HEARING_DESCRIPTION'],
        ['PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PARTIES_AGREED',
          'COMMON.VARIATION.YES'],
        ['PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHAT_ORDER',
          '<p class="govuk-body">The hearing arranged for [enter date] be moved to the first available date after [enter date], avoiding [enter dates to avoid]. <br> PAGES.GENERAL_APPLICATION.ORDER_FOR_COSTS</p>'],
        ['PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHY_REQUESTING',
          'reasons'],
        ['PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.UPLOAD_DOCUMENTS',
          'COMMON.VARIATION.NO'],
        ['PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.CHOOSE_PREFERRED_TYPE',
          'PAGES.GENERAL_APPLICATION.APPLICATION_HEARING_ARRANGEMENTS.HEARING_TYPE.PERSON_AT_COURT'],
        ['PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHY_PREFER',
          'sdf'],
        ['PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PREFERRED_COURT_LOCATION',
          'Barnet Civil and Family Centre'],
        ['PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PREFERRED_TELEPHONE',
          '01632960001'],
        ['PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PREFERRED_EMAIL',
          'civilmoneyclaimsdemo@gmail.com'],
        ['PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.NEED_ADJUSTMENTS',
          '<ul class="no-list-style"><li>PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.HEARING_LOOP</li></ul>'],
      ]);
    });
  });

  describe('getJudgeResponseSummary', () => {
    let applicationResponse : ApplicationResponse;
    beforeEach(() => {
      applicationResponse = Object.assign(new ApplicationResponse(), mockApplication);
    });

    it('should return judge response summary', async () => {
      //given

      const caseData = applicationResponse.case_data;
      caseData.requestForInformationDocument = [{
        'id': 'ad9fd4a0-8294-414d-bcce-b66e742d809f',
        'value': {
          'createdBy': 'Civil',
          'documentLink': {
            'category_id': 'applications',
            'document_url': 'http://test/76600af8-e6f3-4506-9540-e6039b9cc098',
            'document_filename': 'make-with-notice_2024-07-22 11:01:54.pdf',
            'document_binary_url': 'http://test/76600af8-e6f3-4506-9540-e6039b9cc098/binary',
          },
          'documentName': 'make-with-notice_2024-07-22 11:01:54.pdf',
          'documentType': DocumentType.SEND_APP_TO_OTHER_PARTY,
        },
      }];

      applicationResponse.case_data = caseData;
      applicationResponse.created_date = new Date('2024-01-01').toString();

      //when
      const result = getJudgeResponseSummary(applicationResponse, 'en');

      //then
      expect(result[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE');
      expect(result[0].value.html).toEqual('1 January 2024');
      expect(result[1].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE');
      expect(result[1].value.html).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DIRECTION_WITH_NOTICE');
      expect(result[2].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE');
      expect(result[2].value.html).toContain('<a target="_blank" href="/case/1718105701451856/view-documents/76600af8-e6f3-4506-9540-e6039b9cc098">PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.COURT_DOCUMENT</a>');
      expect(result[2].value.html).toContain('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.COURT_DOCUMENT');
    });

    it('should return judge response summary with undefined link when requestForInformationDocument doesn\'t contain senp app to other party doc', async () => {
      //given
      applicationResponse.created_date = new Date('2024-01-01').toString();
      const caseData = applicationResponse.case_data;
      caseData.requestForInformationDocument = [];
      applicationResponse.case_data = caseData;
      applicationResponse.created_date = new Date('2024-01-01').toString();
      //when
      const result = getJudgeResponseSummary(applicationResponse, 'en');
      //then
      expect(result[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE');
      expect(result[0].value.html).toEqual('1 January 2024');
      expect(result[1].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE');
      expect(result[1].value.html).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DIRECTION_WITH_NOTICE');
      expect(result[2].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE');
      expect(result[2].value.html).toContain('<a target="_blank" href="/case/1718105701451856/view-documents/undefined">PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.COURT_DOCUMENT</a>');
    });

    it('should return judge response summary with undefined link when requestForInformationDocument is not present', async () => {
      //given
      applicationResponse.created_date = new Date('2024-01-01').toString();
      const caseData = applicationResponse.case_data;
      caseData.requestForInformationDocument = undefined;
      applicationResponse.case_data = caseData;
      applicationResponse.created_date = new Date('2024-01-01').toString();
      //when
      const result = getJudgeResponseSummary(applicationResponse, 'en');
      //then
      expect(result[2].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE');
      expect(result[2].value.html).toContain('<a target="_blank" href="/case/1718105701451856/view-documents/undefined">PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.COURT_DOCUMENT</a>');
    });

    it('should return judge response summary with correct status when requestForInformation isWithNotice is present', async () => {
      //given
      applicationResponse.created_date = new Date('2024-01-01').toString();
      const caseData = applicationResponse.case_data;
      caseData.requestForInformationDocument = [{
        'id': 'ad9fd4a0-8294-414d-bcce-b66e742d809f',
        'value': {
          'createdBy': 'Civil',
          'documentLink': {
            'category_id': 'applications',
            'document_url': 'http://test/76600af8-e6f3-4506-9540-e6039b9cc098',
            'document_filename': 'make-with-notice_2024-07-22 11:01:54.pdf',
            'document_binary_url': 'http://test/76600af8-e6f3-4506-9540-e6039b9cc098/binary',
          },
          'documentName': 'make-with-notice_2024-07-22 11:01:54.pdf',
          'documentType': DocumentType.SEND_APP_TO_OTHER_PARTY,
        },
      }];

      caseData.generalAppPBADetails = {
        fee: undefined,
        paymentDetails: {
          status: 'SUCCESS',
          reference: undefined,
        },
        additionalPaymentDetails: {
          status: 'SUCCESS',
          reference: undefined,
        },
        serviceRequestReference: undefined,
      };
      applicationResponse.case_data= caseData;
      applicationResponse.created_date = new Date('2024-01-01').toString();
      //when
      const result = getJudgeResponseSummary(applicationResponse, 'en');
      //then
      expect(result[3].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.TITLE');
      expect(result[3].value.html).toContain('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.ADDITIONAL_FEE_PAID');
    });

    it('should return judge response summary when response is request for more information', async () => {
      //given
      const caseData = applicationResponse.case_data;
      caseData.requestForInformationDocument = [{
        'id': 'ad9fd4a0-8294-414d-bcce-b66e742d809f',
        'value': {
          'createdBy': 'Civil',
          'documentLink': {
            'category_id': 'applications',
            'document_url': 'http://test/76600af8-e6f3-4506-9540-e6039b9cc098',
            'document_filename': 'Request_for_information_for_application_2024-07-22 11:01:54.pdf',
            'document_binary_url': 'http://test/76600af8-e6f3-4506-9540-e6039b9cc098/binary',
          },
          'documentName': 'Request_for_information_for_application_2024-07-22 11:01:54.pdf',
          'documentType': DocumentType.REQUEST_MORE_INFORMATION,
        },
      }];

      applicationResponse.created_date = new Date('2024-01-01').toString();
      applicationResponse.case_data.judicialDecision.decision = <JudicialDecisionOptions>'REQUEST_MORE_INFO';

      //when
      const result = getJudgeResponseSummary(applicationResponse, 'en');

      //then
      expect(result[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE');
      expect(result[0].value.html).toEqual('1 January 2024');
      expect(result[1].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE');
      expect(result[1].value.html).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.REQUEST_MORE_INFO');
      expect(result[2].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE');
      expect(result[2].value.html).toContain('<a target="_blank" href="/case/1718105701451856/view-documents/76600af8-e6f3-4506-9540-e6039b9cc098">Request_for_information_for_application_2024-07-22 11:01:54.pdf</a>');
    });
  });

  describe('Get Applicants Documents', () => {
    it('should get empty array if there is no data', async () => {
      //given
      const application = Object.assign(new ApplicationResponse(), mockApplication);
      mockGetApplication.mockResolvedValueOnce(application);
      //When
      const result = getApplicantDocuments(application, 'en');
      //Then
      const expectedResult = new DocumentsViewComponent('ApplicantDocuments', []);
      expect(result).toEqual(expectedResult);
    });
    it('should get data array if there is applicant documents', async () => {
      //given
      const application = Object.assign(new ApplicationResponse(), mockApplication);
      const caseData = application.case_data;
      caseData.gaAddlDoc= setMockAdditionalDocuments();

      mockGetApplication.mockResolvedValueOnce(application);
      //When
      const result = getApplicantDocuments(application, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'Test applicant',
        '1 August 2024',
        new DocumentLinkInformation('/case/1718105701451856/view-documents/4feaa073-c310-4096-979d-cd5b12ebddf8', '000MC039-settlement-agreement.pdf'),
      );
      const expectedResult = new DocumentsViewComponent('ApplicantDocuments', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });
    it('should get data array if there is Respondent documents', async () => {
      //given
      const application = Object.assign(new ApplicationResponse(), mockApplication);
      const caseData = application.case_data;
      caseData.gaAddlDoc= setMockAdditionalDocuments();

      mockGetApplication.mockResolvedValueOnce(application);
      //When
      const result = getRespondentDocuments(application, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'Test resp1',
        '1 August 2024',
        new DocumentLinkInformation('/case/1718105701451856/view-documents/f0508c67-d3cf-4774-b3f3-0903f77d2664', 'CIV_13420_test_results.docx'),
      );
      const expectedResult = new DocumentsViewComponent('RespondentDocuments', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });
    it('should get data array if there is court order documents', async () => {
      //given
      const application = Object.assign(new ApplicationResponse(), mockApplication);
      const caseData = application.case_data;
      caseData.hearingOrderDocument= setMockHearingOrderDocuments();

      mockGetApplication.mockResolvedValueOnce(application);
      //When
      const result = getCourtDocuments(application, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.HEARING_ORDER',
        '1 August 2024',
        new DocumentLinkInformation('/case/1718105701451856/view-documents/136767cf-033a-4fb1-9222-48bc7decf831', 'Application_Hearing_Notice_2024-08-02 12:15:34.pdf'),
      );
      const expectedResult = new DocumentsViewComponent('CourtDocument', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getJudgesDirectionsOrder', () => {
    it('should return judge directions order', async () => {
      //given
      const applicationResponse = new ApplicationResponse();
      const fileName = 'Name of file';
      const binary = '77121e9b-e83a-440a-9429-e7f0fe89e518';
      const binary_url = `http://dm-store:8080/documents/${binary}/binary`;
      applicationResponse.case_data = {
        applicationFeeAmountInPence: '',
        applicationTypes: '',
        gaAddlDoc: [],
        generalAppAskForCosts: undefined,
        generalAppDetailsOfOrder: '',
        generalAppEvidenceDocument: [],
        generalAppHearingDetails: undefined,
        generalAppInformOtherParty: undefined,
        generalAppPBADetails: undefined,
        generalAppReasonsOfOrder: '',
        generalAppRespondentAgreement: undefined,
        generalAppStatementOfTruth: undefined,
        generalAppType: undefined,
        judicialDecision: undefined,
        parentClaimantIsApplicant: undefined,
        judicialDecisionMakeOrder: {
          directionsResponseByDate: new Date('2024-01-01').toString(),
        },
        directionOrderDocument: [
          {
            id: '1',
            value: {
              documentLink: {
                document_url: 'test',
                document_binary_url: binary_url,
                document_filename: fileName,
                category_id: '1',
              },
              documentType: DocumentType.DIRECTION_ORDER,
              createdDatetime: new Date('2024-01-01'),
            },
          },
        ],
      };
      //when
      const result = getJudgesDirectionsOrder(applicationResponse, 'en');
      //then
      expect(result[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE');
      expect(result[0].value.html).toEqual('1 January 2024');
      expect(result[1].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE');
      expect(result[1].value.html).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.JUDGE_HAS_MADE_ORDER');
      expect(result[2].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE');
      expect(result[2].value.html).toContain('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.JUDGE_HAS_MADE_ORDER_DOCUMENT');
    });
  });

  describe('getRequestWrittenRepresentations', () => {
    it('should return judge request written representations sequential', async () => {
      //given
      const applicationResponse = new ApplicationResponse();
      const fileName = 'Name of file';
      const binary = '77121e9b-e83a-440a-9429-e7f0fe89e518';
      const binary_url = `http://dm-store:8080/documents/${binary}/binary`;
      applicationResponse.case_data = {
        applicationFeeAmountInPence: '',
        applicationTypes: '',
        gaAddlDoc: [],
        generalAppAskForCosts: undefined,
        generalAppDetailsOfOrder: '',
        generalAppEvidenceDocument: [],
        generalAppHearingDetails: undefined,
        generalAppInformOtherParty: undefined,
        generalAppPBADetails: undefined,
        generalAppReasonsOfOrder: '',
        generalAppRespondentAgreement: undefined,
        generalAppStatementOfTruth: undefined,
        generalAppType: undefined,
        judicialDecision: undefined,
        parentClaimantIsApplicant: undefined,
        judicialDecisionMakeOrder: {
          directionsResponseByDate: new Date('2024-01-01').toString(),
        },
        writtenRepSequentialDocument: [
          {
            id: '1',
            value: {
              documentLink: {
                document_url: 'test',
                document_binary_url: binary_url,
                document_filename: fileName,
                category_id: '1',
              },
              documentType: DocumentType.WRITTEN_REPRESENTATION_SEQUENTIAL,
              createdDatetime: new Date('2024-01-01'),
              createdBy: 'test',
            },
          },
        ],
      };
      //when
      const result = getRequestWrittenRepresentations(applicationResponse, 'en');
      //then
      expect(result[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE');
      expect(result[0].value.html).toEqual('1 January 2024');
      expect(result[1].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE');
      expect(result[1].value.html).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.REQUEST_WRITTEN_REPRESENTATION');
      expect(result[2].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE');
      expect(result[2].value.html).toContain('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.REQUEST_WRITTEN_REPRESENTATION_DOCUMENT');
    });

    it('should return judge request written representations concurrent', async () => {
      //given
      const applicationResponse = new ApplicationResponse();
      const fileName = 'Name of file';
      const binary = '77121e9b-e83a-440a-9429-e7f0fe89e518';
      const binary_url = `http://dm-store:8080/documents/${binary}/binary`;
      applicationResponse.case_data = {
        applicationFeeAmountInPence: '',
        applicationTypes: '',
        gaAddlDoc: [],
        generalAppAskForCosts: undefined,
        generalAppDetailsOfOrder: '',
        generalAppEvidenceDocument: [],
        generalAppHearingDetails: undefined,
        generalAppInformOtherParty: undefined,
        generalAppPBADetails: undefined,
        generalAppReasonsOfOrder: '',
        generalAppRespondentAgreement: undefined,
        generalAppStatementOfTruth: undefined,
        generalAppType: undefined,
        judicialDecision: undefined,
        parentClaimantIsApplicant: undefined,
        judicialDecisionMakeOrder: {
          directionsResponseByDate: new Date('2024-01-01').toString(),
        },
        writtenRepConcurrentDocument: [
          {
            id: '1',
            value: {
              documentLink: {
                document_url: 'test',
                document_binary_url: binary_url,
                document_filename: fileName,
                category_id: '1',
              },
              documentType: DocumentType.WRITTEN_REPRESENTATION_CONCURRENT,
              createdDatetime: new Date('2024-01-01'),
              createdBy: 'test',
            },
          },
        ],
      };
      //when
      const result = getRequestWrittenRepresentations(applicationResponse, 'en');
      //then
      expect(result[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE');
      expect(result[0].value.html).toEqual('1 January 2024');
      expect(result[1].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE');
      expect(result[1].value.html).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.REQUEST_WRITTEN_REPRESENTATION');
      expect(result[2].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE');
      expect(result[2].value.html).toContain('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.REQUEST_WRITTEN_REPRESENTATION_DOCUMENT');
    });
  });
});
