import { Claim } from 'models/claim';
import { CaseProgressionHearing } from 'models/caseProgression/caseProgressionHearing';
import { HearingFeeInformation } from 'models/caseProgression/hearingFee/hearingFee';
import { FIXED_DATE } from '../../../../utils/dateUtils';
import {
  extractOrderDocumentIdFromNotification,
  getContactCourtLink,
  getDashboardForm,
  getNotifications, sortDashboardNotifications,
} from 'services/dashboard/dashboardService';
import { CaseRole } from 'form/models/caseRoles';
import { DashboardNotificationList } from 'models/dashboard/dashboardNotificationList';
import { AppRequest } from 'common/models/AppRequest';
import axios, { AxiosInstance } from 'axios';
import { req } from '../../../../utils/UserDetails';
import { CivilServiceClient } from 'client/civilServiceClient';
import { DashboardNotification } from 'models/dashboard/dashboardNotification';
import { plainToInstance } from 'class-transformer';
import { Dashboard } from 'models/dashboard/dashboard';
import { DashboardTaskList } from 'models/dashboard/taskList/dashboardTaskList';
import { ClaimantOrDefendant } from 'models/partyType';
import { CivilServiceDashboardTask } from 'models/dashboard/taskList/civilServiceDashboardTask';
import { DashboardTask } from 'models/dashboard/taskList/dashboardTask';
import { DashboardTaskStatus } from 'models/dashboard/taskList/dashboardTaskStatus';
import { YesNo } from 'form/models/yesNo';
import {CaseLink} from 'models/generalApplication/CaseLink';
import { CaseState } from 'common/form/models/claimDetails';
import { applicationNoticeUrl } from 'common/utils/externalURLs';
import {ClaimGeneralApplication, ClaimGeneralApplicationValue} from 'models/generalApplication/claimGeneralApplication';
import {isGaForLipsEnabled, isGaForLipsEnabledAndLocationWhiteListed} from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';

jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
const appReq = <AppRequest>req;
appReq.params = {id: '123'};

jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

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
          'createdAt': '2024-01-01T00:00:00',
        },
        {
          'id': '8c2712da-47ce-4050-bbee-650134a7b9e6',
          'titleEn': 'title_en_2',
          'titleCy': 'title_cy_2',
          'descriptionEn': 'description_en_2',
          'descriptionCy': 'description_cy_2',
          'createdAt': '2024-01-01T00:00:00',
        },
      ] as DashboardNotification[];
      const allNotificationInfo = [
        {
          'id': '8c2712da-47ce-4050-bbee-650134a7b9e5',
          'titleEn': 'title_en',
          'titleCy': 'title_cy',
          'descriptionEn': 'description_en',
          'descriptionCy': 'description_cy',
          'createdAt': '2024-01-01T00:00:00',
        },
        {
          'id': '8c2712da-47ce-4050-bbee-650134a7b9e6',
          'titleEn': 'title_en_2',
          'titleCy': 'title_cy_2',
          'descriptionEn': 'description_en_2',
          'descriptionCy': 'description_cy_2',
          'createdAt': '2024-01-01T00:00:00',
        },
        {
          'id': '8c2712da-47ce-4050-bbee-650134a7b9e5',
          'titleEn': 'title_en',
          'titleCy': 'title_cy',
          'descriptionEn': 'description_en',
          'descriptionCy': 'description_cy',
          'createdAt': '2024-01-01T00:00:00',
        },
        {
          'id': '8c2712da-47ce-4050-bbee-650134a7b9e6',
          'titleEn': 'title_en_2',
          'titleCy': 'title_cy_2',
          'descriptionEn': 'description_en_2',
          'descriptionCy': 'description_cy_2',
          'createdAt': '2024-01-01T00:00:00',
        },
        {
          'id': '8c2712da-47ce-4050-bbee-650134a7b9e5',
          'titleEn': 'title_en',
          'titleCy': 'title_cy',
          'descriptionEn': 'description_en',
          'descriptionCy': 'description_cy',
          'createdAt': '2024-01-01T00:00:00',
        },
        {
          'id': '8c2712da-47ce-4050-bbee-650134a7b9e6',
          'titleEn': 'title_en_2',
          'titleCy': 'title_cy_2',
          'descriptionEn': 'description_en_2',
          'descriptionCy': 'description_cy_2',
          'createdAt': '2024-01-01T00:00:00',
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
        (isGaForLipsEnabled as jest.Mock).mockReturnValueOnce(true);
        (isGaForLipsEnabledAndLocationWhiteListed as jest.Mock).mockReturnValueOnce(false);
        const notificationList: DashboardNotification[] = mockNotificationInfo;
        const dashboardNotificationItems= plainToInstance(DashboardNotification, notificationList);
        const applicantNotificationItems = plainToInstance(DashboardNotification, notificationList);
        const respondentNotificationItems = plainToInstance(DashboardNotification, notificationList);
        const dashboardNotificationList= new  DashboardNotificationList();
        const applicantNotificationList= new  DashboardNotificationList();
        const respondentNotificationList= new  DashboardNotificationList();
        dashboardNotificationList.items = dashboardNotificationItems;
        applicantNotificationList.items = applicantNotificationItems;
        respondentNotificationList.items = respondentNotificationItems;
        jest.spyOn(CivilServiceClient.prototype, 'retrieveNotification').mockResolvedValueOnce(dashboardNotificationList);

        const claim = new Claim();
        claim.id = '1234567890';
        claim.caseProgressionHearing = new CaseProgressionHearing(null, null, null, null, null, new HearingFeeInformation({calculatedAmountInPence: '1000', code: 'test', version: '1'}, FIXED_DATE));
        claim.caseRole = CaseRole.DEFENDANT;
        claim.totalClaimAmount = 12345;
        const genApps = [new ClaimGeneralApplication(), new ClaimGeneralApplication()];
        genApps[0].value = new ClaimGeneralApplicationValue();
        genApps[0].value.parentClaimantIsApplicant = YesNo.NO;
        genApps[0].value.caseLink = new CaseLink();
        genApps[0].value.caseLink.CaseReference = '1';
        genApps[1].value = new ClaimGeneralApplicationValue();
        genApps[1].value.parentClaimantIsApplicant = YesNo.YES;
        genApps[1].value.caseLink = new CaseLink();
        genApps[1].value.caseLink.CaseReference = '2';
        claim.generalApplications = genApps;
        const applicantNotifications = new Map<string, DashboardNotificationList>;
        applicantNotifications.set('1', applicantNotificationList);
        jest.spyOn(CivilServiceClient.prototype, 'retrieveGaNotification').mockResolvedValueOnce(applicantNotifications);
        const respondentNotifications = new Map<string, DashboardNotificationList>;
        respondentNotifications.set('2', respondentNotificationList);
        jest.spyOn(CivilServiceClient.prototype, 'retrieveGaNotification').mockResolvedValueOnce(respondentNotifications);

        //When
        const claimantNotifications: DashboardNotificationList = await getNotifications('1234567890', claim, ClaimantOrDefendant.DEFENDANT, appReq, 'en');

        //Then
        expect(claimantNotifications.items).toEqual(allNotificationInfo);

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
        const dashboardNotification = new DashboardNotification('1234', '', '', '', '', '', undefined, params, undefined, undefined);
        notificationList.items = new Array(dashboardNotification);
        //When
        const documentId = extractOrderDocumentIdFromNotification(notificationList);

        //Then
        expect(documentId).toEqual(undefined);

      });

      it('getContactCourtLink when Gaflag is enable and  whitelisted', async () => {
        (isGaForLipsEnabledAndLocationWhiteListed as jest.Mock).mockReturnValueOnce(true);
        //Given
        const claim = new Claim();
        claim.id = '1234567890';
        claim.caseRole = CaseRole.DEFENDANT;
        claim.totalClaimAmount = 900;
        claim.ccdState = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;
        claim.defendantUserDetails = {};
        claim.caseManagementLocation ={
          region: '2',
          baseLocation: '0909089',
        };
        //When
        const result = getContactCourtLink(claim.id, claim, true, 'en');

        //Then
        expect(result.text).toContain('PAGES.DASHBOARD.SUPPORT_LINKS.CONTACT_COURT');
        expect(result.url).toContain('/case/1234567890/general-application/application-type');
      });

      it('getContactCourtLink when Gaflag is enable and not whitelisted', async () => {
        (isGaForLipsEnabledAndLocationWhiteListed as jest.Mock).mockReturnValueOnce(false);
        //Given
        const claim = new Claim();
        claim.id = '1234567890';
        claim.caseRole = CaseRole.DEFENDANT;
        claim.totalClaimAmount = 900;
        claim.ccdState = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;
        claim.defendantUserDetails = {};
        claim.caseManagementLocation ={
          region: '2',
          baseLocation: '0909089',
        };
        //When
        const result = getContactCourtLink(claim.id, claim, true, 'en');

        //Then
        expect(result).toBeUndefined();
      });

      it('Hide getContactCourtLink when CASE_SETTLED', async () => {
        //Given
        const claim = new Claim();
        claim.id = '1234567890';
        claim.caseRole = CaseRole.DEFENDANT;
        claim.totalClaimAmount = 900;
        claim.ccdState = CaseState.CASE_SETTLED;
        claim.defendantUserDetails = {};
        //When
        const result = getContactCourtLink(claim.id, claim, true, 'en');

        //Then
        expect(result).toBeUndefined();
      });

      it('getContactCourtLink when Gaflag is not enable', async () => {
        //Given
        const claim = new Claim();
        claim.id = '1234567890';
        claim.caseRole = CaseRole.DEFENDANT;
        claim.totalClaimAmount = 900;
        claim.ccdState = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;
        claim.defendantUserDetails = {};
        //When
        const result = getContactCourtLink(claim.id, claim, false, 'en');

        //Then
        expect(result.text).toContain('PAGES.DASHBOARD.SUPPORT_LINKS.CONTACT_COURT');
        expect(result.url).toContain(applicationNoticeUrl);
      });

      it('getContactCourtLink when claim is taken offline', async () => {
        //Given
        const claim = new Claim();
        claim.id = '1234567890';
        claim.caseRole = CaseRole.DEFENDANT;
        claim.totalClaimAmount = 900;
        claim.ccdState = CaseState.PROCEEDS_IN_HERITAGE_SYSTEM;
        claim.takenOfflineDate = new Date();
        claim.defendantUserDetails = {};
        //When
        const result = getContactCourtLink(claim.id, claim, false, 'en');

        //Then
        expect(result.text).toContain('PAGES.DASHBOARD.SUPPORT_LINKS.CONTACT_COURT');
        expect(result.url).toBeUndefined();
      });

      it('getContactCourtLink when claim is in Pending Case Issued state', async () => {
        //Given
        const claim = new Claim();
        claim.id = '1234567890';
        claim.caseRole = CaseRole.DEFENDANT;
        claim.totalClaimAmount = 900;
        claim.ccdState = CaseState.PENDING_CASE_ISSUED;
        claim.takenOfflineDate = new Date();
        claim.defendantUserDetails = {};
        //When
        const result = getContactCourtLink(claim.id, claim, false, 'en');

        //Then
        expect(result).toBeUndefined();
      });

      it('getContactCourtLink when claim is not Assigned to defendant', async () => {
        //Given
        const claim = new Claim();
        claim.id = '1234567890';
        claim.caseRole = CaseRole.DEFENDANT;
        claim.totalClaimAmount = 900;
        claim.ccdState = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;
        claim.takenOfflineDate = new Date();
        claim.defendantUserDetails = undefined;
        //When
        const result = getContactCourtLink(claim.id, claim, false, 'en');

        //Then
        expect(result).toBeUndefined();
      });

      it('getContactCourtLink when no ccdState()', async () => {
        //Given
        const claim = new Claim();
        claim.id = '1234567890';
        claim.caseRole = CaseRole.DEFENDANT;
        claim.totalClaimAmount = 900;
        claim.takenOfflineDate = new Date();
        //When
        const result = getContactCourtLink(claim.id, claim, false, 'en');

        //Then
        expect(result).toBeUndefined();
      });

      it('getContactCourtLink when claim is in Pending Case Issued state and claim is unassigned', async () => {
        //Given
        const claim = new Claim();
        claim.id = '1234567890';
        claim.caseRole = CaseRole.DEFENDANT;
        claim.totalClaimAmount = 900;
        claim.ccdState = CaseState.PENDING_CASE_ISSUED;
        claim.takenOfflineDate = new Date();
        claim.defendantUserDetails = undefined;
        //When
        const result = getContactCourtLink(claim.id, claim, false, 'en');

        //Then
        expect(result).toBeUndefined();
      });

    });
    describe('Hide/Show Application Section', () => {

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
      const dashboard = new Dashboard(
        Array.of(new DashboardTaskList('test', 'test', [])
          , new DashboardTaskList('test', 'test', [])
          , new DashboardTaskList('Applications', 'Applications', []),
        ));

      const dashboardExpected = new Dashboard(
        Array.of(new DashboardTaskList('test', 'test', [])
          , new DashboardTaskList('test', 'test', []),
        ));

      it('Application section when GaFlag enabled and location not whitelisted and the case is not assigned to defendant', async () => {
        mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);
        jest.spyOn(CivilServiceClient.prototype, 'retrieveDashboard').mockResolvedValueOnce(dashboard);
        (isGaForLipsEnabledAndLocationWhiteListed as jest.Mock).mockReturnValueOnce(false);

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
          , false
          , true);

        //Then
        expect(claimantDashboard).toEqual(dashboardExpected);
      });

      it('Application section when GaFlag enabled and location whitelisted and the case is not assigned to defendant', async () => {
        mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);
        jest.spyOn(CivilServiceClient.prototype, 'retrieveDashboard').mockResolvedValueOnce(dashboard);
        (isGaForLipsEnabledAndLocationWhiteListed as jest.Mock).mockReturnValueOnce(true);

        const claim = new Claim();
        claim.id = '1234567890';
        claim.caseRole = CaseRole.DEFENDANT;
        claim.totalClaimAmount = 900;
        claim.caseManagementLocation ={
          region: '2',
          baseLocation: '0909089',
        };

        //When
        const claimantDashboard = await getDashboardForm(
          ClaimantOrDefendant.DEFENDANT
          , claim
          , '1234567890'
          , appReq
          , false
          , true);

        //Then
        expect(claimantDashboard).toEqual(dashboardExpected);
      });

      it('Application section when GaFlag disabled  and court whitelisted and the case is assigned to defendant', async () => {

        mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);
        (isGaForLipsEnabledAndLocationWhiteListed as jest.Mock).mockReturnValueOnce(true);
        jest.spyOn(CivilServiceClient.prototype, 'retrieveDashboard').mockResolvedValueOnce(dashboard);

        const claim = new Claim();
        claim.id = '1234567890';
        claim.caseRole = CaseRole.DEFENDANT;
        claim.totalClaimAmount = 900;
        claim.defendantUserDetails = {};

        //When
        const claimantDashboard = await getDashboardForm(
          ClaimantOrDefendant.DEFENDANT
          , claim
          , '1234567890'
          , appReq
          , false
          , false);

        //Then
        expect(claimantDashboard).toEqual(dashboardExpected);
      });

      it('Application section when GaFlag disabled court whitelisted and the case is not assigned to defendant', async () => {

        mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);
        (isGaForLipsEnabledAndLocationWhiteListed as jest.Mock).mockReturnValueOnce(false);
        jest.spyOn(CivilServiceClient.prototype, 'retrieveDashboard').mockResolvedValueOnce(dashboard);

        const claim = new Claim();
        claim.id = '1234567890';
        claim.caseRole = CaseRole.DEFENDANT;
        claim.totalClaimAmount = 900;
        claim.caseManagementLocation ={
          region: '2',
          baseLocation: '0909089',
        };

        //When
        const claimantDashboard = await getDashboardForm(
          ClaimantOrDefendant.DEFENDANT
          , claim
          , '1234567890'
          , appReq
          , false
          , false);

        //Then
        expect(claimantDashboard).toEqual(dashboardExpected);
      });

      it('Application section when GaFlag enabled and ea not whitelisted and the case is assigned to defendant', async () => {

        const dashboard = new Dashboard(
          Array.of(new DashboardTaskList('test', 'test', [])
            , new DashboardTaskList('test', 'test', [])
            , new DashboardTaskList('Applications', 'Applications', []),
          ));
        (isGaForLipsEnabledAndLocationWhiteListed as jest.Mock).mockReturnValueOnce(false);
        mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);
        jest.spyOn(CivilServiceClient.prototype, 'retrieveDashboard').mockResolvedValueOnce(dashboard);

        const claim = new Claim();
        claim.id = '1234567890';
        claim.caseRole = CaseRole.DEFENDANT;
        claim.totalClaimAmount = 900;
        claim.defendantUserDetails = {};
        claim.caseManagementLocation ={
          region: '2',
          baseLocation: '0909089',
        };

        //When
        const claimantDashboard = await getDashboardForm(
          ClaimantOrDefendant.DEFENDANT
          , claim
          , '1234567890'
          , appReq
          , false
          , true);

        //Then
        expect(claimantDashboard).toEqual(dashboardExpected);
      });

      it('Application section when GaFlag enabled and the case is assigned to defendant', async () => {

        const dashboard = new Dashboard(
          Array.of(new DashboardTaskList('test', 'test', [])
            , new DashboardTaskList('test', 'test', [])
            , new DashboardTaskList('Applications', 'Applications', []),
          ));
        (isGaForLipsEnabledAndLocationWhiteListed as jest.Mock).mockReturnValueOnce(true);
        mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);
        jest.spyOn(CivilServiceClient.prototype, 'retrieveDashboard').mockResolvedValueOnce(dashboard);

        const claim = new Claim();
        claim.id = '1234567890';
        claim.caseRole = CaseRole.DEFENDANT;
        claim.totalClaimAmount = 900;
        claim.defendantUserDetails = {};
        claim.caseManagementLocation ={
          region: '2',
          baseLocation: '0909089',
        };

        dashboardExpected.items.push(new DashboardTaskList('Applications', 'Applications', []));

        //When
        const claimantDashboard = await getDashboardForm(
          ClaimantOrDefendant.DEFENDANT
          , claim
          , '1234567890'
          , appReq
          , false
          , true);

        //Then
        expect(claimantDashboard).toEqual(dashboardExpected);
      });
    });
  });

  describe('Sort dashboard notifications', () => {
    it('Soonest deadline comes first', () => {
      // Given
      const notification1 = new DashboardNotification('1', '', '', '', '', '', undefined, undefined, '', '2035-01-01T00:00:00');
      const notification2 = new DashboardNotification('2', '', '', '', '', '', undefined, undefined, '', '2030-01-01T00:00:00');
      const notificationsList = new DashboardNotificationList();
      notificationsList.items = [notification1, notification2];

      // When
      sortDashboardNotifications(notificationsList, []);

      // Then
      expect(notificationsList.items[0].id).toEqual('2');
      expect(notificationsList.items[1].id).toEqual('1');
    });

    it('Deadline comes before no deadline - 1', () => {
      // Given
      const notification1 = new DashboardNotification('1', '', '', '', '', '', undefined, undefined, '', '2035-01-01T00:00:00');
      const notification2 = new DashboardNotification('2', '', '', '', '', '', undefined, undefined, '', undefined);
      const notificationsList = new DashboardNotificationList();
      notificationsList.items = [notification1, notification2];

      // When
      sortDashboardNotifications(notificationsList, []);

      // Then
      expect(notificationsList.items[0].id).toEqual('1');
      expect(notificationsList.items[1].id).toEqual('2');
    });

    it('Deadline comes before no deadline - 2', () => {
      // Given
      const notification1 = new DashboardNotification('1', '', '', '', '', '', undefined, undefined, '', undefined);
      const notification2 = new DashboardNotification('2', '', '', '', '', '', undefined, undefined, '', '2035-01-01T00:00:00');
      const notificationsList = new DashboardNotificationList();
      notificationsList.items = [notification1, notification2];

      // When
      sortDashboardNotifications(notificationsList, []);

      // Then
      expect(notificationsList.items[0].id).toEqual('2');
      expect(notificationsList.items[1].id).toEqual('1');
    });

    it('Main claim comes before GA', () => {
      // Given
      const notification1 = new DashboardNotification('1', '', '', '', '', '', undefined, undefined, '', '');
      const notification2 = new DashboardNotification('2', '', '', '', '', '', undefined, undefined, '', '');
      const notification3 = new DashboardNotification('2', '', '', '', '', '', undefined, undefined, '', '');
      const notificationsList = new DashboardNotificationList();
      notificationsList.items = [notification1, notification2, notification3];

      // When
      sortDashboardNotifications(notificationsList, ['2']);

      // Then
      expect(notificationsList.items[0].id).toEqual('2');
    });

    it('All main claim without deadline then order by most recent created date', () => {
      // Given
      const notification1 = new DashboardNotification('1', '', '', '', '', '', undefined, undefined, '2024-01-01T00:00:00', '');
      const notification2 = new DashboardNotification('2', '', '', '', '', '', undefined, undefined, '2024-03-01T00:00:00', '');
      const notification3 = new DashboardNotification('3', '', '', '', '', '', undefined, undefined, '2024-02-01T00:00:00', '');
      const notificationsList = new DashboardNotificationList();
      notificationsList.items = [notification1, notification2, notification3];
      // When
      sortDashboardNotifications(notificationsList, ['1', '2', '3']);

      // Then
      expect(notificationsList.items[0].id).toEqual('2');
      expect(notificationsList.items[1].id).toEqual('3');
      expect(notificationsList.items[2].id).toEqual('1');
    });

    it('All GA without deadline then order by most recent created date', () => {
      // Given
      const notification1 = new DashboardNotification('1', '', '', '', '', '', undefined, undefined, '2024-01-01T00:00:00', '');
      const notification2 = new DashboardNotification('2', '', '', '', '', '', undefined, undefined, '2024-03-01T00:00:00', '');
      const notification3 = new DashboardNotification('3', '', '', '', '', '', undefined, undefined, '2024-02-01T00:00:00', '');
      const notificationsList = new DashboardNotificationList();
      notificationsList.items = [notification1, notification2, notification3];
      // When
      sortDashboardNotifications(notificationsList, []);

      // Then
      expect(notificationsList.items[0].id).toEqual('2');
      expect(notificationsList.items[1].id).toEqual('3');
      expect(notificationsList.items[2].id).toEqual('1');
    });

    it('should prioritize notifications with titles "The case has been stayed" and "The stay has been lifted"', () => {
      // Given
      const notification1 = new DashboardNotification('1', 'The case has been stayed', '', '', '', '', undefined, undefined, '', '');
      const notification2 = new DashboardNotification('2', 'Other title', '', '', '', '', undefined, undefined, '', '');
      const notification3 = new DashboardNotification('3', 'The stay has been lifted', '', '', '', '', undefined, undefined, '', '');
      const notificationsList = new DashboardNotificationList();
      notificationsList.items = [notification1, notification2, notification3];

      // When
      sortDashboardNotifications(notificationsList, []);

      // Then
      expect(notificationsList.items[0].id).toEqual('1');
      expect(notificationsList.items[1].id).toEqual('3');
      expect(notificationsList.items[2].id).toEqual('2');
    });
  });
});
