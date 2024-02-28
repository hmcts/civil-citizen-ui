import {Claim} from 'models/claim';
import {CaseProgressionHearing} from 'models/caseProgression/caseProgressionHearing';
import {HearingFeeInformation} from 'models/caseProgression/hearingFee/hearingFee';
import {FIXED_DATE} from '../../../../utils/dateUtils';
import {getDashboardForm, getNotifications} from 'services/dashboard/dashboardService';
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
      ];
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
            'url': '',
          }, {
            'id': '8c2712da-47ce-4050-bbee-650134a7b9e6',
            'status': 'ACTION_NEEDED',
            'taskNameEn': 'task_name_en',
            'hintTextEn': 'hint_text_en',
            'taskNameCy': 'task_name_cy',
            'hintTextCy': 'hint_text_cy',
            'url': '',
          }],
        },{
          'categoryEn': 'Claim',
          'categoryCy': 'Claim Welsh',
          tasks:[{
            'id': '8c2712da-47ce-4050-bbee-650134a7b9e7',
            'status': 'ACTION_NEEDED',
            'taskNameEn': 'task_name_en2',
            'hintTextEn': 'hint_text_en2',
            'taskNameCy': 'task_name_cy2',
            'hintTextCy': 'hint_text_cy2',
            'url': '',
          },
          {
            'id': '8c2712da-47ce-4050-bbee-650134a7b9e8',
            'status': 'ACTION_NEEDED',
            'taskNameEn': 'task_name_en2',
            'hintTextEn': 'hint_text_en2',
            'taskNameCy': 'task_name_cy2',
            'hintTextCy': 'hint_text_cy2',
            'url': '',
          }],
        }];
      const mockDashboardInfo =[
        {
          'id': '8c2712da-47ce-4050-bbee-650134a7b9e5',
          'reference': '123',
          'currentStatus': 0,
          'nextStatus': 1,
          'taskNameEn': 'task_name_en',
          'hintTextEn': 'hint_text_en',
          'taskNameCy': 'task_name_cy',
          'hintTextCy': 'hint_text_cy',
          'updatedBy': 'Test',
          'categoryEn': 'Hearing',
          'categoryCy': 'Hearing Welsh',
          'role': 'claimant',
          'taskOrder': 10,
          'url': '',
        },
        {
          'id': '8c2712da-47ce-4050-bbee-650134a7b9e6',
          'reference': '123',
          'currentStatus': 0,
          'nextStatus': 1,
          'taskNameEn': 'task_name_en',
          'hintTextEn': 'hint_text_en',
          'taskNameCy': 'task_name_cy',
          'hintTextCy': 'hint_text_cy',
          'updatedBy': 'Test',
          'categoryEn': 'Hearing',
          'categoryCy': 'Hearing Welsh',
          'role': 'claimant',
          'taskOrder': 10,
          'url': '',
        },
        {
          'id': '8c2712da-47ce-4050-bbee-650134a7b9e7',
          'reference': '123',
          'currentStatus': 0,
          'nextStatus': 1,
          'taskNameEn': 'task_name_en2',
          'hintTextEn': 'hint_text_en2',
          'taskNameCy': 'task_name_cy2',
          'hintTextCy': 'hint_text_cy2',
          'updatedBy': 'Test2',
          'categoryEn': 'Claim',
          'categoryCy': 'Claim Welsh',
          'role': 'claimant',
          'taskOrder': 10,
          'url': '',
        },
        {
          'id': '8c2712da-47ce-4050-bbee-650134a7b9e8',
          'reference': '123',
          'currentStatus': 0,
          'nextStatus': 1,
          'taskNameEn': 'task_name_en2',
          'hintTextEn': 'hint_text_en2',
          'taskNameCy': 'task_name_cy2',
          'hintTextCy': 'hint_text_cy2',
          'updatedBy': 'Test2',
          'categoryEn': 'Claim',
          'categoryCy': 'Claim Welsh',
          'role': 'claimant',
          'taskOrder': 10,
          'url': '',
        },
      ];
      it('Notifications', async () => {
        //Given
        const mockGet = jest.fn().mockResolvedValue({data: mockNotificationInfo});
        mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);
        const notificationList: DashboardNotification[] = Object.assign([new DashboardNotification()], mockNotificationInfo);
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
        const claimantNotifications: DashboardNotificationList = await getNotifications('1234567890', claim, ClaimantOrDefendant.DEFENDANT, appReq);

        //Then
        expect(claimantNotifications.items).toEqual(mockNotificationInfo);

      });

      it('Dashboard', async () => {
        //Given
        const mockGet = jest.fn().mockResolvedValue({data: mockDashboardInfo});
        mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);

        const dashboardTaskList: DashboardTaskList[] = Object.assign([new DashboardTaskList()], mockExpectedDashboardInfo);
        const dashboard = new Dashboard();
        dashboard.items= plainToInstance(DashboardTaskList, dashboardTaskList);

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
    });
  });
});
