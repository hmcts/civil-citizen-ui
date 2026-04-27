import request from 'supertest';
process.env.NODE_ENV = 'test';
import '../../setup/testSetup';
jest.mock('../../../main/modules/draft-store/draftStoreService', () => ({
  updateFieldDraftClaimFromStore: jest.fn(),
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
import {DASHBOARD_CLAIMANT_URL} from '../../../main/routes/urls';
import {civilServiceClientMock} from '../../setup/sharedMocks';
import {Claim} from '../../../main/common/models/claim';
import {CaseRole} from '../../../main/common/form/models/caseRoles';
import {CaseState} from '../../../main/common/form/models/claimDetails';
import {Dashboard} from '../../../main/common/models/dashboard/dashboard';
import {DashboardTaskList} from '../../../main/common/models/dashboard/taskList/dashboardTaskList';
import {DashboardTask} from '../../../main/common/models/dashboard/taskList/dashboardTask';
import {DashboardNotificationList} from '../../../main/common/models/dashboard/dashboardNotificationList';
import {DashboardNotification} from '../../../main/common/models/dashboard/dashboardNotification';
import {isQueryManagementEnabled} from '../../../main/app/auth/launchdarkly/launchDarklyClient';
import {
  getContactCourtLink,
  getDashboardForm,
  getHelpSupportLinks,
  getHelpSupportTitle,
  getNotifications,
} from '../../../main/services/dashboard/dashboardService';

const buildClaimFixture = (id: string, amount: number): Claim => {
  const claim = new Claim();
  claim.id = id;
  claim.caseRole = CaseRole.CLAIMANT;
  claim.ccdState = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;
  claim.totalClaimAmount = amount;
  claim.specRespondent1Represented = undefined;
  claim.respondentSolicitor1EmailAddress = undefined;
  return claim;
};

const buildTaskList = (): Dashboard =>
  new Dashboard([
    new DashboardTaskList('Claim', 'Claim', [
      new DashboardTask(
        'task-1',
        '<a href="/case/000MC001/claimant-response/task-list" class="govuk-link">Wait for a response</a>',
        '',
        'Action needed',
        '',
        'govuk-tag--red',
        '',
        '',
      ),
    ]),
  ]);

const buildNotificationList = (title: string, descriptionEn: string): DashboardNotificationList =>
  new DashboardNotificationList([
    new DashboardNotification(
      'notification-1',
      title,
      '',
      descriptionEn,
      '',
      '',
      undefined,
      undefined,
      '2026-04-27T00:00:00',
      undefined,
    ),
  ]);

describe('Integration: Claim issue notifications rendered on dashboard', () => {
  beforeEach(() => {
    (getDashboardForm as jest.Mock).mockResolvedValue(buildTaskList());
    (isQueryManagementEnabled as jest.Mock).mockResolvedValue(true);
    (getContactCourtLink as jest.Mock).mockResolvedValue({text: 'Contact the court', url: '/contact-us'});
    (getHelpSupportTitle as jest.Mock).mockReturnValue('Help and support');
    (getHelpSupportLinks as jest.Mock).mockReturnValue([]);
  });

  it.each([
    {
      scenario: 'no interest and no help with fees',
      claim: buildClaimFixture('000MC001', 9000),
      notification: buildNotificationList(
        'You need to pay your claim fee',
        'Your claim has not yet been issued. <a href="/claim/000MC001/fee" class="govuk-link">Pay the claim fee</a>.',
      ),
      expectedText: [
        'You need to pay your claim fee',
        'Pay the claim fee',
        '/claim/000MC001/fee',
      ],
    },
    {
      scenario: 'standard interest and no help with fees',
      claim: buildClaimFixture('000MC002', 1600),
      notification: buildNotificationList(
        'You need to pay your claim fee',
        'The claim includes interest. <a href="/claim/000MC002/fee" class="govuk-link">Pay the claim fee</a>.',
      ),
      expectedText: [
        'The claim includes interest.',
        'Pay the claim fee',
        '/claim/000MC002/fee',
      ],
    },
    {
      scenario: 'variable interest and no help with fees',
      claim: buildClaimFixture('000MC003', 1600),
      notification: buildNotificationList(
        'You need to pay your claim fee',
        'Your variable interest claim is ready. <a href="/claim/000MC003/fee" class="govuk-link">Pay the claim fee</a>.',
      ),
      expectedText: [
        'Your variable interest claim is ready.',
        'Pay the claim fee',
        '/claim/000MC003/fee',
      ],
    },
    {
      scenario: 'help with fees states and wait for response',
      claim: buildClaimFixture('000MC004', 1600),
      notification: buildNotificationList(
        'Your help with fees application has been approved',
        'The full claim fee is covered by remission. <a href="/dashboard/000MC004/claimantNewDesign" class="govuk-link">Wait for defendant to respond</a>.',
      ),
      expectedText: [
        'Your help with fees application has been approved',
        'Wait for defendant to respond',
        '/dashboard/000MC004/claimantNewDesign',
      ],
    },
  ])('renders dashboard notification and next-step links for $scenario', async ({claim, notification, expectedText}) => {
    civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(claim);
    (getNotifications as jest.Mock).mockResolvedValue(notification);

    await request(app)
      .get(DASHBOARD_CLAIMANT_URL.replace(':id', claim.id))
      .expect((res) => {
        expect(res.status).toBe(200);
        for (const content of expectedText) {
          expect(res.text).toContain(content);
        }
        expect(res.text).toContain('Wait for a response');
      });
  });
});
