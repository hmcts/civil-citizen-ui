import {Claim} from 'models/claim';
import {
  extractOrderDocumentIdFromNotification,
  getContactCourtLink,
  getDashboardForm, getNotifications,
  sortDashboardNotifications,
} from 'services/dashboard/dashboardService';
import {CaseRole} from 'form/models/caseRoles';
import {DashboardNotificationList} from 'models/dashboard/dashboardNotificationList';
import {AppRequest} from 'common/models/AppRequest';
import axios, {AxiosInstance} from 'axios';
import {req} from '../../../../utils/UserDetails';
import {CivilServiceClient} from 'client/civilServiceClient';
import {DashboardNotification} from 'models/dashboard/dashboardNotification';
import {Dashboard} from 'models/dashboard/dashboard';
import {DashboardTaskList} from 'models/dashboard/taskList/dashboardTaskList';
import {ClaimantOrDefendant} from 'models/partyType';
import {CivilServiceDashboardTask} from 'models/dashboard/taskList/civilServiceDashboardTask';
import {DashboardTask} from 'models/dashboard/taskList/dashboardTask';
import {DashboardTaskStatus} from 'models/dashboard/taskList/dashboardTaskStatus';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {CaseState} from 'common/form/models/claimDetails';
import {
  isGaForLipsEnabled,
  isGaForLipsEnabledAndLocationWhiteListed,
  isQueryManagementEnabled,
} from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {GaInformation, isGaOnline} from 'services/commons/generalApplicationHelper';
import { plainToInstance } from 'class-transformer';
import {HearingFeeInformation} from 'models/caseProgression/hearingFee/hearingFee';
import {ClaimGeneralApplication, ClaimGeneralApplicationValue} from 'models/generalApplication/claimGeneralApplication';
import {CaseLink} from 'models/generalApplication/CaseLink';
import {CaseProgressionHearing} from 'models/caseProgression/caseProgressionHearing';
import {FIXED_DATE} from '../../../../utils/dateUtils';

jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
const appReq = <AppRequest>req;
appReq.params = {id: '123'};

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));
jest.mock('../../../../../main/modules/i18n');
jest.mock('services/commons/generalApplicationHelper');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const gaInfo = new GaInformation();
gaInfo.isGaOnline = true;

