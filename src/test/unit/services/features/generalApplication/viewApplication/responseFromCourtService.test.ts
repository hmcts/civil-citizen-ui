import mockApplication from '../../../../../utils/mocks/applicationMock.json';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {
  getJudgeDirectionWithNotice,
  getJudgesDirectionsOrder,
  getJudgeApproveEdit,
  getJudgeDismiss,
  getHearingNoticeResponses,
  getHearingOrderResponses,
  buildResponseFromCourtSection,
  getRequestMoreInfoResponse,
  getWrittenRepSequentialDocument,
  getWrittenRepConcurrentDocument,
} from 'services/features/generalApplication/viewApplication/responseFromCourtService';
import * as requestModels from 'models/AppRequest';
import {Claim} from 'models/claim';

import {CaseRole} from 'form/models/caseRoles';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {DocumentType} from 'models/document/documentType';
import {CcdHearingDocument} from 'models/ccdGeneralApplication/ccdGeneralApplicationAddlDocument';
import {getClaimById} from 'modules/utilityService';
import { CcdGAMakeWithNoticeDocument } from 'common/models/ccdGeneralApplication/ccdGAMakeWithNoticeDocument';

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

function setMockHearingNoticeDocuments(): CcdHearingDocument[] {
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

function setMockHearingOrderDocuments(): CcdHearingDocument[] {
  return [{
    'id': '4810a582-2e16-48e9-8b64-9f96b4d12cc4',
    'value': {
      'createdBy': 'Civil',
      'documentLink': {
        'category_id': 'applications',
        'document_url': 'http://dm-store:8080/documents/136767cf-033a-4fb1-9222-48bc7decf831',
        'document_filename': 'Application_Hearing_order_2024-08-02 12:15:34.pdf',
        'document_binary_url': 'http://dm-store:8080/documents/136767cf-033a-4fb1-9222-48bc7decf831/binary',
      },
      'documentName': 'Application_Hearing_Notice_2024-08-02 12:15:34.pdf',
      'documentType': DocumentType.HEARING_ORDER,
      'createdDatetime':  new Date('2024-08-01'),
    },
  }];
}
function setMockRequestForInformationDocument(): CcdGAMakeWithNoticeDocument[] {
  const fileName = 'Name of file';
  const binary = '77121e9b-e83a-440a-9429-e7f0fe89e518';
  const binary_url = `http://dm-store:8080/documents/${binary}/binary`;
  return [{
    'id': '1',
    'value': {
      'documentLink': {
        'document_url': 'test',
        'document_binary_url': binary_url,
        'document_filename': fileName,
        'category_id': '1',
      },
      'documentType': DocumentType.SEND_APP_TO_OTHER_PARTY,
      'createdDatetime': new Date('2024-03-02'),
      'createdBy':'civils',
    },
  },
  {
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
      'createdDatetime': new Date('2024-05-02'),
    },
  }];
}

