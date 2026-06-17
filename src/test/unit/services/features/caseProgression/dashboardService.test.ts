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
import {req} from '../../../../utils/UserDetails';
import {CivilServiceClient} from 'client/civilServiceClient';
import {DashboardNotification} from 'models/dashboard/dashboardNotification';
import {Dashboard} from 'models/dashboard/dashboard';
import {DashboardTaskList} from 'models/dashboard/taskList/dashboardTaskList';
import {ClaimantOrDefendant} from 'models/partyType';
import {DashboardTask} from 'models/dashboard/taskList/dashboardTask';
import {DashboardTaskStatus} from 'models/dashboard/taskList/dashboardTaskStatus';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {CaseState} from 'common/form/models/claimDetails';
import {
  isGaForLipsEnabled,
} from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import { plainToInstance } from 'class-transformer';
import {HearingFeeInformation} from 'models/caseProgression/hearingFee/hearingFee';
import {ClaimGeneralApplication, ClaimGeneralApplicationValue} from 'models/generalApplication/claimGeneralApplication';
import {CaseLink} from 'models/generalApplication/CaseLink';
import {CaseProgressionHearing} from 'models/caseProgression/caseProgressionHearing';
import {FIXED_DATE} from '../../../../utils/dateUtils';

jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');
const appReq = <AppRequest>req;
appReq.params = {id: '123'};

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));
jest.mock('../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

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
    });

    it('should remove legacy general application sections from the dashboard', async () => {

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
        , false);

      //Then
      expect(claimantDashboard.items.length).toEqual(0);
    });

    it('should retain dashboard sections that are not legacy general application sections', async () => {

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
        , false);

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
      claim.ccdState = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;
    });

    it('getContactCourtLink returns the query management start link', async () => {
      //When
      const result = await getContactCourtLink(claim.id, claim, 'en');

      //Then
      expect(result).toEqual({
        'text': 'PAGES.DASHBOARD.SUPPORT_LINKS.CONTACT_APPLY_COURT',
        'url': '/case/1234567890/qm/start?linkFrom=start',
        'removeTargetBlank': true,
      });
    });

    it('getContactCourtLink returns undefined with PENDING_CASE_ISSUED', async () => {

      //Given
      claim.ccdState = CaseState.PENDING_CASE_ISSUED;

      //When
      const result = await getContactCourtLink(claim.id, claim, 'en');

      //Then
      expect(result).toBeUndefined();
    });

    it('getContactCourtLink returns undefined with CASE_DISMISSED', async () => {

      //Given

      claim.ccdState = CaseState.CASE_DISMISSED;

      //When
      const result = await getContactCourtLink(claim.id, claim, 'en');

      //Then
      expect(result).toBeUndefined();
    });

    it('getContactCourtLink returns undefined with PROCEEDS_IN_HERITAGE_SYSTEM', async () => {

      //Given

      claim.ccdState = CaseState.PROCEEDS_IN_HERITAGE_SYSTEM;

      //When
      const result = await getContactCourtLink(claim.id, claim, 'en');

      //Then
      expect(result).toBeUndefined();
    });

  });
});
