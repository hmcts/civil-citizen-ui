import mockApplication from '../../../../../utils/mocks/applicationMock.json';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {
  getApplicantDocuments,
  getApplicationSections,
  getCourtDocuments, getDismissalOrder, getDraftDocument, getGeneralOrder, getHearingNotice, getHearingOrder,
  getRespondentDocuments,
  getResponseFromCourtSection, getResponseSummaryCardSections,
  getStatusRow,
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
import {
  CcdGaDraftDocument,
  CcdGeneralOrderDocument,
  CcdHearingDocument, CcdHearingNoticeDocument,
} from 'models/ccdGeneralApplication/ccdGeneralApplicationAddlDocument';
import {getClaimById} from 'modules/utilityService';
import { CcdGAMakeWithNoticeDocument } from 'common/models/ccdGeneralApplication/ccdGAMakeWithNoticeDocument';
import {CcdGeneralApplicationHearingDetails} from 'models/ccdGeneralApplication/ccdGeneralApplicationHearingDetails';
import {ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {
  CcdGeneralApplicationDirectionsOrderDocument,
} from 'models/ccdGeneralApplication/ccdGeneralApplicationDirectionsOrderDocument';
import {ApplicationState} from 'models/generalApplication/applicationSummary';

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
      'documentName': 'Supporting evidence',
      'createdDatetime':new Date('2024-08-01T10:57:18'),
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
      'createdDatetime':  new Date('2024-08-01T10:57:18'),
    },
  }];
}

function setMockGaDraftDocuments(): CcdGaDraftDocument[] {
  return [{
    'id': '8e052cdd-0c56-452d-83ef-c5f60c5c6bd7',
    'value': {
      'createdBy': 'Civil',
      'documentLink': {
        'category_id': 'applications',
        'document_url': 'http://dm-store:8080/documents/4c09a875-e128-4717-94a4-96baea954a1d',
        'document_filename': 'Draft_application_2024-08-01 14:47:03.pdf',
        'document_binary_url': 'http://dm-store:8080/documents/4c09a875-e128-4717-94a4-96baea954a1d/binary',
      },
      'documentName': 'Draft_application_2024-08-01 14:47:03.pdf',
      'documentType': DocumentType.GENERAL_APPLICATION_DRAFT,
      'createdDatetime':  new Date('2024-08-01T10:57:18'),
    },
  },
  {
    'id': '2491009e-8b8d-48ff-8f02-36bd28711997',
    'value': {
      'createdBy': 'ga_ctsc_team_leader_national@justice.gov.uk National',
      'documentLink': {
        'category_id': 'applications',
        'document_url': 'http://dm-store:8080/documents/dee4cf43-0299-4a60-a1e9-26b3e8b09413',
        'document_filename': 'draft_claim_form_000MC003.pdf',
        'document_binary_url': 'http://dm-store:8080/documents/dee4cf43-0299-4a60-a1e9-26b3e8b09413/binary',
      },
      'documentName': 'Translated_draft_application_2024-11-15 15:38:26.pdf',
      'documentType':  DocumentType.GENERAL_APPLICATION_DRAFT,
      'createdDatetime': new Date('2024-11-14T16:57:18'),
    },
  }];
}

function setMockHearingNoticeDocuments(): CcdHearingNoticeDocument[] {
  return [{
    'id': '4810a582-2e16-48e9-8b64-9f96b4d12df4',
    'value': {
      'createdBy': 'Civil',
      'documentLink': {
        'category_id': 'applications',
        'document_url': 'http://dm-store:8080/documents/136767cf-033a-4fb1-9222-48bc7decf841',
        'document_filename': 'Application_Hearing_Notice_2024-08-01 12:15:34.pdf',
        'document_binary_url': 'http://dm-store:8080/documents/136767cf-033a-4fb1-9222-48bc7decf841/binary',
      },
      'documentName': 'Application_Hearing_Notice_2024-08-01 12:15:34.pdf',
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
        'document_url': 'http://dm-store:8080/documents/136767cf-033a-4fb1-9222-48bc7decf871',
        'document_filename': 'Application_Hearing_order_2024-08-01 12:15:34.pdf',
        'document_binary_url': 'http://dm-store:8080/documents/136767cf-033a-4fb1-9222-48bc7decf871/binary',
      },
      'documentName': 'Application_Hearing_order_2024-08-01 12:15:34.pdf',
      'documentType': DocumentType.HEARING_ORDER,
      'createdDatetime':  new Date('2024-08-01'),
    },
  }];
}

