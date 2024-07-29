import mockApplication from '../../../../../utils/mocks/applicationMock.json';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {getApplicationSections, getJudgeResponseSummary} from 'services/features/generalApplication/viewApplication/viewApplicationService';
import {GaServiceClient} from 'client/gaServiceClient';
import * as requestModels from 'models/AppRequest';
import {Claim} from 'models/claim';
import * as utilityService from 'modules/utilityService';
import {CaseRole} from 'form/models/caseRoles';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import { DocumentType } from 'common/models/document/documentType';

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
      expect(result[2].value.html).toContain('<a href="undefined">PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.COURT_DOCUMENT</a>');
    });

  });
});
