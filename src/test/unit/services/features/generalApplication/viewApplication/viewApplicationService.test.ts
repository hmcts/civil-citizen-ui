import mockApplication from '../../../../../utils/mocks/applicationMock.json';
import {ApplicationResponse, JudicialDecisionOptions} from 'models/generalApplication/applicationResponse';
import {
  getApplicantDocuments,
  getApplicationSections,
  getCourtDocuments,
  getJudgeResponseSummary,
  getRespondentDocuments,
  getJudgesDirectionsOrder,
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
  describe('Build view application content for general application', () => {

    it('view application content test for applicant', async () => {
      const application = Object.assign(new ApplicationResponse(), mockApplication);
      jest.spyOn(GaServiceClient.prototype, 'getApplication').mockResolvedValueOnce(application);
      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      jest.spyOn(utilityService, 'getClaimById').mockResolvedValueOnce(claim);
      const result = await getApplicationSections(mockedAppRequest, '1718105701451856', 'en');

      expect(result).toHaveLength(13);
      expect(result[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.TITLE');
      expect(result[0].value.html).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.AWAITING_RESPONSE');
      expect(result[1].key.text).toEqual('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.APPLICATION_TYPE');
      expect(result[1].value.html).toEqual('PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.CHANGE_HEARING');
      expect(result[2].key.text).toEqual('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PARTIES_AGREED');
      expect(result[2].value.html).toEqual('COMMON.VARIATION.YES');
      expect(result[3].key.text).toEqual('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.INFORM_OTHER_PARTIES');
      expect(result[3].value.html).toEqual('COMMON.VARIATION.YES');
      expect(result[4].key.text).toEqual('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHAT_ORDER');
      expect(result[4].value.html).toEqual('The hearing arranged for [enter date] be moved to the first available date after [enter date], avoiding [enter dates to avoid].');
      expect(result[5].key.text).toEqual('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHY_REQUESTING');
      expect(result[5].value.html).toEqual('reasons');
      expect(result[6].key.text).toEqual('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.UPLOAD_DOCUMENTS');
      expect(result[6].value.html).toEqual('COMMON.VARIATION.NO');
      expect(result[7].key.text).toEqual('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.CHOOSE_PREFERRED_TYPE');
      expect(result[7].value.html).toEqual('PAGES.GENERAL_APPLICATION.APPLICATION_HEARING_ARRANGEMENTS.HEARING_TYPE.PERSON_AT_COURT');
      expect(result[8].key.text).toEqual('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHY_PREFER');
      expect(result[8].value.html).toEqual('sdf');
      expect(result[9].key.text).toEqual('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PREFERRED_COURT_LOCATION');
      expect(result[9].value.html).toEqual('Barnet Civil and Family Centre');
      expect(result[10].key.text).toEqual('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PREFERRED_TELEPHONE');
      expect(result[10].value.html).toEqual('01632960001');
      expect(result[11].key.text).toEqual('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PREFERRED_EMAIL');
      expect(result[11].value.html).toEqual('civilmoneyclaimsdemo@gmail.com');
      expect(result[12].key.text).toEqual('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.NEED_ADJUSTMENTS');
      expect(result[12].value.html).toEqual('<ul class="no-list-style"><li>PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.HEARING_LOOP</li></ul>');
    });

    it('view application content test for respondent', async () => {
      const application = Object.assign(new ApplicationResponse(), mockApplication);
      application.case_data.parentClaimantIsApplicant = YesNoUpperCamelCase.NO;
      application.case_data.generalAppAskForCosts = YesNoUpperCamelCase.YES;
      jest.spyOn(GaServiceClient.prototype, 'getApplication').mockResolvedValueOnce(application);

      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      jest.spyOn(utilityService, 'getClaimById').mockResolvedValueOnce(claim);
      const result = await getApplicationSections(mockedAppRequest, '1718105701451856', 'en');

      expect(result).toHaveLength(12);
      expect(result[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.RESPONDENT_VIEW_APPLICATION.APPLICATION_TYPE_AND_DESC');
      expect(result[0].value.html).toEqual('PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.CHANGE_HEARING'+'.'+'</br>'+'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_CHANGE_HEARING_DESCRIPTION');
      expect(result[1].key.text).toEqual('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PARTIES_AGREED');
      expect(result[1].value.html).toEqual('COMMON.VARIATION.YES');
      expect(result[2].key.text).toEqual('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.INFORM_OTHER_PARTIES');
      expect(result[2].value.html).toEqual('COMMON.VARIATION.YES');
      expect(result[3].key.text).toEqual('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHAT_ORDER');
      expect(result[3].value.html).toEqual('The hearing arranged for [enter date] be moved to the first available date after [enter date], avoiding [enter dates to avoid].'+'PAGES.GENERAL_APPLICATION.ORDER_FOR_COSTS');
      expect(result[4].key.text).toEqual('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHY_REQUESTING');
      expect(result[4].value.html).toEqual('reasons');
      expect(result[5].key.text).toEqual('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.UPLOAD_DOCUMENTS');
      expect(result[5].value.html).toEqual('COMMON.VARIATION.NO');
      expect(result[6].key.text).toEqual('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.CHOOSE_PREFERRED_TYPE');
      expect(result[6].value.html).toEqual('PAGES.GENERAL_APPLICATION.APPLICATION_HEARING_ARRANGEMENTS.HEARING_TYPE.PERSON_AT_COURT');
      expect(result[7].key.text).toEqual('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHY_PREFER');
      expect(result[7].value.html).toEqual('sdf');
      expect(result[8].key.text).toEqual('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PREFERRED_COURT_LOCATION');
      expect(result[8].value.html).toEqual('Barnet Civil and Family Centre');
      expect(result[9].key.text).toEqual('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PREFERRED_TELEPHONE');
      expect(result[9].value.html).toEqual('01632960001');
      expect(result[10].key.text).toEqual('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PREFERRED_EMAIL');
      expect(result[10].value.html).toEqual('civilmoneyclaimsdemo@gmail.com');
      expect(result[11].key.text).toEqual('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.NEED_ADJUSTMENTS');
      expect(result[11].value.html).toEqual('<ul class="no-list-style"><li>PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.HEARING_LOOP</li></ul>');
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
      expect(result[2].value.html).toContain('<a href="/case/1718105701451856/view-documents/76600af8-e6f3-4506-9540-e6039b9cc098">PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.COURT_DOCUMENT</a>');
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
      expect(result[2].value.html).toContain('<a href="/case/1718105701451856/view-documents/undefined">PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.COURT_DOCUMENT</a>');
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
      expect(result[2].value.html).toContain('<a href="/case/1718105701451856/view-documents/undefined">PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.COURT_DOCUMENT</a>');
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
      expect(result[2].value.html).toContain('<a href="/case/1718105701451856/view-documents/76600af8-e6f3-4506-9540-e6039b9cc098">Request_for_information_for_application_2024-07-22 11:01:54.pdf</a>');
    });
  });

  describe('Get Applicants Documents', () => {
    it('should get empty array if there is no data', async () => {
      //given
      const application = Object.assign(new ApplicationResponse(), mockApplication);
      jest.spyOn(GaServiceClient.prototype, 'getApplication').mockResolvedValueOnce(application);
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

      jest.spyOn(GaServiceClient.prototype, 'getApplication').mockResolvedValueOnce(application);
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

      jest.spyOn(GaServiceClient.prototype, 'getApplication').mockResolvedValueOnce(application);
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

      jest.spyOn(GaServiceClient.prototype, 'getApplication').mockResolvedValueOnce(application);
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
});
