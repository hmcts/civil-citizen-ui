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
import {ApplicationState} from 'models/generalApplication/applicationSummary';
import * as utilityService from 'modules/utilityService';

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
      'documentName': fileName,
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
  },
  {
    'id': '5186dee0-3186-4397-a357-2c791d001eec',
    'value': {
      'createdBy': 'ga_ctsc_team_leader_national@justice.gov.uk National',
      'documentLink': {
        'category_id': 'applications',
        'document_url': 'http://dm-store:8080/documents/f4a248ec-ce38-47f5-969d-d4eb54b848fe',
        'document_filename': '000MC039-settlement-agreement.pdf',
        'document_binary_url': 'http://dm-store:8080/documents/f4a248ec-ce38-47f5-969d-d4eb54b848fe/binary',
      },
      'documentName': 'Translated_Request_for_information_for_application_2024-11-14 21:30:24.pdf',
      'documentType': DocumentType.REQUEST_MORE_INFORMATION,
      'createdDatetime': new Date('2024-11-14'),
    },
  }];
}

describe('View Application service', () => {

  const mockGetClaimById = jest.spyOn(utilityService, 'getClaimById');
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
      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      mockGetClaimById.mockResolvedValueOnce(claim);

      //when
      const result = getJudgeDirectionWithNotice(claim, mockedAppRequest, applicationResponse, 'en');

      //then
      expect(result[0].rows[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE');
      expect(result[0].rows[0].value.html).toEqual('1 January 2024');
      expect(result[0].rows[1].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE');
      expect(result[0].rows[1].value.html).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DIRECTION_WITH_NOTICE');
      expect(result[0].rows[2].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE');
      expect(result[0].rows[2].value.html).toContain('make-with-notice_2024-07-22 11:01:54.pdf');
    });

    it('should return judge response summary with correct status and pay fee button ' +
      'when requestForInformation isWithNotice is present and Add fee is not paid.', async () => {
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
          'createdDatetime': new Date('2024-11-13'),
        },
      },
      {
        'id': '6c755e96-086e-477a-b446-ab86b321a23c',
        'value': {
          'createdBy': 'ga_ctsc_team_leader_national@justice.gov.uk National',
          'documentLink': {
            'category_id': 'applications',
            'document_url': 'http://dm-store:8080/documents/f5043c2f-61d3-41f9-84ef-fcbd07f3bcae',
            'document_filename': 'CIV-7828 testing notes.PDF',
            'document_binary_url': 'http://dm-store:8080/documents/f5043c2f-61d3-41f9-84ef-fcbd07f3bcae/binary',
          },
          'documentName': 'Translated Court document',
          'documentType': DocumentType.SEND_APP_TO_OTHER_PARTY,
          'createdDatetime': new Date('2024-11-14'),
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
      applicationResponse.state = ApplicationState.APPLICATION_ADD_PAYMENT;
      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      mockGetClaimById.mockResolvedValueOnce(claim);
      //when
      const result = getJudgeDirectionWithNotice(claim, mockedAppRequest, applicationResponse, 'en');
      //then
      expect(result[0].rows[3].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.TITLE');
      expect(result[0].rows[3].value.html).toContain('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.ADDITIONAL_FEE_PAID');
      expect(result[1].rows.length).toEqual(3);
    });

    it('should return judge direction with notice summary translated document', async () => {
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
      },
      {
        'id': '6c755e96-086e-477a-b446-ab86b321a23c',
        'value': {
          'createdBy': 'ga_ctsc_team_leader_national@justice.gov.uk National',
          'documentLink': {
            'category_id': 'applications',
            'document_url': 'http://dm-store:8080/documents/f5043c2f-61d3-41f9-84ef-fcbd07f3bcae',
            'document_filename': 'CIV-7828 testing notes.PDF',
            'document_binary_url': 'http://dm-store:8080/documents/f5043c2f-61d3-41f9-84ef-fcbd07f3bcae/binary',
          },
          'documentName': 'Translated Court document',
          'documentType': DocumentType.SEND_APP_TO_OTHER_PARTY,
          'createdDatetime': new Date('2024-11-14'),
        },
      }];

      applicationResponse.case_data = caseData;
      applicationResponse.created_date = new Date('2024-01-01').toString();
      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      mockGetClaimById.mockResolvedValueOnce(claim);

      //when
      const result = getJudgeDirectionWithNotice(claim, mockedAppRequest, applicationResponse, 'en');

      //then
      expect(result[1].rows[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE');
      expect(result[1].rows[0].value.html).toEqual('14 November 2024');
      expect(result[1].rows[1].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE');
      expect(result[1].rows[1].value.html).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DIRECTION_WITH_NOTICE');
      expect(result[1].rows[2].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE');
      expect(result[1].rows[2].value.html).toContain('Translated Court document');
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
              documentName: fileName,
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
              createdBy: 'Civil',
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
      expect(result[0].rows[1].value.html).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.GENERAL_ORDER');
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
    it('should return hearing order response but can not upload additional doc', async () => {
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
      expect(result[0].responseButton).toBeNull();
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
      expect(result[1].rows[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE');
      expect(result[1].rows[0].value.html).toEqual('1 August 2024');
      expect(result[1].rows[1].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE');
      expect(result[1].rows[1].value.html).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.HEARING_NOTICE_DESC');
      expect(result[1].rows[2].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE');
      expect(result[1].rows[2].value.html).toContain('Application_Hearing_Notice_2024-08-02 12:15:34.pdf');
      expect(result[2].rows[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE');
      expect(result[2].rows[0].value.html).toEqual('2 May 2024');
      expect(result[2].rows[1].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE');
      expect(result[2].rows[1].value.html).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.REQUEST_MORE_INFO');
      expect(result[2].rows[2].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE');
      expect(result[2].rows[2].value.html).toContain('<a href=/case/1718105701451856/view-documents/76600af8-e6f3-4506-9540-e6039b9cc098 target="_blank" rel="noopener noreferrer" class="govuk-link">Request_for_information_for_application_2024-07-22 11:01:54.pdf</a>');
      expect(result[3].rows[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE');
      expect(result[3].rows[0].value.html).toEqual('2 March 2024');
      expect(result[3].rows[1].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE');
      expect(result[3].rows[1].value.html).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DIRECTION_WITH_NOTICE');
      expect(result[3].rows[2].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE');
      expect(result[3].rows[2].value.html).toContain('Name of file');
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
      expect(result[1].rows[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE');
      expect(result[1].rows[0].value.html).toEqual('1 August 2024');
      expect(result[1].rows[1].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE');
      expect(result[1].rows[1].value.html).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.HEARING_NOTICE_DESC');
      expect(result[1].rows[2].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE');
      expect(result[1].rows[2].value.html).toContain('Application_Hearing_Notice_2024-08-02 12:15:34.pdf');
      expect(result[2].rows[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE');
      expect(result[2].rows[0].value.html).toEqual('2 May 2024');
      expect(result[2].rows[1].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE');
      expect(result[2].rows[1].value.html).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.REQUEST_MORE_INFO');
      expect(result[2].rows[2].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE');
      expect(result[2].rows[2].value.html).toContain('<a href=/case/1718105701451856/view-documents/76600af8-e6f3-4506-9540-e6039b9cc098 target="_blank" rel="noopener noreferrer" class="govuk-link">Request_for_information_for_application_2024-07-22 11:01:54.pdf</a>');
    });
  });

  describe('getRequestMoreInfoResponse', () => {
    it('should return request more info response', async () => {
      //given
      const claim = new Claim();
      const applicationResponse = Object.assign(new ApplicationResponse(), mockApplication);
      applicationResponse.case_data.requestForInformationDocument = setMockRequestForInformationDocument();

      //when
      const result = getRequestMoreInfoResponse(claim.id, applicationResponse, 'en');
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
      const applicationResponse: ApplicationResponse = undefined;
      const claim = new Claim();
      //when
      const moreInfoResponse = getRequestMoreInfoResponse(claim.id, applicationResponse, 'en');
      const dismissalOrder = getJudgeDismiss(applicationResponse, 'en');
      const  writtenRepSequentialDocument = getWrittenRepSequentialDocument(mockedAppRequest, applicationResponse, 'en');
      const  writtenRepConcurrentDocument = getWrittenRepConcurrentDocument(mockedAppRequest, applicationResponse, 'en');
      //Then
      expect(moreInfoResponse.length).toEqual(0);
      expect(dismissalOrder.length).toEqual(0);
      expect(writtenRepSequentialDocument.length).toEqual(0);
      expect(writtenRepConcurrentDocument.length).toEqual(0);
    });

    it('should get empty data array if there is no dismissal order documents', async () => {
      //given
      const applicationResponse = Object.assign(new ApplicationResponse(), mockApplication);
      const caseData = applicationResponse.case_data;
      caseData.dismissalOrderDocument = undefined;
      caseData.requestForInformationDocument = undefined;
      caseData.writtenRepSequentialDocument = undefined;
      caseData.writtenRepConcurrentDocument = undefined;

      //When
      const moreInfoResponse = getRequestMoreInfoResponse('1', applicationResponse, 'en');
      const dismissalOrder = getJudgeDismiss(applicationResponse, 'en');
      const  writtenRepSequentialDocument = getWrittenRepSequentialDocument(mockedAppRequest, applicationResponse, 'en');
      const  writtenRepConcurrentDocument = getWrittenRepConcurrentDocument(mockedAppRequest, applicationResponse, 'en');

      //Then
      expect(moreInfoResponse.length).toEqual(0);
      expect(dismissalOrder.length).toEqual(0);
      expect(writtenRepSequentialDocument.length).toEqual(0);
      expect(writtenRepConcurrentDocument.length).toEqual(0);
    });
  });
});
