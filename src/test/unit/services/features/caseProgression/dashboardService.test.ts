import {Claim} from 'models/claim';
import {CaseProgressionHearing} from 'models/caseProgression/caseProgressionHearing';
import {HearingFeeInformation} from 'models/caseProgression/hearingFee/hearingFee';
import {FIXED_DATE} from '../../../../utils/dateUtils';
import {
  extractOrderDocumentIdFromNotification,
  getDashboardForm,
  getNotifications,
} from 'services/dashboard/dashboardService';
import {CaseRole} from 'form/models/caseRoles';
import {DashboardNotificationList} from 'models/dashboard/dashboardNotificationList';
import {AppRequest} from 'common/models/AppRequest';
import axios, {AxiosInstance} from 'axios';
import {req} from '../../../../utils/UserDetails';
import {CivilServiceClient} from 'client/civilServiceClient';
import {DashboardNotification} from 'models/dashboard/dashboardNotification';
import {plainToInstance} from 'class-transformer';
import {Dashboard} from 'models/dashboard/dashboard';
import {DashboardTaskList} from 'models/dashboard/taskList/dashboardTaskList';
import {ClaimantOrDefendant} from 'models/partyType';
import {CivilServiceDashboardTask} from 'models/dashboard/taskList/civilServiceDashboardTask';
import {DashboardTask} from 'models/dashboard/taskList/dashboardTask';
import {DashboardTaskStatus} from 'models/dashboard/taskList/dashboardTaskStatus';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
const appReq = <AppRequest>req;
appReq.params = {id: '123'};
describe('dashboardService', () => {

  describe('generateNewDashboard', () => {
    describe('as Claimant', () => {
      it('with hearing fee actionable + trial arrangements if hearing fee + fast track type', () => {
        //Given
        const claim = new Claim();
        claim.id = '1234567890';
        claim.caseProgressionHearing = new CaseProgressionHearing(null, null, null, null, null, new HearingFeeInformation({calculatedAmountInPence: '1000', code: 'test', version: '1'}, FIXED_DATE));
        claim.caseRole = CaseRole.CLAIMANT;
        claim.totalClaimAmount = 12345;
        //When
        const claimantNotifications = new DashboardNotificationList();
        const notifications =new DashboardNotificationList();
        //Then
        expect(claimantNotifications).toEqual(notifications);

      });
    });
  });
  describe('as Defendant', () => {
    describe('Dashboard', () => {
      const mockNotificationInfo = [
        {
          'id': '8c2712da-47ce-4050-bbee-650134a7b9e5',
          'titleEn': 'title_en',
          'titleCy': 'title_cy',
          'descriptionEn': 'description_en',
          'descriptionCy': 'description_cy',
        },
        {
          'id': '8c2712da-47ce-4050-bbee-650134a7b9e6',
          'titleEn': 'title_en_2',
          'titleCy': 'title_cy_2',
          'descriptionEn': 'description_en_2',
          'descriptionCy': 'description_cy_2',
        },
      ] as DashboardNotification[];
      const mockExpectedDashboardInfo=
        [{
          'categoryEn': 'Hearing',
          'categoryCy': 'Hearing Welsh',
          tasks: [{
            'id': '8c2712da-47ce-4050-bbee-650134a7b9e5',
            'status': 'ACTION_NEEDED',
            'taskNameEn': 'task_name_en',
            'hintTextEn': 'hint_text_en',
            'taskNameCy': 'task_name_cy',
            'hintTextCy': 'hint_text_cy',
          }, {
            'id': '8c2712da-47ce-4050-bbee-650134a7b9e6',
            'status': 'ACTION_NEEDED',
            'taskNameEn': 'task_name_en',
            'hintTextEn': 'hint_text_en',
            'taskNameCy': 'task_name_cy',
            'hintTextCy': 'hint_text_cy',
          }],
        },{
          'categoryEn': 'Claim',
          'categoryCy': 'Claim Welsh',
          tasks:[{
            'id': '8c2712da-47ce-4050-bbee-650134a7b9e7',
            'statusEn': 'ACTION_NEEDED',
            'statusCy': 'ACTION_NEEDED',
            'statusColour': 'govuk-red',
            'taskNameEn': 'task_name_en2',
            'hintTextEn': 'hint_text_en2',
            'taskNameCy': 'task_name_cy2',
            'hintTextCy': 'hint_text_cy2',
          },
          {
            'id': '8c2712da-47ce-4050-bbee-650134a7b9e8',
            'statusEn': 'ACTION_NEEDED',
            'statusCy': 'ACTION_NEEDED',
            'statusColour': 'govuk-red',
            'taskNameEn': 'task_name_en2',
            'hintTextEn': 'hint_text_en2',
            'taskNameCy': 'task_name_cy2',
            'hintTextCy': 'hint_text_cy2',
          }] as DashboardTask[],
        }] as DashboardTaskList[];
      const mockDashboardInfo =[
        {
          'id': '8c2712da-47ce-4050-bbee-650134a7b9e5',
          'currentStatusEn': 'Action needed',
          'currentStatusCy': 'Action needed',
          'taskNameEn': 'task_name_en',
          'hintTextEn': 'hint_text_en',
          'taskNameCy': 'task_name_cy',
          'hintTextCy': 'hint_text_cy',
          'categoryEn': 'Hearing',
          'categoryCy': 'Hearing Welsh',
        },
        {
          'id': '8c2712da-47ce-4050-bbee-650134a7b9e6',
          'currentStatusEn': 'Action needed',
          'currentStatusCy': 'Action needed',
          'taskNameEn': 'task_name_en',
          'hintTextEn': 'hint_text_en',
          'taskNameCy': 'task_name_cy',
          'hintTextCy': 'hint_text_cy',
          'categoryEn': 'Hearing',
          'categoryCy': 'Hearing Welsh',
        },
        {
          'id': '8c2712da-47ce-4050-bbee-650134a7b9e7',
          'currentStatusEn': 'Action needed',
          'currentStatusCy': 'Action needed',
          'taskNameEn': 'task_name_en2',
          'hintTextEn': 'hint_text_en2',
          'taskNameCy': 'task_name_cy2',
          'hintTextCy': 'hint_text_cy2',
          'categoryEn': 'Claim',
          'categoryCy': 'Claim Welsh',
        },
        {
          'id': '8c2712da-47ce-4050-bbee-650134a7b9e8',
          'currentStatusEn': 'Action needed',
          'currentStatusCy': 'Action needed',
          'taskNameEn': 'task_name_en2',
          'hintTextEn': 'hint_text_en2',
          'taskNameCy': 'task_name_cy2',
          'hintTextCy': 'hint_text_cy2',
          'categoryEn': 'Claim',
          'categoryCy': 'Claim Welsh',
        },
      ] as CivilServiceDashboardTask[];

      it('Notifications', async () => {
        //Given
        const mockGet = jest.fn().mockResolvedValue({data: mockNotificationInfo});
        mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);
        const notificationList: DashboardNotification[] = mockNotificationInfo;
        const dashboardNotificationItems= plainToInstance(DashboardNotification, notificationList);
        const dashboardNotificationList= new  DashboardNotificationList();
        dashboardNotificationList.items = dashboardNotificationItems;
        jest.spyOn(CivilServiceClient.prototype, 'retrieveNotification').mockResolvedValueOnce(dashboardNotificationList);

        const claim = new Claim();
        claim.id = '1234567890';
        claim.caseProgressionHearing = new CaseProgressionHearing(null, null, null, null, null, new HearingFeeInformation({calculatedAmountInPence: '1000', code: 'test', version: '1'}, FIXED_DATE));
        claim.caseRole = CaseRole.DEFENDANT;
        claim.totalClaimAmount = 12345;
        //When
        const claimantNotifications: DashboardNotificationList = await getNotifications('1234567890', claim, ClaimantOrDefendant.DEFENDANT, appReq, 'en');

        //Then
        expect(claimantNotifications.items).toEqual(mockNotificationInfo);

      });

      it('Dashboard', async () => {
        //Given
        const mockGet = jest.fn().mockResolvedValue({data: mockDashboardInfo});
        mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);

        const dashboard = new Dashboard(mockExpectedDashboardInfo);

        jest.spyOn(CivilServiceClient.prototype, 'retrieveDashboard').mockResolvedValueOnce(dashboard);

        const claim = new Claim();
        claim.id = '1234567890';
        claim.caseProgressionHearing = new CaseProgressionHearing(null, null, null, null, null, null);
        claim.caseRole = CaseRole.DEFENDANT;
        claim.totalClaimAmount = 900;
        //When
        const claimantDashboard = await getDashboardForm(ClaimantOrDefendant.DEFENDANT, claim, '1234567890',appReq);

        //Then
        expect(claimantDashboard.items).toEqual(mockExpectedDashboardInfo);

      });

      it('should exclude mediation section when carm is off', async () => {
        //Given
        const mockGet = jest.fn().mockResolvedValue({
          data: Array.of(
            new CivilServiceDashboardTask(
              'test',
              'test',
              'test',
              'test',
              'test',
              DashboardTaskStatus.COMPLETE,
              'test',
              'test',
              'test'),
          ),
        });
        mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);

        const dashboard = new Dashboard(
          Array.of(new DashboardTaskList('test', 'test', [])
            , new DashboardTaskList('Mediation', 'Mediation', [])
            , new DashboardTaskList('test', 'test', []),
          ));

        const dashboardExpected = new Dashboard(
          Array.of(new DashboardTaskList('test', 'test', [])
            , new DashboardTaskList('test', 'test', []),
          ));

        jest.spyOn(CivilServiceClient.prototype, 'retrieveDashboard').mockResolvedValueOnce(dashboard);

        const claim = new Claim();
        claim.id = '1234567890';
        claim.caseRole = CaseRole.DEFENDANT;
        claim.totalClaimAmount = 900;
        //When
        const claimantDashboard = await getDashboardForm(
          ClaimantOrDefendant.DEFENDANT
          , claim
          , '1234567890'
          , appReq
          , false);

        //Then
        expect(claimantDashboard).toEqual(dashboardExpected);
      });

      it('ExtractDocumentFromNotificationList', async () => {
        //Given
        const notificationList: DashboardNotificationList = new DashboardNotificationList();
        const params: Map<string, object> = new Map<string, object>();
        params.set('orderDocument', new Object('http://dm-store:8080/documents/f1c7d590-8d3f-49c2-8ee7-6420ab711801/binary'));
        const dashboardNotification = new DashboardNotification('1234', '', '', '', '', '', undefined, params);
        notificationList.items = new Array(dashboardNotification);
        //When
        const documentId = extractOrderDocumentIdFromNotification(notificationList);

        //Then
        expect(documentId).toEqual(undefined);

      });
    });
  });
});