function setMockGeneralOrderDocuments(): CcdGeneralOrderDocument[] {
  return [{
    'id': '4810a582-2e16-48e9-8b64-9f96b4d12cd4',
    'value': {
      'createdBy': 'Civil',
      'documentLink': {
        'category_id': 'applications',
        'document_url': 'http://dm-store:8080/documents/136767cf-033a-4fb1-9222-48bc7decf861',
        'document_filename': 'General_order_for_application_2024-08-01 11:59:58.pdf',
        'document_binary_url': 'http://dm-store:8080/documents/136767cf-033a-4fb1-9222-48bc7decf861/binary',
      },
      'documentName': 'General_order_for_application_2024-08-01 11:59:58.pdf',
      'documentType': DocumentType.GENERAL_ORDER,
      'createdDatetime': new Date('2024-08-01'),
    },
  },
  {
    'id': 'b4b50368-84dc-4c05-b9e7-7d01bd6a9119',
    'value': {
      'createdBy': 'Civil',
      'documentLink': {
        'category_id': 'applications',
        'document_url': 'http://dm-store:8080/documents/b4b50368-84dc-4c05-b9e7-7d01bd6a9119',
        'document_filename': 'General_order_for_application_2024-08-02 11:59:58.pdf',
        'document_binary_url': 'http://dm-store:8080/documents/b4b50368-84dc-4c05-b9e7-7d01bd6a9119/binary',
      },
      'documentName': 'General_order_for_application_2024-08-02 11:59:58.pdf',
      'documentType': DocumentType.GENERAL_ORDER,
      'createdDatetime':  new Date('2024-08-02'),
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
  }];
}

function setMockDismissalOrderDocuments(): CcdGeneralApplicationDirectionsOrderDocument[] {
  return [{
    'id': '609912c3-68c1-4996-801d-830fe7db5c6f',
    'value': {
      'documentLink': {
        'category_id': 'ordersMadeOnApplications',
        'document_url': 'http://dm-store-aat.service.core-compute-aat.internal/documents/3d39afa3-653f-456f-900e-1c5ed0f8dd5a',
        'document_filename': 'Dismissal_order_for_application_2024-11-12 16:25:48.pdf',
        'document_binary_url': 'http://dm-store-aat.service.core-compute-aat.internal/documents/3d39afa3-653f-456f-900e-1c5ed0f8dd5a/binary',
      },
      'documentName': 'Dismissal_order_for_application_2024-11-12 16:25:48.pdf',
      'documentType': DocumentType.DISMISSAL_ORDER,
      'createdDatetime': new Date('2024-11-12T14:15:19'),
    },
  }, {
    'id': '3229bc9d-cb76-4954-a257-4dcf442c0b98',
    'value': {
      //'createdBy': 'ga_ctsc_team_leader_national@justice.gov.uk National',
      'documentLink': {
        'category_id': 'applications',
        'document_url': 'http://dm-store:8080/documents/82941661-c59b-437f-8b13-c680c81839c7',
        'document_filename': '000MC039-settlement-agreement.pdf',
        'document_binary_url': 'http://dm-store:8080/documents/82941661-c59b-437f-8b13-c680c81839c7/binary',
      },
      'documentName': 'Translated_Dismissal_order_for_application_2024-11-15 12:05:40.pdf',
      //'documentSize': 0,
      'documentType': 'DISMISSAL_ORDER',
      'createdDatetime': new Date('2024-11-15T12:05:40.1976336'),
    },
  }];
}

describe('View Application service', () => {
  const mockGetApplication = jest.spyOn(GaServiceClient.prototype, 'getApplication');
  const mockGetClaimById = jest.spyOn(utilityService, 'getClaimById');
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('Build view application content for general application for different case states', () => {

    it('view application content test for applicant - Awaiting judicial decision', async () => {
      const application = Object.assign(new ApplicationResponse(), mockApplication);
      application.state = ApplicationState.AWAITING_RESPONDENT_RESPONSE;
      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      mockGetClaimById.mockResolvedValueOnce(claim);
      const result = (await getApplicationSections(mockedAppRequest, application, 'en')).summaryRows;
      expect(result[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.TITLE');
      expect(result[0].value.html).toContain('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.AWAITING_RESPONSE');
    });

    it('view application content test for applicant - Awaiting judicial decision', async () => {
      const application = Object.assign(new ApplicationResponse(), mockApplication);
      application.state = ApplicationState.APPLICATION_SUBMITTED_AWAITING_JUDICIAL_DECISION;
      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      mockGetClaimById.mockResolvedValueOnce(claim);
      const result = (await getApplicationSections(mockedAppRequest, application, 'en')).summaryRows;
      expect(result[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.TITLE');
      expect(result[0].value.html).toContain('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.AWAITING_JUDICIAL_DECISION');
    });

    it('view application content test for applicant - Listed for hearing', async () => {
      const application = Object.assign(new ApplicationResponse(), mockApplication);
      application.state = ApplicationState.LISTING_FOR_A_HEARING;
      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      mockGetClaimById.mockResolvedValueOnce(claim);
      const result = (await getApplicationSections(mockedAppRequest, application, 'en')).summaryRows;
      expect(result[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.TITLE');
      expect(result[0].value.html).toContain('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.LISTED_FOR_HEARING');
    });

    it('view application content test for applicant - Hearing Scheduled', async () => {
      const application = Object.assign(new ApplicationResponse(), mockApplication);
      application.state = ApplicationState.HEARING_SCHEDULED;
      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      mockGetClaimById.mockResolvedValueOnce(claim);
      const result = (await getApplicationSections(mockedAppRequest, application, 'en')).summaryRows;

      expect(result[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.TITLE');
      expect(result[0].value.html).toContain('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.HEARING_SCHEDULED');
    });

    it('view application content test for applicant - Awaiting Written rep', async () => {
      const application = Object.assign(new ApplicationResponse(), mockApplication);
      application.state = ApplicationState.AWAITING_WRITTEN_REPRESENTATIONS;
      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      mockGetClaimById.mockResolvedValueOnce(claim);
      const result = (await getApplicationSections(mockedAppRequest, application, 'en')).summaryRows;

      expect(result[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.TITLE');
      expect(result[0].value.html).toContain('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.AWAITING_WRITTEN_REP');
    });

    it('view application content test for applicant - Awaiting additional info', async () => {
      const application = Object.assign(new ApplicationResponse(), mockApplication);
      application.state = ApplicationState.AWAITING_ADDITIONAL_INFORMATION;
      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      mockGetClaimById.mockResolvedValueOnce(claim);
      const result = (await getApplicationSections(mockedAppRequest, application, 'en')).summaryRows;

      expect(result[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.TITLE');
      expect(result[0].value.html).toContain('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.AWAITING_ADDL_INFO');
    });

    it('view application content test for applicant - Awaiting Direction order Docs', async () => {
      const application = Object.assign(new ApplicationResponse(), mockApplication);
      application.state = ApplicationState.AWAITING_DIRECTIONS_ORDER_DOCS;
      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      mockGetClaimById.mockResolvedValueOnce(claim);
      const result = (await getApplicationSections(mockedAppRequest, application, 'en')).summaryRows;

      expect(result[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.TITLE');
      expect(result[0].value.html).toContain('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.AWAITING_DIRECTION_DOCS');
    });

    it('view application content test for applicant - Order Made', async () => {
      const application = Object.assign(new ApplicationResponse(), mockApplication);
      application.state = ApplicationState.ORDER_MADE;
      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      mockGetClaimById.mockResolvedValueOnce(claim);
      const result = (await getApplicationSections(mockedAppRequest, application, 'en')).summaryRows;

      expect(result[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.TITLE');
      expect(result[0].value.html).toContain('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.ORDER_MADE');
    });

    it('view application content test for applicant - Application Dismissed', async () => {
      const application = Object.assign(new ApplicationResponse(), mockApplication);
      application.state = ApplicationState.APPLICATION_DISMISSED;
      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      mockGetClaimById.mockResolvedValueOnce(claim);
      const result = (await getApplicationSections(mockedAppRequest, application, 'en')).summaryRows;

      expect(result[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.TITLE');
      expect(result[0].value.html).toContain('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.APPLICATION_DISMISSED');
    });

    it('view application content test for applicant - Application Closed', async () => {
      const application = Object.assign(new ApplicationResponse(), mockApplication);
      application.state = ApplicationState.APPLICATION_CLOSED;
      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      mockGetClaimById.mockResolvedValueOnce(claim);
      const result = (await getApplicationSections(mockedAppRequest, application, 'en')).summaryRows;
      expect(result[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.TITLE');
      expect(result[0].value.html).toContain('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.APPLICATION_CLOSED');
    });

    it('view application content test for applicant - Proceeds in Heritage', async () => {
      const application = Object.assign(new ApplicationResponse(), mockApplication);
      application.state = ApplicationState.PROCEEDS_IN_HERITAGE;
      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      mockGetClaimById.mockResolvedValueOnce(claim);
      const result = (await getApplicationSections(mockedAppRequest, application, 'en')).summaryRows;
      expect(result[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.TITLE');
      expect(result[0].value.html).toContain('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.PROCEEDS_IN_HERITAGE');
    });

    it('view application content test for applicant - Awaiting additional payment', async () => {
      const application = Object.assign(new ApplicationResponse(), mockApplication);
      application.state = ApplicationState.APPLICATION_ADD_PAYMENT;
      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      mockGetClaimById.mockResolvedValueOnce(claim);
      const result = (await getApplicationSections(mockedAppRequest, application, 'en')).summaryRows;
      expect(result[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.TITLE');
      expect(result[0].value.html).toContain('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.AWAITING_ADDL_PAYMENT');
    });
  });

  describe('Build view application content for general application', () => {

    it('view application content test for applicant', async () => {
      const application = Object.assign(new ApplicationResponse(), mockApplication);
      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      mockGetClaimById.mockResolvedValueOnce(claim);
      const result = (await getApplicationSections(mockedAppRequest, application, 'en')).summaryRows;

      expect(result).toHaveLength(14);
      expect(result.map(({key, value}) => [key.text, value.html])).toStrictEqual([
        ['PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.TITLE',
          'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.AWAITING_APP_PAYMENT'],
        ['PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.APPLICATION_TYPE',
          'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.CHANGE_HEARING'],
        ['PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.ADD_ANOTHER_APPLICATION',
          'COMMON.VARIATION_2.NO'],
        ['PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PARTIES_AGREED',
          'COMMON.VARIATION_5.YES'],
        ['PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHAT_ORDER',
          '<p class="govuk-body">The hearing arranged for [enter date] be moved to the first available date after [enter date], avoiding [enter dates to avoid]. <br> </p>'],
        ['PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHY_REQUESTING',
          'reasons'],
        ['PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.CHOOSE_PREFERRED_TYPE',
          'PAGES.GENERAL_APPLICATION.APPLICATION_HEARING_ARRANGEMENTS.HEARING_TYPE_VIEW_APPLICATION.PERSON_AT_COURT'],
        ['PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHY_PREFER',
          'sdf'],
        ['PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PREFERRED_COURT_LOCATION',
          'Barnet Civil and Family Centre'],
        ['PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PREFERRED_TELEPHONE',
          '01632960001'],
        ['PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PREFERRED_EMAIL',
          'civilmoneyclaimsdemo@gmail.com'],
        [
          'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.DATES_CANNOT_ATTEND',
          'COMMON.NO',
        ],
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
      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      mockGetClaimById.mockResolvedValueOnce(claim);
      const result = (await getApplicationSections(mockedAppRequest, application, 'en')).summaryRows;

      expect(result).toHaveLength(15);
      expect(result).toContainEqual({
        key: { text: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PARTIES_AGREED'},
        value: { html: 'COMMON.VARIATION_5.NO'},
      });
      expect(result).toContainEqual({
        key: { text: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.INFORM_OTHER_PARTIES'},
        value: { html: 'COMMON.VARIATION_2.YES'},
      });
    });

    it('should include withoutNotice field when the claim has not been agreed', async () => {
      const application = Object.assign(new ApplicationResponse(), {
        ...mockApplication,
        case_data: {
          ...mockApplication.case_data,
          generalAppRespondentAgreement: { hasAgreed: YesNoUpperCamelCase.NO },
          generalAppInformOtherParty: { isWithNotice: YesNoUpperCamelCase.NO, reasonsForWithoutNotice: 'test'},
        }});
      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      mockGetClaimById.mockResolvedValueOnce(claim);
      const result = (await getApplicationSections(mockedAppRequest, application, 'en')).summaryRows;
      
      expect(result).toHaveLength(16);
      expect(result).toContainEqual({
        key: { text: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PARTIES_AGREED'},
        value: { html: 'COMMON.VARIATION_5.NO'},
      });
      expect(result).toContainEqual({
        key: { text: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.INFORM_OTHER_PARTIES'},
        value: { html: 'COMMON.VARIATION_2.NO'},
      });
      expect(result).toContainEqual({
        key: { text: 'PAGES.GENERAL_APPLICATION.INFORM_OTHER_PARTIES.WHY_DO_NOT_WANT_COURT'},
        value: { html: 'test'},
      });
    });

    it('view application content test for respondent', async () => {
      const application = Object.assign(new ApplicationResponse(), mockApplication);
      application.case_data.parentClaimantIsApplicant = YesNoUpperCamelCase.NO;
      application.case_data.generalAppAskForCosts = YesNoUpperCamelCase.YES;

      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      mockGetClaimById.mockResolvedValueOnce(claim);
      const result = (await getApplicationSections(mockedAppRequest, application, 'en')).summaryRows;

      expect(result).toHaveLength(13);
      expect(result.map(({key, value}) => [key.text, value.html])).toStrictEqual([
        ['PAGES.GENERAL_APPLICATION.RESPONDENT_VIEW_APPLICATION.APPLICATION_TYPE_AND_DESC',
          'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.CHANGE_HEARING.</br>PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_CHANGE_HEARING_DESCRIPTION'],
        ['PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.ADD_ANOTHER_APPLICATION',
          'COMMON.VARIATION_2.NO'],
        ['PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PARTIES_AGREED',
          'COMMON.VARIATION_5.YES'],
        ['PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHAT_ORDER',
          '<p class="govuk-body">The hearing arranged for [enter date] be moved to the first available date after [enter date], avoiding [enter dates to avoid]. <br> PAGES.GENERAL_APPLICATION.ORDER_FOR_COSTS</p>'],
        ['PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHY_REQUESTING',
          'reasons'],
        ['PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.CHOOSE_PREFERRED_TYPE',
          'PAGES.GENERAL_APPLICATION.APPLICATION_HEARING_ARRANGEMENTS.HEARING_TYPE_VIEW_APPLICATION.PERSON_AT_COURT'],
        ['PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHY_PREFER',
          'sdf'],
        ['PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PREFERRED_COURT_LOCATION',
          'Barnet Civil and Family Centre'],
        ['PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PREFERRED_TELEPHONE',
          '01632960001'],
        ['PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PREFERRED_EMAIL',
          'civilmoneyclaimsdemo@gmail.com'],
        [
          'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.DATES_CANNOT_ATTEND',
          'COMMON.NO',
        ],
        ['PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.NEED_ADJUSTMENTS',
          '<ul class="no-list-style"><li>PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.HEARING_LOOP</li></ul>'],
      ]);
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
      caseData.gaDraftDocument = setMockGaDraftDocuments();

      mockGetApplication.mockResolvedValueOnce(application);
      //When
      const result = getApplicantDocuments(application, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DOCUMENT_TYPES.SUPPORTING_EVIDENCE',
        '1 August 2024',
        new DocumentLinkInformation('/case/1718105701451856/view-documents/4feaa073-c310-4096-979d-cd5b12ebddf8', '000MC039-settlement-agreement.pdf'),
      );
      const expectedDraftDocument1 = new DocumentInformation(
        'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.APPLICATION_DRAFT_DOCUMENT',
        '14 November 2024',
        new DocumentLinkInformation('/case/1718105701451856/view-documents/dee4cf43-0299-4a60-a1e9-26b3e8b09413', 'Translated_draft_application_2024-11-15 15:38:26.pdf'),
      );
      const expectedDraftDocument2 = new DocumentInformation(
        'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.APPLICATION_DRAFT_DOCUMENT',
        '1 August 2024',
        new DocumentLinkInformation('/case/1718105701451856/view-documents/4c09a875-e128-4717-94a4-96baea954a1d', 'Draft_application_2024-08-01 14:47:03.pdf'),
      );
      const expectedResult = new DocumentsViewComponent('ApplicantDocuments', [expectedDraftDocument1, expectedDraftDocument2, expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array if there is applicant documents with no draft', async () => {
      //given

      const application = Object.assign(new ApplicationResponse(), mockApplication);
      const caseData = application.case_data;
      caseData.gaDraftDocument= null;

      jest.spyOn(GaServiceClient.prototype, 'getApplication').mockResolvedValueOnce(application);
      //When
      const result = getDraftDocument(application, 'en');
      //Then
      expect(result.length).toEqual(0);
    });

    it('should get empty data array if there is no casedata for draft', async () => {
      //given
      const application = Object.assign(new ApplicationResponse(), mockApplication);
      application.case_data = null;

      jest.spyOn(GaServiceClient.prototype, 'getApplication').mockResolvedValueOnce(application);
      //When
      const result = getDraftDocument(application, 'en');
      //Then
      expect(result.length).toEqual(0);
    });

    it('should get data array if there is only addl Respondent documents', async () => {
      //given
      const application = Object.assign(new ApplicationResponse(), mockApplication);
      const caseData = application.case_data;
      caseData.gaAddlDoc= setMockAdditionalDocuments();
      caseData.gaDraftDocument = setMockGaDraftDocuments();

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

    it('should get data array if there is draft and addl Respondent documents', async () => {
      //given
      const application = Object.assign(new ApplicationResponse(), mockApplication);
      const respondentResponse = [{
        value: {
          generalAppRespondent1Representative: YesNoUpperCamelCase.NO,
          gaHearingDetails: {} as CcdGeneralApplicationHearingDetails,
          gaRespondentDetails: 'abc',
          gaRespondentResponseReason: 'test',
        },
      }];
      const caseData = application.case_data;
      caseData.gaAddlDoc= setMockAdditionalDocuments();
      caseData.gaDraftDocument = setMockGaDraftDocuments();
      caseData.respondentsResponses = respondentResponse;

      mockGetApplication.mockResolvedValueOnce(application);
      //When
      const result = getRespondentDocuments(application, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'Test resp1',
        '1 August 2024',
        new DocumentLinkInformation('/case/1718105701451856/view-documents/f0508c67-d3cf-4774-b3f3-0903f77d2664', 'CIV_13420_test_results.docx'),
      );
      const expectedDraftDocument1 = new DocumentInformation(
        'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.APPLICATION_DRAFT_DOCUMENT',
        '14 November 2024',
        new DocumentLinkInformation('/case/1718105701451856/view-documents/dee4cf43-0299-4a60-a1e9-26b3e8b09413', 'Translated_draft_application_2024-11-15 15:38:26.pdf'),
      );
      const expectedDraftDocument2 = new DocumentInformation(
        'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.APPLICATION_DRAFT_DOCUMENT',
        '1 August 2024',
        new DocumentLinkInformation('/case/1718105701451856/view-documents/4c09a875-e128-4717-94a4-96baea954a1d', 'Draft_application_2024-08-01 14:47:03.pdf'),
      );

      const expectedResult = new DocumentsViewComponent('RespondentDocuments', [expectedDraftDocument1, expectedDraftDocument2, expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array if there is general order documents', async () => {
      //given
      const application = Object.assign(new ApplicationResponse(), mockApplication);
      const caseData = application.case_data;
      caseData.generalOrderDocument= setMockGeneralOrderDocuments();

      jest.spyOn(GaServiceClient.prototype, 'getApplication').mockResolvedValueOnce(application);
      //When
      const result = getCourtDocuments(application, 'en');
      //Then
      const expectedDocument1 = new DocumentInformation(
        'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.GENERAL_ORDER',
        '1 August 2024',
        new DocumentLinkInformation('/case/1718105701451856/view-documents/136767cf-033a-4fb1-9222-48bc7decf861', 'General_order_for_application_2024-08-01 11:59:58.pdf'),
      );

      const expectedDocument2 = new DocumentInformation(
        'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.GENERAL_ORDER',
        '2 August 2024',
        new DocumentLinkInformation('/case/1718105701451856/view-documents/b4b50368-84dc-4c05-b9e7-7d01bd6a9119', 'General_order_for_application_2024-08-02 11:59:58.pdf'),
      );
      expect(result.documents[0]).toEqual(expectedDocument2);
      expect(result.documents[1]).toEqual(expectedDocument1);
    });

    it('should get empty data array if there is no general order documents', async () => {
      //given
      const application = Object.assign(new ApplicationResponse(), mockApplication);
      const caseData = application.case_data;
      caseData.generalOrderDocument= null;

      jest.spyOn(GaServiceClient.prototype, 'getApplication').mockResolvedValueOnce(application);
      //When
      const result = getGeneralOrder(application, 'en');
      //Then

      expect(result.length).toEqual(0);
    });

    it('should get empty data array if there is no casedata', async () => {
      //given
      //given
      const application = Object.assign(new ApplicationResponse(), mockApplication);
      application.case_data = null;

      jest.spyOn(GaServiceClient.prototype, 'getApplication').mockResolvedValueOnce(application);
      //When
      const resultGeneralOrder = getGeneralOrder(application, 'en');
      const resultHearingNotice = getHearingNotice(application, 'en');
      const resultDismissalOrder = getDismissalOrder(application, 'en');
      //Then

      expect(resultGeneralOrder.length).toEqual(0);
      expect(resultHearingNotice.length).toEqual(0);
      expect(resultDismissalOrder.length).toEqual(0);
    });

    it('should get data array if there is court has hearing order documents', async () => {
      //given
      const application = Object.assign(new ApplicationResponse(), mockApplication);
      const caseData = application.case_data;
      caseData.hearingOrderDocument = setMockHearingOrderDocuments();

      mockGetApplication.mockResolvedValueOnce(application);
      //When
      const result = getCourtDocuments(application, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.HEARING_ORDER',
        '1 August 2024',
        new DocumentLinkInformation('/case/1718105701451856/view-documents/136767cf-033a-4fb1-9222-48bc7decf871', 'Application_Hearing_order_2024-08-01 12:15:34.pdf'),
      );
      const expectedResult = new DocumentsViewComponent('CourtDocument', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array if there is court order hearing notice documents', async () => {
      //given
      const application = Object.assign(new ApplicationResponse(), mockApplication);
      const caseData = application.case_data;
      caseData.hearingNoticeDocument = setMockHearingNoticeDocuments();

      mockGetApplication.mockResolvedValueOnce(application);
      //When
      const result = getCourtDocuments(application, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.HEARING_NOTICE',
        '1 August 2024',
        new DocumentLinkInformation('/case/1718105701451856/view-documents/136767cf-033a-4fb1-9222-48bc7decf841', 'Application_Hearing_Notice_2024-08-01 12:15:34.pdf'),
      );
      const expectedResult = new DocumentsViewComponent('CourtDocument', [expectedDocument]);
      expect(result.title).toContain(expectedResult.title);
    });

    it('should get data array if there is court has dismissal order documents', async () => {
      //given
      mockGetApplication.mockClear();
      const application = Object.assign(new ApplicationResponse(), mockApplication);
      const caseData = application.case_data;
      caseData.dismissalOrderDocument = setMockDismissalOrderDocuments();
      caseData.hearingNoticeDocument = null;
      caseData.hearingOrderDocument = null;
      mockGetApplication.mockResolvedValueOnce(application);
      //When
      const result = getCourtDocuments(application, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DISMISSAL_ORDER',
        '12 November 2024',
        new DocumentLinkInformation('/case/1718105701451856/view-documents/3d39afa3-653f-456f-900e-1c5ed0f8dd5a', 'Dismissal_order_for_application_2024-11-12 16:25:48.pdf'),
      );
      const expectedDocument1 = {
        'fileName': 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DISMISSAL_ORDER',
        'uploadDate': '15 November 2024',
        'linkInformation': {
          'url': '/case/1718105701451856/view-documents/82941661-c59b-437f-8b13-c680c81839c7',
          'text': 'Translated_Dismissal_order_for_application_2024-11-15 12:05:40.pdf',
        },
      };
      const expectedResult = new DocumentsViewComponent('CourtDocument', [expectedDocument1, expectedDocument]);
      expect(result.documents[0]).toEqual(expectedResult.documents[0]);
      expect(result.documents[1]).toEqual(expectedResult.documents[1]);
    });

    it('should get dismissal order documents', async () => {
      //given
      mockGetApplication.mockClear();
      const application = Object.assign(new ApplicationResponse(), mockApplication);
      const caseData = application.case_data;
      caseData.dismissalOrderDocument = setMockDismissalOrderDocuments();

      mockGetApplication.mockResolvedValueOnce(application);
      //When
      const result = getDismissalOrder(application, 'en');
      //Then
      const expectedDocument = {
        'fileName': 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DISMISSAL_ORDER',
        'uploadDate': '15 November 2024',
        'linkInformation': {
          'url': '/case/1718105701451856/view-documents/82941661-c59b-437f-8b13-c680c81839c7',
          'text': 'Translated_Dismissal_order_for_application_2024-11-15 12:05:40.pdf',
        },
      };
      const expectedResult = new DocumentsViewComponent('CourtDocument', [expectedDocument]);
      expect(result[0]).toEqual(expectedResult.documents[0]);
    });

    it('should get empty data array if there is no dismissal order documents', async () => {
      //given
      const application = Object.assign(new ApplicationResponse(), mockApplication);
      const caseData = application.case_data;
      caseData.dismissalOrderDocument = undefined;
      caseData.gaDraftDocument = undefined;
      caseData.hearingOrderDocument = undefined;
      caseData.hearingNoticeDocument = undefined;

      jest.spyOn(GaServiceClient.prototype, 'getApplication').mockResolvedValueOnce(application);
      //When
      const dismissalOrder = getDismissalOrder(application, 'en');
      const draftDoc = getDraftDocument(application, 'en');
      const haringNotice = getHearingNotice(application, 'en');
      const hearingOrder = getHearingOrder(application, 'en');

      //Then
      expect(dismissalOrder.length).toEqual(0);
      expect(draftDoc.length).toEqual(0);
      expect(haringNotice.length).toEqual(0);
      expect(hearingOrder.length).toEqual(0);
    });

    it('should get empty applicationResponse if application not defined', async () => {
      //given
      const application: ApplicationResponse = undefined;

      jest.spyOn(GaServiceClient.prototype, 'getApplication').mockResolvedValueOnce(application);
      //When
      const dismissalOrder = getDismissalOrder(application, 'en');
      const draftDoc = getDraftDocument(application, 'en');
      const haringNotice = getHearingNotice(application, 'en');
      const hearingOrder = getHearingOrder(application, 'en');
      //Then
      expect(dismissalOrder.length).toEqual(0);
      expect(draftDoc.length).toEqual(0);
      expect(haringNotice.length).toEqual(0);
      expect(hearingOrder.length).toEqual(0);
    });
  });

  describe('getResponseFromCourtSection', () => {
    it('should return court from response section for applicant', async () => {
      //given
      const application = Object.assign(new ApplicationResponse(), mockApplication);
      application.case_data.hearingNoticeDocument = setMockHearingNoticeDocuments();
      application.case_data.requestForInformationDocument = setMockRequestForInformationDocument();
      application.case_data.parentClaimantIsApplicant = YesNoUpperCamelCase.YES;
      jest.spyOn(GaServiceClient.prototype, 'getApplication').mockResolvedValueOnce(application);

      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      (getClaimById as jest.Mock).mockResolvedValue(claim);
      //when
      const result = await getResponseFromCourtSection(mockedAppRequest, '1', 'en');

      //then
      expect(result[0].rows[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE');
      expect(result[0].rows[0].value.html).toEqual('1 August 2024');
      expect(result[0].rows[1].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE');
      expect(result[0].rows[1].value.html).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.HEARING_NOTICE_DESC');
      expect(result[0].rows[2].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE');
      expect(result[0].rows[2].value.html).toContain('Application_Hearing_Notice_2024-08-01 12:15:34.pdf');
    });

    it('should return court from response section for defendant', async () => {
    //given
      const application = Object.assign(new ApplicationResponse(), mockApplication);
      application.case_data.parentClaimantIsApplicant = YesNoUpperCamelCase.NO;
      application.case_data.hearingNoticeDocument = setMockHearingNoticeDocuments();
      application.case_data.requestForInformationDocument = setMockRequestForInformationDocument();
      jest.spyOn(GaServiceClient.prototype, 'getApplication').mockResolvedValueOnce(application);

      const claim = new Claim();
      claim.caseRole = CaseRole.DEFENDANT;
      (getClaimById as jest.Mock).mockResolvedValue(claim);
      //when'
      const result = await getResponseFromCourtSection(mockedAppRequest, '1', 'en');
      //then
      expect(result[0].rows[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE');
      expect(result[0].rows[0].value.html).toEqual('1 August 2024');
      expect(result[0].rows[1].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE');
      expect(result[0].rows[1].value.html).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.HEARING_NOTICE_DESC');
      expect(result[0].rows[2].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE');
      expect(result[0].rows[2].value.html).toContain('Application_Hearing_Notice_2024-08-01 12:15:34.pdf');
    });
  });

  describe('View application content for CoSc general application', () => {
    let application : ApplicationResponse;
    const date = new Date(Date.now());
    beforeEach(() => {
      application = Object.assign(new ApplicationResponse(), mockApplication);
      application.case_data.parentClaimantIsApplicant = YesNoUpperCamelCase.NO;
      application.case_data.generalAppType.types =[ApplicationTypeOption.CONFIRM_CCJ_DEBT_PAID];
      application.case_data.applicationTypes = 'Confirm you\'ve paid a judgment debt';
      const claim = new Claim();
      claim.caseRole = CaseRole.DEFENDANT;
      mockGetClaimById.mockResolvedValueOnce(claim);
    });

    it('view cosc application with not able to provide evidence of full payment - applicant', async () => {
      //given
      const certOfSC = {
        debtPaymentEvidence: {
          provideDetails: 'unable to provide evidence',
          debtPaymentOption: 'UNABLE_TO_PROVIDE_EVIDENCE_OF_FULL_PAYMENT',
        },
        defendantFinalPaymentDate: date,
      };
      application.case_data.certOfSC = certOfSC;
      //when
      const result = (await getApplicationSections(mockedAppRequest, application, 'en')).summaryRows;
      //then
      expect(result).toHaveLength(4);
      expect(result[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.TITLE');
      expect(result[0].value.html).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.AWAITING_APP_PAYMENT');
      expect(result[1].key.text).toEqual('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.APPLICATION_TYPE');
      expect(result[1].value.html).toEqual('PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.CONFIRM_YOU_PAID_CCJ');
      expect(result[2].key.text).toEqual('PAGES.GENERAL_APPLICATION.FINAL_DEFENDANT_PAYMENT_DATE.FORM_HEADER_1');
      expect(result[2].value.html).toEqual(formatDateToFullDate(date));
      expect(result[3].key.text).toEqual('PAGES.GENERAL_APPLICATION.DEBT_PAYMENT.DO_YOU_WANT_PROVIDE_EVIDENCE');
      expect(result[3].value.html).toContain('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.COSC.UPLOAD_EVIDENCE_PAID_IN_FULL_NO');
    });

    it('view cosc application content - want to upload evidence that debt has been paid in full - applicant', async () => {
      //given
      const certOfSC = {
        proofOfDebtDoc: [{
          value: {
            document_url: 'http://dm-store:8080/documents/d4559b',
            document_binary_url: 'http://dm-store:8080/documents/d4559b/binary',
            document_filename: 'test.doc',
            category_id: '231',
          },
        }],
        debtPaymentEvidence: {
          debtPaymentOption: 'UPLOAD_EVIDENCE_DEBT_PAID_IN_FULL',
        },
        defendantFinalPaymentDate: date,
      };
      application.case_data.certOfSC = certOfSC;
      //when
      const result = (await getApplicationSections(mockedAppRequest, application, 'en')).summaryRows;
      //then
      expect(result).toHaveLength(4);
      expect(result[3].key.text).toEqual('PAGES.GENERAL_APPLICATION.DEBT_PAYMENT.DO_YOU_WANT_PROVIDE_EVIDENCE');
      expect(result[3].value.html).toContain('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.COSC.UPLOAD_EVIDENCE_PAID_IN_FULL');
    });

    it('view cosc application content - made full payment to the court - applicant', async () => {
      //given
      const certOfSC = {
        proofOfDebtDoc: [{
          value: {
            document_url: 'http://dm-store:8080/documents/d4559b',
            document_binary_url: 'http://dm-store:8080/documents/d4559b/binary',
            document_filename: 'test.doc',
            category_id: '231',
          },
        }],
        debtPaymentEvidence: {
          debtPaymentOption: 'MADE_FULL_PAYMENT_TO_COURT',
        },
        defendantFinalPaymentDate: date,
      };
      application.case_data.certOfSC = certOfSC;
      //when
      const result = (await getApplicationSections(mockedAppRequest, application, 'en')).summaryRows;
      //then
      expect(result).toHaveLength(4);
      expect(result[3].key.text).toEqual('PAGES.GENERAL_APPLICATION.DEBT_PAYMENT.DO_YOU_WANT_PROVIDE_EVIDENCE');
      expect(result[3].value.html).toContain('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.COSC.HAS_DEBT_BEEN_PAID_TO_COURT');
    });
  });

  describe('getStatusRow', () => {
    it('should return status row', async () => {
      //given
      const application = JSON.parse(JSON.stringify(mockApplication));
      application.case_data.generalAppType = {
        types: [ApplicationTypeOption.EXTEND_TIME, ApplicationTypeOption.ADJOURN_HEARING],
      };
      jest.spyOn(GaServiceClient.prototype, 'getApplication').mockResolvedValueOnce(application);

      //when
      const result = await getStatusRow(application, 'en');

      //then
      expect(result.length).toEqual(1);
      expect(result[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.TITLE');
      expect(result[0].value.html).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.AWAITING_APP_PAYMENT');
    });

    it('should return null status row if single app type', async () => {
      //given
      const application = JSON.parse(JSON.stringify(mockApplication));
      expect(application.case_data.generalAppType.types.length).toEqual(1);
      jest.spyOn(GaServiceClient.prototype, 'getApplication').mockResolvedValueOnce(application);

      //when
      const result = await getStatusRow(application, 'en');

      //then
      expect(result).toBeNull();
    });
  });

  describe('getResponseSummaryCardSections', () => {
    it('should return summary card sections if respondent has responded', async () => {
      //given
      const application = JSON.parse(JSON.stringify(mockApplication));
      application.case_data.respondentsResponses = [{value: {}}];
      application.case_data.generalAppType = {
        types: [ApplicationTypeOption.EXTEND_TIME, ApplicationTypeOption.ADJOURN_HEARING],
      };
      jest.spyOn(GaServiceClient.prototype, 'getApplication').mockResolvedValueOnce(application);

      //when
      const result = getResponseSummaryCardSections(application, 'en');

      //then
      expect(result.length).toEqual(2);
      expect(result[0].rows.length).toEqual(3);
      expect(result[0].card.title.text).toEqual('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.APPLICATION 1');
      expect(result[0].rows[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.APPLICATION_TYPE');
      expect(result[0].rows[0].value.html).toEqual('PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.MORE_TIME');
    });

    it('should return null summary card sections if single app type, respondent responded', async () => {
      //given
      const application = JSON.parse(JSON.stringify(mockApplication));
      application.case_data.respondentsResponses = [{value: {}}];
      expect(application.case_data.generalAppType.types.length).toEqual(1);
      jest.spyOn(GaServiceClient.prototype, 'getApplication').mockResolvedValueOnce(application);

      //when
      const result = getResponseSummaryCardSections(application, 'en');

      //then
      expect(result).toBeNull();
    });

    it('should return summary card sections if respondent not responded', async () => {
      //given
      const application = JSON.parse(JSON.stringify(mockApplication));
      delete application.case_data.respondentsResponses;
      application.case_data.generalAppType = {
        types: [ApplicationTypeOption.EXTEND_TIME, ApplicationTypeOption.ADJOURN_HEARING],
      };
      jest.spyOn(GaServiceClient.prototype, 'getApplication').mockResolvedValueOnce(application);

      //when
      const result = getResponseSummaryCardSections(application, 'en');

      //then
      expect(result.length).toEqual(2);
      expect(result[0].rows.length).toEqual(3);
      expect(result[0].card.title.text).toEqual('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.APPLICATION 1');
      expect(result[0].rows[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.RESPONDENT_VIEW_APPLICATION.APPLICATION_TYPE_AND_DESC');
      expect(result[0].rows[0].value.html).toEqual(
        'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.MORE_TIME.</br>PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_MORE_TIME_DESCRIPTION');
    });

    it('should return null summary card sections if single app type, respondent not responded', async () => {
      //given
      const application = JSON.parse(JSON.stringify(mockApplication));
      delete application.case_data.respondentsResponses;
      jest.spyOn(GaServiceClient.prototype, 'getApplication').mockResolvedValueOnce(application);

      //when
      const result = getResponseSummaryCardSections(application, 'en');

      //then
      expect(result).toBeNull();
    });
  });
});