describe('dashboardService', () => {
  afterAll(() => {
    jest.clearAllMocks();
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

  describe('Hide/Show Application Section', () => {

    beforeEach(() => {
      jest.resetAllMocks();
      (isGaOnline as jest.Mock).mockReturnValue(gaInfo);
    });

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

    it('Application section when task list are inactive and GA is online', async () => {
      const gaInfoWithSettled = new GaInformation();
      gaInfoWithSettled.isGaOnline = true;
      gaInfoWithSettled.isSettledOrDiscontinuedWithPreviousCCDState = true;

      (isGaOnline as jest.Mock).mockReturnValue(gaInfoWithSettled);
      mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);

      const dashBoardWithContactTheCourt = new Dashboard(
        Array.of(new DashboardTaskList('Applications', 'Applications', [
          new DashboardTask('1234',
            'Contact the court to request a change to my case',
            'test',
            'Inactive',
            'test',
            'test',
            DashboardTaskStatus.INACTIVE, 'test'),
        ]),
        ));

      jest.spyOn(CivilServiceClient.prototype, 'retrieveDashboard').mockResolvedValueOnce(dashBoardWithContactTheCourt);

      const claim = new Claim();
      claim.id = '1234567890';
      claim.caseRole = CaseRole.DEFENDANT;
      claim.totalClaimAmount = 900;
      claim.defendantUserDetails = {};
      claim.caseManagementLocation ={
        region: '2',
        baseLocation: '0909089',
      };

      const dashboardExpected = new Dashboard(
        Array.of(new DashboardTaskList('Applications', 'Applications', [
          new DashboardTask('1234',
            '<a href=/case/1234567890/general-application/application-type?linkFrom=start rel="noopener noreferrer" class="govuk-link">Contact the court to request a change to my case</a>',
            '<a href=/case/1234567890/general-application/application-type?linkFrom=start rel="noopener noreferrer" class="govuk-link">Cysylltu â’r llys i wneud cais am newid i fy achos</a>',
            'Optional',
            'Dewisol',
            'test',
            DashboardTaskStatus.INACTIVE, 'test'),
        ]),
        ));

      //When
      const claimantDashboard = await getDashboardForm(
        ClaimantOrDefendant.DEFENDANT
        , claim
        ,'2000'
        , '1234567890'
        , appReq
        , false
        , true);

      //Then
      expect(claimantDashboard).toEqual(dashboardExpected);
    });

    it('Application section when GA is online', async () => {

      (isGaOnline as jest.Mock).mockReturnValue(gaInfo);
      mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);

      const dashBoardWithContactTheCourt = new Dashboard(
        Array.of(new DashboardTaskList('Applications', 'Applications', [
          new DashboardTask('1234',
            'Contact the court to request a change to my case',
            'test',
            'Inactive',
            'test',
            'test',
            DashboardTaskStatus.INACTIVE, 'test'),
        ]),
        ));

      jest.spyOn(CivilServiceClient.prototype, 'retrieveDashboard').mockResolvedValueOnce(dashBoardWithContactTheCourt);

      const claim = new Claim();
      claim.id = '1234567890';
      claim.caseRole = CaseRole.DEFENDANT;
      claim.totalClaimAmount = 900;
      claim.defendantUserDetails = {};
      claim.caseManagementLocation ={
        region: '2',
        baseLocation: '0909089',
      };

      const dashboardExpected = new Dashboard(
        Array.of(new DashboardTaskList('Applications', 'Applications', [
          new DashboardTask('1234',
            'Contact the court to request a change to my case',
            'test',
            'Inactive',
            'test',
            'test',
            DashboardTaskStatus.INACTIVE, 'test'),
        ]),
        ));

      //When
      const claimantDashboard = await getDashboardForm(
        ClaimantOrDefendant.DEFENDANT
        , claim
        , '2000'
        , '1234567890'
        , appReq
        , false
        , true);

      //Then
      expect(claimantDashboard).toEqual(dashboardExpected);
    });

    it('Application section when GA is offline', async () => {

      const gaInfo = new GaInformation();
      gaInfo.isGaOnline = false;

      (isGaOnline as jest.Mock).mockReturnValue(gaInfo);
      mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);

      const dashBoardWithContactTheCourt = new Dashboard(
        Array.of(new DashboardTaskList('Applications', 'Applications', [
          new DashboardTask('1234',
            'Contact the court to request a change to my case',
            'test',
            'Inactive',
            'test',
            'test',
            DashboardTaskStatus.INACTIVE, 'test'),
        ]),
        ));

      jest.spyOn(CivilServiceClient.prototype, 'retrieveDashboard').mockResolvedValueOnce(dashBoardWithContactTheCourt);

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
        , '2000'
        , '1234567890'
        , appReq
        , false
        , true);

      //Then
      expect(claimantDashboard.items.length).toEqual(0);
    });

    it('Application section when QM LIP is on line and remove GA sections', async () => {

      (isQueryManagementEnabled as jest.Mock).mockReturnValueOnce(true);

      mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);

      const dashBoardWithContactTheCourt = new Dashboard(
        Array.of(new DashboardTaskList('Applications', 'Applications', [
          new DashboardTask('1234',
            'Contact the court to request a change to my case',
            'test',
            'Inactive',
            'test',
            'test',
            DashboardTaskStatus.INACTIVE, 'test'),
        ]),
        new DashboardTaskList('Applications and messages to the court', 'Applications and messages to the court', [
          new DashboardTask('1234',
            'Contact the court to request a change to my case',
            'test',
            'Inactive',
            'test',
            'test',
            DashboardTaskStatus.INACTIVE, 'test'),
        ]),
        ));

      jest.spyOn(CivilServiceClient.prototype, 'retrieveDashboard').mockResolvedValueOnce(dashBoardWithContactTheCourt);

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
        , '2000'
        , '1234567890'
        , appReq
        , false
        , true);

      //Then
      expect(claimantDashboard.items.length).toEqual(0);
    });

    it('Application section when QM LIP is on line and not remove GA sections', async () => {

      (isQueryManagementEnabled as jest.Mock).mockReturnValueOnce(true);

      mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);

      const dashBoardWithContactTheCourt = new Dashboard(
        Array.of(new DashboardTaskList('Test', 'test', [
          new DashboardTask('1234',
            'Contact the court to request a change to my case',
            'test',
            'Inactive',
            'test',
            'test',
            DashboardTaskStatus.INACTIVE, 'test'),
        ]),
        ));

      jest.spyOn(CivilServiceClient.prototype, 'retrieveDashboard').mockResolvedValueOnce(dashBoardWithContactTheCourt);

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
        , '2000'
        , '1234567890'
        , appReq
        , false
        , true);

      //Then
      expect(claimantDashboard.items.length).toEqual(1);
    });

  });

  describe('Sort dashboard notifications', () => {
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
      const claimantNotifications: DashboardNotificationList = await getNotifications('1234567890', claim, '2000', ClaimantOrDefendant.DEFENDANT, appReq, 'en');

      //Then
      expect(claimantNotifications.items).toEqual(allNotificationInfo);

    });

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

  describe('Contact Court Link', () => {
    Array.of(
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
    );
    const claim = new Claim();
    claim.id = '1234567890';
    claim.caseRole = CaseRole.DEFENDANT;
    claim.totalClaimAmount = 900;
    claim.ccdState = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;
    claim.defendantUserDetails = undefined;
    claim.respondentSolicitorDetails = {};
    claim.specRespondent1Represented = YesNoUpperCamelCase.YES;
    claim.caseManagementLocation = {
      region: '2',
      baseLocation: '0909089',
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('Ga is off line', async () => {

      //Given
      (isGaOnline as jest.Mock).mockReturnValue(false);
      //When
      const result = await getContactCourtLink(claim.id, claim, true, 'en');

      //Then
      expect(result).toBeUndefined();
    });

    it('getContactCourtLink when Ga is online', async () => {

      //Given
      const gaInfo = new GaInformation();
      gaInfo.isGaOnline = true;
      (isQueryManagementEnabled as jest.Mock).mockResolvedValue(false);
      (isGaOnline as jest.Mock).mockReturnValue(gaInfo);
      //When
      const result = await getContactCourtLink(claim.id, claim, true, 'en');

      //Then
      expect(result).toEqual({
        text: 'PAGES.DASHBOARD.SUPPORT_LINKS.CONTACT_COURT',
        url: '/case/1234567890/general-application/application-type?linkFrom=start',
        removeTargetBlank: true,
      });
    });

    it('getContactCourtLink when Ga is offline with welsh', async () => {

      //Given
      const gaInfo = new GaInformation();
      gaInfo.isGaOnline = false;
      gaInfo.isGAWelsh = true;
      (isQueryManagementEnabled as jest.Mock).mockResolvedValue(false);
      (isGaOnline as jest.Mock).mockReturnValue(gaInfo);
      //When
      const result = await getContactCourtLink(claim.id, claim, true, 'en');

      //Then
      expect(result).toEqual({
        'text': 'PAGES.DASHBOARD.SUPPORT_LINKS.CONTACT_COURT',
        'url': '/case/1234567890/submit-application-offline',
      });
    });

    it('getContactCourtLink when Ga Lip is on', async () => {

      //Given

      const gaInfo = new GaInformation();
      gaInfo.isGaOnline = false;
      gaInfo.isGAWelsh = true;
      (isQueryManagementEnabled as jest.Mock).mockResolvedValue(true);
      //When
      const result = await getContactCourtLink(claim.id, claim, true, 'en');

      //Then
      expect(result).toEqual({
        'text': 'PAGES.DASHBOARD.SUPPORT_LINKS.CONTACT_APPLY_COURT',
        'url': '/case/1234567890/qm/start?linkFrom=start',
        'removeTargetBlank': true,
      });
    });

    it('getContactCourtLink when Ga Lip is on with PENDING_CASE_ISSUED', async () => {

      //Given
      claim.ccdState = CaseState.PENDING_CASE_ISSUED;

      (isQueryManagementEnabled as jest.Mock).mockResolvedValue(true);
      //When
      const result = await getContactCourtLink(claim.id, claim, true, 'en');

      //Then
      expect(result).toBeUndefined();
    });

    it('getContactCourtLink when Ga Lip is on with CASE_DISMISSED', async () => {

      //Given

      claim.ccdState = CaseState.CASE_DISMISSED;

      (isQueryManagementEnabled as jest.Mock).mockResolvedValue(true);
      //When
      const result = await getContactCourtLink(claim.id, claim, true, 'en');

      //Then
      expect(result).toBeUndefined();
    });

    it('getContactCourtLink when Ga Lip is on with CASE_DISMISSED', async () => {

      //Given

      claim.ccdState = CaseState.PROCEEDS_IN_HERITAGE_SYSTEM;

      (isQueryManagementEnabled as jest.Mock).mockResolvedValue(true);
      //When
      const result = await getContactCourtLink(claim.id, claim, true, 'en');

      //Then
      expect(result).toBeUndefined();
    });

  });
});

