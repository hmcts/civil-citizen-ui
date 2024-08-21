import mockApplication from '../../../../../utils/mocks/applicationMock.json';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {
  getApplicantDocuments,
  getApplicationSections,
  getCourtDocuments,
  getRespondentDocuments,
  getResponseFromCourtSection,
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
      caseData.hearingNoticeDocument = setMockHearingNoticeDocuments();

      jest.spyOn(GaServiceClient.prototype, 'getApplication').mockResolvedValueOnce(application);
      //When
      const result = getCourtDocuments(application, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.HEARING_NOTICE',
        '1 August 2024',
        new DocumentLinkInformation('/case/1718105701451856/view-documents/136767cf-033a-4fb1-9222-48bc7decf831', 'Application_Hearing_Notice_2024-08-02 12:15:34.pdf'),
      );
      const expectedResult = new DocumentsViewComponent('CourtDocument', [expectedDocument]);
      expect(result).toEqual(expectedResult);
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
      expect(result[0].rows[2].value.html).toContain('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.HEARING_NOTICE');
      expect(result[1].rows[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE');
      expect(result[1].rows[0].value.html).toEqual('2 March 2024');
      expect(result[1].rows[1].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE');
      expect(result[1].rows[1].value.html).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DIRECTION_WITH_NOTICE');
      expect(result[1].rows[2].key.text).toEqual('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE');
      expect(result[1].rows[2].value.html).toContain('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.COURT_DOCUMENT');
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
      expect(result[0].rows[2].value.html).toContain('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.HEARING_NOTICE');
    });
  });
});
