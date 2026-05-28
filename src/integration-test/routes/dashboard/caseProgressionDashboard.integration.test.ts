import request from 'supertest';
process.env.NODE_ENV = 'test';
import '../../setup/testSetup';
jest.mock('../../../main/modules/draft-store/draftStoreService', () => ({
  updateFieldDraftClaimFromStore: jest.fn(),
}));
jest.mock('services/caseDocuments/documentService', () => ({
  saveDocumentsToExistingClaim: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('services/features/response/submitConfirmation/submitConfirmationService', () => ({
  getClaimWithExtendedPaymentDeadline: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../../main/services/dashboard/dashboardService', () => ({
  getNotifications: jest.fn(),
  getDashboardForm: jest.fn(),
  extractOrderDocumentIdFromNotification: jest.fn(),
  getContactCourtLink: jest.fn(),
  getHelpSupportTitle: jest.fn(),
  getHelpSupportLinks: jest.fn(),
}));
import {app} from '../../../main/app';
import {DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL} from '../../../main/routes/urls';
import {civilServiceClientMock} from '../../setup/sharedMocks';
import {CaseRole} from '../../../main/common/form/models/caseRoles';
import {
  isCarmEnabledForCase,
  isDashboardEnabledForCase,
  isQueryManagementEnabled,
} from '../../../main/app/auth/launchdarkly/launchDarklyClient';
import {
  extractOrderDocumentIdFromNotification,
  getContactCourtLink,
  getDashboardForm,
  getHelpSupportLinks,
  getHelpSupportTitle,
  getNotifications,
} from '../../../main/services/dashboard/dashboardService';
import {
  buildCaseProgressionClaim,
  buildCpHearingTaskList,
  buildLegacyCaseProgressionClaim,
  buildNotificationList,
  buildNotificationListFromItems,
  CaseProgressionTrack,
  CP_NOTIFICATIONS,
  cpTaskPaths,
  expectTaskNearStatus,
  joinNotificationHtml,
} from './fixtures/caseProgressionDashboardFixtures';

const tracks: CaseProgressionTrack[] = ['SMALL_CLAIM', 'FAST_CLAIM'];

const dashboardUrlForRole = (claimId: string, caseRole: CaseRole): string =>
  caseRole === CaseRole.CLAIMANT
    ? DASHBOARD_CLAIMANT_URL.replace(':id', claimId)
    : DEFENDANT_SUMMARY_URL.replace(':id', claimId);

describe('Integration: case progression dashboard', () => {
  beforeEach(() => {
    (getContactCourtLink as jest.Mock).mockResolvedValue({text: 'Contact the court', url: '/contact-us'});
    (getHelpSupportTitle as jest.Mock).mockReturnValue('Help and support');
    (getHelpSupportLinks as jest.Mock).mockReturnValue([]);
    (isQueryManagementEnabled as jest.Mock).mockResolvedValue(true);
    (isCarmEnabledForCase as jest.Mock).mockResolvedValue(false);
    (isDashboardEnabledForCase as jest.Mock).mockResolvedValue(true);
    (extractOrderDocumentIdFromNotification as jest.Mock).mockReturnValue(undefined);
  });

  describe('redesign dashboard notifications and task list', () => {
    describe.each(tracks)('%s track', (track) => {
      it.each([
        {party: 'claimant', caseRole: CaseRole.CLAIMANT},
        {party: 'defendant', caseRole: CaseRole.DEFENDANT},
      ])('$party: bundle ready notification and view bundle task', async ({caseRole}) => {
        const claimId = `CP-BND-${track}-${caseRole}`.replace(/[^A-Z0-9-]/gi, '');
        const claim = buildCaseProgressionClaim(claimId, caseRole, track);
        const bundleHref = cpTaskPaths.viewBundle.replace(':id', claimId);

        civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(claim);
        (getNotifications as jest.Mock).mockResolvedValue(
          buildNotificationList(
            CP_NOTIFICATIONS.bundleReady.title,
            joinNotificationHtml([CP_NOTIFICATIONS.bundleReady.content]),
          ),
        );
        (getDashboardForm as jest.Mock).mockResolvedValue(
          buildCpHearingTaskList(claimId, [
            {label: 'View the bundle', status: 'Available', path: cpTaskPaths.viewBundle},
          ]),
        );

        const res = await request(app).get(dashboardUrlForRole(claimId, caseRole)).expect(200);

        expect(res.text).toContain(CP_NOTIFICATIONS.bundleReady.title);
        expect(res.text).toContain(CP_NOTIFICATIONS.bundleReady.content);
        expectTaskNearStatus(res.text, 'View the bundle', 'Available');
        expect(res.text).toContain(bundleHref);
      });

      it.each([
        {party: 'claimant', caseRole: CaseRole.CLAIMANT},
        {party: 'defendant', caseRole: CaseRole.DEFENDANT},
      ])('$party: order made notification and view orders task', async ({caseRole}) => {
        const claimId = `CP-ORD-${track}-${caseRole}`.replace(/[^A-Z0-9-]/gi, '');
        const claim = buildCaseProgressionClaim(claimId, caseRole, track);
        const ordersHref = cpTaskPaths.viewOrders.replace(':id', claimId);

        civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(claim);
        (getNotifications as jest.Mock).mockResolvedValue(
          buildNotificationList(
            CP_NOTIFICATIONS.orderMade.title,
            joinNotificationHtml([CP_NOTIFICATIONS.orderMade.content]),
          ),
        );
        (getDashboardForm as jest.Mock).mockResolvedValue(
          buildCpHearingTaskList(claimId, [
            {label: 'View orders and notices', status: 'Available', path: cpTaskPaths.viewOrders},
          ]),
        );

        const res = await request(app).get(dashboardUrlForRole(claimId, caseRole)).expect(200);

        expect(res.text).toContain(CP_NOTIFICATIONS.orderMade.title);
        expect(res.text).toContain(CP_NOTIFICATIONS.orderMade.content);
        expectTaskNearStatus(res.text, 'View orders and notices', 'Available');
        expect(res.text).toContain(ordersHref);
      });

      it.each([
        {party: 'claimant', caseRole: CaseRole.CLAIMANT},
        {party: 'defendant', caseRole: CaseRole.DEFENDANT},
      ])('$party: claim struck out notification and inactive hearing tasks', async ({caseRole}) => {
        const claimId = `CP-STK-${track}-${caseRole}`.replace(/[^A-Z0-9-]/gi, '');
        const claim = buildCaseProgressionClaim(claimId, caseRole, track);

        civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(claim);
        (getNotifications as jest.Mock).mockResolvedValue(
          buildNotificationList(
            CP_NOTIFICATIONS.claimStruckOut.title,
            joinNotificationHtml([CP_NOTIFICATIONS.claimStruckOut.content]),
          ),
        );
        (getDashboardForm as jest.Mock).mockResolvedValue(
          buildCpHearingTaskList(claimId, [
            {label: 'Add the trial arrangements', status: 'Inactive', path: cpTaskPaths.addTrialArrangements},
            {label: 'Upload hearing documents', status: 'Inactive', path: cpTaskPaths.uploadHearingDocuments},
          ]),
        );

        const res = await request(app).get(dashboardUrlForRole(claimId, caseRole)).expect(200);

        expect(res.text).toContain(CP_NOTIFICATIONS.claimStruckOut.title);
        expect(res.text).toContain(CP_NOTIFICATIONS.claimStruckOut.content);
        expectTaskNearStatus(res.text, 'Add the trial arrangements', 'Inactive');
        expectTaskNearStatus(res.text, 'Upload hearing documents', 'Inactive');
      });

      it.each([
        {party: 'claimant', caseRole: CaseRole.CLAIMANT},
        {party: 'defendant', caseRole: CaseRole.DEFENDANT},
      ])('$party: evidence upload available and upload task action needed', async ({caseRole}) => {
        const claimId = `CP-UPL-${track}-${caseRole}`.replace(/[^A-Z0-9-]/gi, '');
        const claim = buildCaseProgressionClaim(claimId, caseRole, track);
        const uploadHref = cpTaskPaths.uploadHearingDocuments.replace(':id', claimId);

        civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(claim);
        (getNotifications as jest.Mock).mockResolvedValue(
          buildNotificationList(
            CP_NOTIFICATIONS.uploadDocuments.title,
            joinNotificationHtml([CP_NOTIFICATIONS.uploadDocuments.content]),
          ),
        );
        (getDashboardForm as jest.Mock).mockResolvedValue(
          buildCpHearingTaskList(claimId, [
            {label: 'Upload hearing documents', status: 'Action needed', path: cpTaskPaths.uploadHearingDocuments},
          ]),
        );

        const res = await request(app).get(dashboardUrlForRole(claimId, caseRole)).expect(200);

        expect(res.text).toContain(CP_NOTIFICATIONS.uploadDocuments.title);
        expectTaskNearStatus(res.text, 'Upload hearing documents', 'Action needed');
        expect(res.text).toContain(uploadHref);
      });

      it.each([
        {party: 'claimant', caseRole: CaseRole.CLAIMANT},
        {party: 'defendant', caseRole: CaseRole.DEFENDANT},
      ])('$party: evidence upload done shows view documents available', async ({caseRole}) => {
        const claimId = `CP-VWD-${track}-${caseRole}`.replace(/[^A-Z0-9-]/gi, '');
        const claim = buildCaseProgressionClaim(claimId, caseRole, track);

        civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(claim);
        (getNotifications as jest.Mock).mockResolvedValue(buildNotificationList('Documents uploaded', 'Your documents have been uploaded.'));
        (getDashboardForm as jest.Mock).mockResolvedValue(
          buildCpHearingTaskList(claimId, [
            {label: 'Upload hearing documents', status: 'Done', path: cpTaskPaths.uploadHearingDocuments},
            {label: 'View documents', status: 'Available', path: cpTaskPaths.viewDocuments},
          ]),
        );

        const res = await request(app).get(dashboardUrlForRole(claimId, caseRole)).expect(200);

        expectTaskNearStatus(res.text, 'Upload hearing documents', 'Done');
        expectTaskNearStatus(res.text, 'View documents', 'Available');
      });

      it.each([
        {party: 'claimant', caseRole: CaseRole.CLAIMANT},
        {party: 'defendant', caseRole: CaseRole.DEFENDANT},
      ])('$party: hearing scheduled notification and view hearing task', async ({caseRole}) => {
        const claimId = `CP-HRG-${track}-${caseRole}`.replace(/[^A-Z0-9-]/gi, '');
        const claim = buildCaseProgressionClaim(claimId, caseRole, track);
        const hearingHref = cpTaskPaths.viewHearing.replace(':id', claimId);

        civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(claim);
        (getNotifications as jest.Mock).mockResolvedValue(
          buildNotificationList(
            CP_NOTIFICATIONS.hearingScheduled.title,
            joinNotificationHtml([CP_NOTIFICATIONS.hearingScheduled.content]),
          ),
        );
        (getDashboardForm as jest.Mock).mockResolvedValue(
          buildCpHearingTaskList(claimId, [
            {label: 'View the hearing', status: 'Available', path: cpTaskPaths.viewHearing},
          ]),
        );

        const res = await request(app).get(dashboardUrlForRole(claimId, caseRole)).expect(200);

        expect(res.text).toContain(CP_NOTIFICATIONS.hearingScheduled.title);
        expect(res.text).toContain('26 April 2023');
        expectTaskNearStatus(res.text, 'View the hearing', 'Available');
        expect(res.text).toContain(hearingHref);
      });

      it.each([
        {party: 'claimant', caseRole: CaseRole.CLAIMANT},
        {party: 'defendant', caseRole: CaseRole.DEFENDANT},
      ])('$party: trial arrangements notifications and task states', async ({caseRole}) => {
        const claimId = `CP-TRL-${track}-${caseRole}`.replace(/[^A-Z0-9-]/gi, '');
        const claim = buildCaseProgressionClaim(claimId, caseRole, track);
        const trialHref = cpTaskPaths.addTrialArrangements.replace(':id', claimId);

        civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(claim);
        (getNotifications as jest.Mock).mockResolvedValue(
          buildNotificationListFromItems([
            {
              title: CP_NOTIFICATIONS.otherSideTrialArrangements.title,
              descriptionEn: joinNotificationHtml([CP_NOTIFICATIONS.otherSideTrialArrangements.content]),
            },
            {
              title: CP_NOTIFICATIONS.confirmTrialArrangements.title,
              descriptionEn: joinNotificationHtml([CP_NOTIFICATIONS.confirmTrialArrangements.content]),
            },
          ]),
        );
        (getDashboardForm as jest.Mock).mockResolvedValue(
          buildCpHearingTaskList(claimId, [
            {label: 'Add the trial arrangements', status: 'Action needed', path: cpTaskPaths.addTrialArrangements},
          ]),
        );

        const res = await request(app).get(dashboardUrlForRole(claimId, caseRole)).expect(200);

        expect(res.text).toContain(CP_NOTIFICATIONS.otherSideTrialArrangements.title);
        expect(res.text).toContain(CP_NOTIFICATIONS.confirmTrialArrangements.title);
        expectTaskNearStatus(res.text, 'Add the trial arrangements', 'Action needed');
        expect(res.text).toContain(trialHref);
      });
    });
  });

  describe('latest-update sections built from claim fixtures (no live CCD)', () => {
    const {getCaseProgressionLatestUpdates} = jest.requireActual(
      'services/features/dashboard/claimSummary/latestUpdate/caseProgression/caseProgressionLatestUpdateService',
    );

    describe.each(tracks)('%s track', (track) => {
      it('defendant: struck-out update when hearing fee not paid', () => {
        const claim = buildLegacyCaseProgressionClaim('CP-LST-STK', CaseRole.DEFENDANT, track, {
          struckOut: true,
          withHearing: true,
        });

        const updates = getCaseProgressionLatestUpdates(claim, 'en');

        expect(updates).toHaveLength(1);
        expect(updates[0].contentSections[0].data.text).toBe(
          'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.CASE_DISMISSED_HEARING_DUE_DATE.TITLE',
        );
      });

      it('defendant: hearing notice and evidence upload sections when hearing scheduled', () => {
        const claim = buildLegacyCaseProgressionClaim('CP-LST-HRG', CaseRole.DEFENDANT, track, {
          withHearing: true,
        });

        const updates = getCaseProgressionLatestUpdates(claim, 'en');
        const hearingTitleKey =
          track === 'FAST_CLAIM'
            ? 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.TRIAL_HEARING_CONTENT.YOUR_TRIAL_TITLE'
            : 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.TRIAL_HEARING_CONTENT.YOUR_HEARING_TITLE';

        expect(updates.length).toBeGreaterThanOrEqual(2);
        expect(updates[0].contentSections[0].data.text).toBe(hearingTitleKey);
        expect(updates[updates.length - 1].contentSections[0].data.text).toBe(
          'PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.TITLE',
        );
      });

      it('defendant: bundle section when trial bundle is stitched', () => {
        const claim = buildLegacyCaseProgressionClaim('CP-LST-BND', CaseRole.DEFENDANT, track, {
          withHearing: true,
          withBundle: true,
        });

        const updates = getCaseProgressionLatestUpdates(claim, 'en');

        expect(updates[0].contentSections[0].data.text).toBe(
          'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.BUNDLE.TITLE',
        );
      });
    });
  });
});