describe('View Application service', () => {

  describe('getJudgeResponseSummary', () => {
    let applicationResponse : ApplicationResponse;
    beforeEach(() => {
      applicationResponse = Object.assign(new ApplicationResponse(), mockApplication);
    });

    it('should return judge direction with notice summary', async () => {
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
          'createdDatetime' : new Date('2024-01-01'),
        },
      }];

      applicationResponse.case_data = caseData;
      applicationResponse.created_date = new Date('2024-01-01').toString();

      //when
      const result = getJudgeDirectionWithNotice(mockedAppRequest, applicationResponse, 'en');

      //then
      expect(result.rows[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE');
      expect(result.rows[0].value.html).toEqual('1 January 2024');
      expect(result.rows[1].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE');
      expect(result.rows[1].value.html).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DIRECTION_WITH_NOTICE');
      expect(result.rows[2].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE');
      expect(result.rows[2].value.html).toContain('<a href="/case/1718105701451856/view-documents/76600af8-e6f3-4506-9540-e6039b9cc098" target="_blank" rel="noopener noreferrer">make-with-notice_2024-07-22 11:01:54.pdf</a>');
      expect(result.rows[2].value.html).toContain('make-with-notice_2024-07-22 11:01:54.pdf');
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
      const result = getJudgeDirectionWithNotice(mockedAppRequest,  applicationResponse, 'en');
      //then
      expect(result.rows[3].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.TITLE');
      expect(result.rows[3].value.html).toContain('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.ADDITIONAL_FEE_PAID');
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
      const result = getJudgesDirectionsOrder(mockedAppRequest, applicationResponse, 'en');
      //then
      expect(result[0].rows[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE');
      expect(result[0].rows[0].value.html).toEqual('1 January 2024');
      expect(result[0].rows[1].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE');
      expect(result[0].rows[1].value.html).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.JUDGE_HAS_MADE_ORDER');
      expect(result[0].rows[2].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE');
      expect(result[0].rows[2].value.html).toContain('Name of file');
    });
  });

  describe('getJudgeDismiss', () => {
    it('should return judge dismiss order', async () => {
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
        dismissalOrderDocument: [
          {
            id: '1',
            value: {
              documentLink: {
                document_url: 'test',
                document_binary_url: binary_url,
                document_filename: fileName,
                category_id: '1',
              },
              documentType: DocumentType.DISMISSAL_ORDER,
              createdDatetime: new Date('2024-01-01'),
            },
          },
        ],
      };
      //when
      const result = getJudgeDismiss(applicationResponse, 'en');
      //then
      expect(result[0].rows[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE');
      expect(result[0].rows[0].value.html).toEqual('1 January 2024');
      expect(result[0].rows[1].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE');
      expect(result[0].rows[1].value.html).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.APPLICATION_DISMISSED');
      expect(result[0].rows[2].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE');
      expect(result[0].rows[2].value.html).toContain('Name of file');
    });

    it('should return empty if no data in applicationResponse', async () => {
      //given
      const applicationResponse = new ApplicationResponse();
      //when
      const result = getJudgeDismiss(applicationResponse, 'en');
      //then
      expect(result.length).toEqual(0);
    });

    it('should return empty if no data in applicationResponse caseData', async () => {
      //given
      const applicationResponse = new ApplicationResponse();
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
      };
      //when
      const result = getJudgeDismiss(applicationResponse, 'en');
      //then
      expect(result.length).toEqual(0);
    });
  });

  describe('getJudgeApproveEdit', () => {
    it('should return judge approve or edit order', async () => {
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
        generalOrderDocument: [
          {
            id: '1',
            value: {
              documentLink: {
                document_url: 'test',
                document_binary_url: binary_url,
                document_filename: fileName,
                category_id: '1',
              },
              documentType: DocumentType.GENERAL_ORDER,
              createdDatetime: new Date('2024-01-01'),
            },
          },
        ],
      };
      //when
      const result = getJudgeApproveEdit(applicationResponse, 'en');
      //then
      expect(result[0].rows[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE');
      expect(result[0].rows[0].value.html).toEqual('1 January 2024');
      expect(result[0].rows[1].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE');
      expect(result[0].rows[1].value.html).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.APPLICATION_APPROVE_EDIT');
      expect(result[0].rows[2].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE');
      expect(result[0].rows[2].value.html).toContain('Name of file');
    });

    it('should return empty if no data in applicationResponse', async () => {
      //given
      const applicationResponse = new ApplicationResponse();
      //when
      const result = getJudgeApproveEdit(applicationResponse, 'en');
      //then
      expect(result.length).toEqual(0);
    });

    it('should return empty if no data in applicationResponse caseData', async () => {
      //given
      const applicationResponse = new ApplicationResponse();
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
      };
      //when
      const result = getJudgeApproveEdit(applicationResponse, 'en');
      //then
      expect(result.length).toEqual(0);
    });
  });

  describe('getHearingNoticeResponses', () => {
    it('should return hearing notice response', async () => {
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
        hearingNoticeDocument: [
          {
            id: '1',
            value: {
              documentLink: {
                document_url: 'test',
                document_binary_url: binary_url,
                document_filename: fileName,
                category_id: '1',
              },
              documentType: DocumentType.HEARING_NOTICE,
              createdDatetime: new Date('2024-01-01'),
              createdBy:'civils',
            },
          },
        ],
      };
      //when
      const result = getHearingNoticeResponses(applicationResponse, 'en');
      //then
      expect(result[0].rows[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE');
      expect(result[0].rows[0].value.html).toEqual('1 January 2024');
      expect(result[0].rows[1].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE');
      expect(result[0].rows[1].value.html).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.HEARING_NOTICE_DESC');
      expect(result[0].rows[2].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE');
      expect(result[0].rows[2].value.html).toContain('Name of file');
    });

    it('should return empty if no data in applicationResponse', async () => {
      //given
      const applicationResponse = new ApplicationResponse();
      //when
      const result = getHearingNoticeResponses(applicationResponse, 'en');
      //then
      expect(result.length).toEqual(0);
    });

    it('should return empty if no data in applicationResponse caseData', async () => {
      //given
      const applicationResponse = new ApplicationResponse();
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
      };
      //when
      const result = getHearingNoticeResponses(applicationResponse, 'en');
      //then
      expect(result.length).toEqual(0);
    });
  });

  describe('getHearingOrderResponses', () => {
    it('should return hearing order response', async () => {
      const applicationResponse = Object.assign(new ApplicationResponse(), mockApplication);
      applicationResponse.case_data.hearingOrderDocument = setMockHearingOrderDocuments();

      //when
      const result = getHearingOrderResponses(mockedAppRequest, applicationResponse, 'en');
      //then
      expect(result[0].rows[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE');
      expect(result[0].rows[0].value.html).toEqual('1 August 2024');
      expect(result[0].rows[1].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE');
      expect(result[0].rows[1].value.html).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.HEARING_ORDER_DESC');
      expect(result[0].rows[2].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE');
      expect(result[0].rows[2].value.html).toContain('Application_Hearing_Notice_2024-08-02 12:15:34.pdf');
    });

    it('should return empty if no data in applicationResponse', async () => {
      //given
      const applicationResponse = new ApplicationResponse();
      //when
      const result = getHearingOrderResponses(mockedAppRequest, applicationResponse, 'en');
      //then
      expect(result.length).toEqual(0);
    });

    it('should return empty if no data in applicationResponse caseData', async () => {
      //given
      const applicationResponse = new ApplicationResponse();
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
      };
      //when
      const result = getHearingOrderResponses(mockedAppRequest, applicationResponse, 'en');
      //then
      expect(result.length).toEqual(0);
    });
  });

  describe('getResponseFromCourtSection', () => {
    it('should return court from response section for applicant', async () => {
      //given
      const application = Object.assign(new ApplicationResponse(), mockApplication);
      application.case_data.hearingNoticeDocument = setMockHearingNoticeDocuments();
      application.case_data.hearingOrderDocument = undefined;
      application.case_data.requestForInformationDocument = setMockRequestForInformationDocument();
      application.case_data.parentClaimantIsApplicant = YesNoUpperCamelCase.YES;

      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      (getClaimById as jest.Mock).mockResolvedValue(claim);
      //when
      const result = await buildResponseFromCourtSection(mockedAppRequest, application, 'en');

      //then
      expect(result[0].rows[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE');
      expect(result[0].rows[0].value.html).toEqual('1 August 2024');
      expect(result[0].rows[1].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE');
      expect(result[0].rows[1].value.html).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.HEARING_NOTICE_DESC');
      expect(result[0].rows[2].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE');
      expect(result[0].rows[2].value.html).toContain('Application_Hearing_Notice_2024-08-02 12:15:34.pdf');
      expect(result[1].rows[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE');
      expect(result[1].rows[0].value.html).toEqual('2 May 2024');
      expect(result[1].rows[1].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE');
      expect(result[1].rows[1].value.html).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.REQUEST_MORE_INFO');
      expect(result[1].rows[2].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE');
      expect(result[1].rows[2].value.html).toContain('<a href=/case/1718105701451856/view-documents/76600af8-e6f3-4506-9540-e6039b9cc098 target="_blank" rel="noopener noreferrer" class="govuk-link">Request_for_information_for_application_2024-07-22 11:01:54.pdf</a>');
      expect(result[2].rows[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE');
      expect(result[2].rows[0].value.html).toEqual('2 March 2024');
      expect(result[2].rows[1].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE');
      expect(result[2].rows[1].value.html).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DIRECTION_WITH_NOTICE');
      expect(result[2].rows[2].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE');
      expect(result[2].rows[2].value.html).toContain('Name of file');
    });

    it('should return court from response section for defendant', async () => {
    //given
      const application = Object.assign(new ApplicationResponse(), mockApplication);
      application.case_data.parentClaimantIsApplicant = YesNoUpperCamelCase.NO;
      application.case_data.hearingNoticeDocument = setMockHearingNoticeDocuments();
      application.case_data.hearingOrderDocument = undefined;
      application.case_data.requestForInformationDocument = setMockRequestForInformationDocument();

      const claim = new Claim();
      claim.caseRole = CaseRole.DEFENDANT;
      (getClaimById as jest.Mock).mockResolvedValue(claim);
      //when'
      const result = await buildResponseFromCourtSection(mockedAppRequest, application, 'en');
      //then
      expect(result[0].rows[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE');
      expect(result[0].rows[0].value.html).toEqual('1 August 2024');
      expect(result[0].rows[1].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE');
      expect(result[0].rows[1].value.html).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.HEARING_NOTICE_DESC');
      expect(result[0].rows[2].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE');
      expect(result[0].rows[2].value.html).toContain('Application_Hearing_Notice_2024-08-02 12:15:34.pdf');
      expect(result[1].rows[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE');
      expect(result[1].rows[0].value.html).toEqual('2 May 2024');
      expect(result[1].rows[1].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE');
      expect(result[1].rows[1].value.html).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.REQUEST_MORE_INFO');
      expect(result[1].rows[2].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE');
      expect(result[1].rows[2].value.html).toContain('<a href=/case/1718105701451856/view-documents/76600af8-e6f3-4506-9540-e6039b9cc098 target="_blank" rel="noopener noreferrer" class="govuk-link">Request_for_information_for_application_2024-07-22 11:01:54.pdf</a>');

    });
  });

  describe('getRequestMoreInfoResponse', () => {
    it('should return request more info response', async () => {
      //given
      const applicationResponse = Object.assign(new ApplicationResponse(), mockApplication);
      applicationResponse.case_data.requestForInformationDocument = setMockRequestForInformationDocument();

      //when
      const result = getRequestMoreInfoResponse(applicationResponse, 'en');
      //then
      expect(result[0].rows[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE');
      expect(result[0].rows[0].value.html).toEqual('2 May 2024');
      expect(result[0].rows[1].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE');
      expect(result[0].rows[1].value.html).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.REQUEST_MORE_INFO');
      expect(result[0].rows[2].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE');
      expect(result[0].rows[2].value.html).toContain('<a href=/case/1718105701451856/view-documents/76600af8-e6f3-4506-9540-e6039b9cc098 target="_blank" rel="noopener noreferrer" class="govuk-link">Request_for_information_for_application_2024-07-22 11:01:54.pdf</a>');
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
        const result = getWrittenRepSequentialDocument(mockedAppRequest, applicationResponse, 'en');
        //then
        expect(result[0].rows[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE');
        expect(result[0].rows[0].value.html).toEqual('1 January 2024');
        expect(result[0].rows[1].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE');
        expect(result[0].rows[1].value.html).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.REQUEST_WRITTEN_REPRESENTATION');
        expect(result[0].rows[2].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE');
        expect(result[0].rows[2].value.html).toContain('Name of file');
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
        const result = getWrittenRepConcurrentDocument(mockedAppRequest, applicationResponse, 'en');
        //then
        expect(result[0].rows[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE');
        expect(result[0].rows[0].value.html).toEqual('1 January 2024');
        expect(result[0].rows[1].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE');
        expect(result[0].rows[1].value.html).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.REQUEST_WRITTEN_REPRESENTATION');
        expect(result[0].rows[2].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE');
        expect(result[0].rows[2].value.html).toContain('Name of file');
      });
    });

    it('should return empty if no data in applicationResponse', async () => {
      //given
      const applicationResponse = new ApplicationResponse();
      //when
      const result = getRequestMoreInfoResponse(applicationResponse, 'en');
      //then
      expect(result.length).toEqual(0);
    });

  });
});
