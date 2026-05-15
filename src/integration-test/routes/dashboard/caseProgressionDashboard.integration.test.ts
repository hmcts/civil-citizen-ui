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
import {
  BUNDLES_URL,
  CP_FINALISE_TRIAL_ARRANGEMENTS_URL,
  DASHBOARD_CLAIMANT_URL,
  DEFENDANT_SUMMARY_URL,
  EVIDENCE_UPLOAD_DOCUMENTS_URL,
  UPLOAD_YOUR_DOCUMENTS_URL,
  VIEW_ORDERS_AND_NOTICES_URL,
  VIEW_THE_HEARING_URL,
} from '../../../main/routes/urls';
import {civilServiceClientMock} from '../../setup/sharedMocks';
import {Claim} from '../../../main/common/models/claim';
import {CaseRole} from '../../../main/common/form/models/caseRoles';
import {CaseState} from '../../../main/common/form/models/claimDetails';
import {Party} from '../../../main/common/models/party';
import {PartyType} from '../../../main/common/models/partyType';
import {PartyDetails} from '../../../main/common/form/models/partyDetails';
import {claimType} from '../../../main/common/form/models/claimType';
import {Dashboard} from '../../../main/common/models/dashboard/dashboard';
import {DashboardTaskList} from '../../../main/common/models/dashboard/taskList/dashboardTaskList';
import {DashboardTask} from '../../../main/common/models/dashboard/taskList/dashboardTask';
import {DashboardNotificationList} from '../../../main/common/models/dashboard/dashboardNotificationList';
import {DashboardNotification} from '../../../main/common/models/dashboard/dashboardNotification';
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

const orderMadeNotification = {
  title: 'An order has been made',
  content: ['The judge has made an order on your claim.'],
  nextStepLabel: 'View the order',
};

const bundleReadyNotification = {
  title: 'The bundle is ready to view',
  content: [
    'The bundle contains all the documents that will be referred to at the hearing. Review the bundle to ensure that the information is accurate.',
  ],
  nextStepLabel: 'Review the bundle',
};

const claimStruckOutNotification = {
  title: 'The claim has been struck out',
  content: ['This is because the hearing fee was not paid by 10 November 2023 as stated in the hearing notice.'],
};

const uploadDocumentsNotification = {
  title: 'Upload documents',
  content: [
    'You can upload and submit documents to support your defence. Follow the instructions set out in the directions order. Any documents submitted after the deadlines in the directions order may not be considered by the judge.',
  ],
};

const confirmTrialArrangementsNotification = {
  title: 'Confirm your trial arrangements',
  content: [
    'You must confirm your trial arrangements by 5 April 2026. This means that you\'ll need to confirm if the case is ready for trial or not.',
  ],
  nextStepLabel: 'confirm your trial arrangements',
};

const orderMadeLaNotification = {
  title: 'An order has been made on this claim',
  content: [
    'You need to carefully read and review this order. If you don\'t agree with something in the order you can ask the court to review it.',
  ],
};

const hearingScheduledNotification = {
  title: 'A hearing has been scheduled',
  content: [
    'Your hearing has been scheduled for 20 June 2026 at Central London County Court. Please keep your contact details and anyone you wish to rely on in court up to date.',
  ],
  nextStepLabel: 'View the hearing notice',
};

const otherSideTrialArrangementsNotification = {
  title: 'The other side has confirmed their trial arrangements',
  content: ['You can view the arrangements that they\'ve confirmed.'],
};

type TrackConfig = {track: claimType; amount: number; label: string};

const smallClaimTrack: TrackConfig = {track: claimType.SMALL_CLAIM, amount: 900, label: 'small claim'};
const fastClaimTrack: TrackConfig = {track: claimType.FAST_CLAIM, amount: 15000, label: 'fast track'};

const joinNotificationHtml = (paragraphs: string[]): string =>
  paragraphs.map((p) => `<p class="govuk-body">${p}</p>`).join('');

const buildNotificationList = (title: string, descriptionEn: string): DashboardNotificationList =>
  new DashboardNotificationList([
    new DashboardNotification(
      'notification-cp-1',
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

const buildParties = () => {
  const applicant1 = Object.assign(new Party(), {
    type: PartyType.INDIVIDUAL,
    partyDetails: new PartyDetails({firstName: 'Alice', lastName: 'Claimant'}),
  });
  const respondent1 = Object.assign(new Party(), {
    type: PartyType.INDIVIDUAL,
    partyDetails: new PartyDetails({firstName: 'Bob', lastName: 'Defendant'}),
  });
  return {applicant1, respondent1};
};

const buildBaseClaim = (id: string, caseRole: CaseRole, trackConfig: TrackConfig): Claim => {
  const claim = new Claim();
  const {applicant1, respondent1} = buildParties();
  claim.id = id;
  claim.caseRole = caseRole;
  claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
  claim.totalClaimAmount = trackConfig.amount;
  claim.responseClaimTrack = trackConfig.track;
  claim.submittedDate = new Date('2026-01-15');
  claim.applicant1 = applicant1;
  claim.respondent1 = respondent1;
  claim.specRespondent1Represented = undefined;
  claim.respondentSolicitor1EmailAddress = undefined;
  return claim;
};

const buildHearingTasks = (tasks: Array<{id: string; nameHtml: string; status: string}>): Dashboard =>
  new Dashboard([
    new DashboardTaskList('The claim', 'The claim', []),
    new DashboardTaskList('Mediation', 'Mediation', []),
    new DashboardTaskList('Hearing', 'Hearing', tasks.map((task) =>
      new DashboardTask(task.id, task.nameHtml, '', task.status, '', 'govuk-tag--grey', '', ''),
    )),
  ]);

const expectTaskNearStatus = (html: string, taskSnippet: string, status: string): void => {
  const idx = html.indexOf(taskSnippet);
  expect(idx).toBeGreaterThan(-1);
  expect(html.slice(idx, idx + 2500)).toContain(status);
};

const getDashboardUrl = (caseRole: CaseRole, claimId: string): string =>
  caseRole === CaseRole.CLAIMANT
    ? DASHBOARD_CLAIMANT_URL.replace(':id', claimId)
    : DEFENDANT_SUMMARY_URL.replace(':id', claimId);

describe('Integration: case progression dashboard notifications and task list', () => {
  beforeEach(() => {
    (getContactCourtLink as jest.Mock).mockResolvedValue({text: 'Contact the court', url: '/contact-us'});
    (getHelpSupportTitle as jest.Mock).mockReturnValue('Help and support');
    (getHelpSupportLinks as jest.Mock).mockReturnValue([]);
    (isQueryManagementEnabled as jest.Mock).mockResolvedValue(true);
    (isCarmEnabledForCase as jest.Mock).mockResolvedValue(false);
    (isDashboardEnabledForCase as jest.Mock).mockResolvedValue(false);
    (extractOrderDocumentIdFromNotification as jest.Mock).mockReturnValue(undefined);
  });

  describe.each([
    {caseRole: CaseRole.CLAIMANT, track: smallClaimTrack},
    {caseRole: CaseRole.CLAIMANT, track: fastClaimTrack},
    {caseRole: CaseRole.DEFENDANT, track: smallClaimTrack},
    {caseRole: CaseRole.DEFENDANT, track: fastClaimTrack},
  ])('$caseRole $track.label dashboard', ({caseRole, track}) => {
    beforeEach(() => {
      if (caseRole === CaseRole.DEFENDANT) {
        (isDashboardEnabledForCase as jest.Mock).mockResolvedValue(true);
      }
    });

    it('order made notification and view orders and notices task', async () => {
      const claimId = `000MC-CP-ORD-${caseRole}-${track.track}`;
      const claim = buildBaseClaim(claimId, caseRole, track);
      const ordersHref = VIEW_ORDERS_AND_NOTICES_URL.replace(':id', claimId);

      civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(claim);
      (getNotifications as jest.Mock).mockResolvedValue(
        buildNotificationList(orderMadeNotification.title, joinNotificationHtml(orderMadeNotification.content)),
      );
      (getDashboardForm as jest.Mock).mockResolvedValue(
        buildHearingTasks([
          {
            id: 'orders',
            status: 'Available',
            nameHtml: `<a href="${ordersHref}" class="govuk-link">View orders and notices</a>`,
          },
        ]),
      );

      const res = await request(app).get(getDashboardUrl(caseRole, claimId)).expect(200);

      expect(res.text).toContain(orderMadeNotification.title);
      for (const line of orderMadeNotification.content) {
        expect(res.text).toContain(line);
      }
      expectTaskNearStatus(res.text, 'View orders and notices', 'Available');
      expect(res.text).toContain(ordersHref);
    });

    it('bundle ready notification and view the bundle task', async () => {
      const claimId = `000MC-CP-BND-${caseRole}-${track.track}`;
      const claim = buildBaseClaim(claimId, caseRole, track);
      const bundleHref = BUNDLES_URL.replace(':id', claimId);

      civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(claim);
      (getNotifications as jest.Mock).mockResolvedValue(
        buildNotificationList(bundleReadyNotification.title, joinNotificationHtml(bundleReadyNotification.content)),
      );
      (getDashboardForm as jest.Mock).mockResolvedValue(
        buildHearingTasks([
          {
            id: 'bundle',
            status: 'Available',
            nameHtml: `<a href="${bundleHref}" class="govuk-link">View the bundle</a>`,
          },
        ]),
      );

      const res = await request(app).get(getDashboardUrl(caseRole, claimId)).expect(200);

      expect(res.text).toContain(bundleReadyNotification.title);
      for (const line of bundleReadyNotification.content) {
        expect(res.text).toContain(line);
      }
      expectTaskNearStatus(res.text, 'View the bundle', 'Available');
      expect(res.text).toContain(bundleHref);
    });
  });

  it.each([
    {caseRole: CaseRole.CLAIMANT, track: smallClaimTrack},
    {caseRole: CaseRole.DEFENDANT, track: smallClaimTrack},
  ])('$caseRole order made (LA) and upload hearing documents action needed', async ({caseRole, track}) => {
    if (caseRole === CaseRole.DEFENDANT) {
      (isDashboardEnabledForCase as jest.Mock).mockResolvedValue(true);
    }

    const claimId = `000MC-CP-ORDLA-${caseRole}`;
    const claim = buildBaseClaim(claimId, caseRole, track);
    const uploadHref = UPLOAD_YOUR_DOCUMENTS_URL.replace(':id', claimId);

    civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(claim);
    (getNotifications as jest.Mock).mockResolvedValue(
      buildNotificationList(orderMadeLaNotification.title, joinNotificationHtml(orderMadeLaNotification.content)),
    );
    (getDashboardForm as jest.Mock).mockResolvedValue(
      buildHearingTasks([
        {
          id: 'upload-hearing',
          status: 'Action needed',
          nameHtml: `<a href="${uploadHref}" class="govuk-link">Upload hearing documents</a>`,
        },
      ]),
    );

    const res = await request(app).get(getDashboardUrl(caseRole, claimId)).expect(200);

    expect(res.text).toContain(orderMadeLaNotification.title);
    expectTaskNearStatus(res.text, 'Upload hearing documents', 'Action needed');
  });

  it.each([
    {caseRole: CaseRole.CLAIMANT, track: smallClaimTrack},
    {caseRole: CaseRole.DEFENDANT, track: smallClaimTrack},
  ])('$caseRole hearing scheduled notification and view the hearing task', async ({caseRole, track}) => {
    if (caseRole === CaseRole.DEFENDANT) {
      (isDashboardEnabledForCase as jest.Mock).mockResolvedValue(true);
    }

    const claimId = `000MC-CP-HSCH-${caseRole}`;
    const claim = buildBaseClaim(claimId, caseRole, track);
    const hearingHref = VIEW_THE_HEARING_URL.replace(':id', claimId);

    civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(claim);
    (getNotifications as jest.Mock).mockResolvedValue(
      buildNotificationList(hearingScheduledNotification.title, joinNotificationHtml(hearingScheduledNotification.content)),
    );
    (getDashboardForm as jest.Mock).mockResolvedValue(
      buildHearingTasks([
        {
          id: 'view-hearing',
          status: 'Available',
          nameHtml: `<a href="${hearingHref}" class="govuk-link">View the hearing</a>`,
        },
      ]),
    );

    const res = await request(app).get(getDashboardUrl(caseRole, claimId)).expect(200);

    expect(res.text).toContain(hearingScheduledNotification.title);
    expectTaskNearStatus(res.text, 'View the hearing', 'Available');
    expect(res.text).toContain(hearingHref);
  });

  it('claimant fast track other side trial arrangements notification', async () => {
    const claimId = '000MC-CP-OTH-CLM-FT';
    const claim = buildBaseClaim(claimId, CaseRole.CLAIMANT, fastClaimTrack);

    civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(claim);
    (getNotifications as jest.Mock).mockResolvedValue(
      buildNotificationList(
        otherSideTrialArrangementsNotification.title,
        joinNotificationHtml(otherSideTrialArrangementsNotification.content),
      ),
    );
    (getDashboardForm as jest.Mock).mockResolvedValue(buildHearingTasks([]));

    const res = await request(app).get(DASHBOARD_CLAIMANT_URL.replace(':id', claimId)).expect(200);

    expect(res.text).toContain(otherSideTrialArrangementsNotification.title);
    expect(res.text).toContain(otherSideTrialArrangementsNotification.content[0]);
  });

  it.each([
    {caseRole: CaseRole.CLAIMANT, track: smallClaimTrack},
    {caseRole: CaseRole.DEFENDANT, track: smallClaimTrack},
  ])('$caseRole struck out notification sets upload hearing documents inactive', async ({caseRole, track}) => {
    if (caseRole === CaseRole.DEFENDANT) {
      (isDashboardEnabledForCase as jest.Mock).mockResolvedValue(true);
    }

    const claimId = `000MC-CP-STK-${caseRole}`;
    const claim = buildBaseClaim(claimId, caseRole, track);
    const uploadHref = UPLOAD_YOUR_DOCUMENTS_URL.replace(':id', claimId);

    civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(claim);
    (getNotifications as jest.Mock).mockResolvedValue(
      buildNotificationList(claimStruckOutNotification.title, joinNotificationHtml(claimStruckOutNotification.content)),
    );
    (getDashboardForm as jest.Mock).mockResolvedValue(
      buildHearingTasks([
        {
          id: 'upload-hearing',
          status: 'Inactive',
          nameHtml: `<a href="${uploadHref}" class="govuk-link">Upload hearing documents</a>`,
        },
      ]),
    );

    const res = await request(app).get(getDashboardUrl(caseRole, claimId)).expect(200);

    expect(res.text).toContain(claimStruckOutNotification.title);
    expectTaskNearStatus(res.text, 'Upload hearing documents', 'Inactive');
  });

  it.each([
    {caseRole: CaseRole.CLAIMANT, track: fastClaimTrack},
    {caseRole: CaseRole.DEFENDANT, track: fastClaimTrack},
  ])('$caseRole fast track struck out sets hearing tasks inactive', async ({caseRole, track}) => {
    if (caseRole === CaseRole.DEFENDANT) {
      (isDashboardEnabledForCase as jest.Mock).mockResolvedValue(true);
    }

    const claimId = `000MC-CP-STK-FT-${caseRole}`;
    const claim = buildBaseClaim(claimId, caseRole, track);
    const uploadHref = UPLOAD_YOUR_DOCUMENTS_URL.replace(':id', claimId);
    const trialHref = CP_FINALISE_TRIAL_ARRANGEMENTS_URL.replace(':id', claimId);

    civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(claim);
    (getNotifications as jest.Mock).mockResolvedValue(
      buildNotificationList(claimStruckOutNotification.title, joinNotificationHtml(claimStruckOutNotification.content)),
    );
    (getDashboardForm as jest.Mock).mockResolvedValue(
      buildHearingTasks([
        {
          id: 'trial-arrangements',
          status: 'Inactive',
          nameHtml: `<a href="${trialHref}" class="govuk-link">Add the trial arrangements</a>`,
        },
        {
          id: 'upload-hearing',
          status: 'Inactive',
          nameHtml: `<a href="${uploadHref}" class="govuk-link">Upload hearing documents</a>`,
        },
      ]),
    );

    const res = await request(app).get(getDashboardUrl(caseRole, claimId)).expect(200);

    expect(res.text).toContain(claimStruckOutNotification.title);
    expectTaskNearStatus(res.text, 'Add the trial arrangements', 'Inactive');
    expectTaskNearStatus(res.text, 'Upload hearing documents', 'Inactive');
  });

  it('defendant upload documents notification and upload hearing documents action needed', async () => {
    const claimId = '000MC-CP-UPL-DEF-SC';
    const claim = buildBaseClaim(claimId, CaseRole.DEFENDANT, smallClaimTrack);
    (isDashboardEnabledForCase as jest.Mock).mockResolvedValue(true);

    const uploadHref = UPLOAD_YOUR_DOCUMENTS_URL.replace(':id', claimId);

    civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(claim);
    (getNotifications as jest.Mock).mockResolvedValue(
      buildNotificationList(uploadDocumentsNotification.title, joinNotificationHtml(uploadDocumentsNotification.content)),
    );
    (getDashboardForm as jest.Mock).mockResolvedValue(
      buildHearingTasks([
        {
          id: 'upload-hearing',
          status: 'Action needed',
          nameHtml: `<a href="${uploadHref}" class="govuk-link">Upload hearing documents</a>`,
        },
      ]),
    );

    const res = await request(app).get(DEFENDANT_SUMMARY_URL.replace(':id', claimId)).expect(200);

    expect(res.text).toContain(uploadDocumentsNotification.title);
    expectTaskNearStatus(res.text, 'Upload hearing documents', 'Action needed');
    expect(res.text).toContain(uploadHref);
  });

  it('defendant view documents available after evidence upload', async () => {
    const claimId = '000MC-CP-VIEW-DEF-SC';
    const claim = buildBaseClaim(claimId, CaseRole.DEFENDANT, smallClaimTrack);
    (isDashboardEnabledForCase as jest.Mock).mockResolvedValue(true);

    const uploadHref = UPLOAD_YOUR_DOCUMENTS_URL.replace(':id', claimId);
    const viewDocsHref = EVIDENCE_UPLOAD_DOCUMENTS_URL.replace(':id', claimId);

    civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(claim);
    (getNotifications as jest.Mock).mockResolvedValue(new DashboardNotificationList([]));
    (getDashboardForm as jest.Mock).mockResolvedValue(
      buildHearingTasks([
        {
          id: 'upload-hearing',
          status: 'In progress',
          nameHtml: `<a href="${uploadHref}" class="govuk-link">Upload hearing documents</a>`,
        },
        {
          id: 'view-docs',
          status: 'Available',
          nameHtml: `<a href="${viewDocsHref}" class="govuk-link">View documents</a>`,
        },
      ]),
    );

    const res = await request(app).get(DEFENDANT_SUMMARY_URL.replace(':id', claimId)).expect(200);

    expectTaskNearStatus(res.text, 'Upload hearing documents', 'In progress');
    expectTaskNearStatus(res.text, 'View documents', 'Available');
    expect(res.text).toContain(viewDocsHref);
  });

  it.each([
    {caseRole: CaseRole.CLAIMANT, track: fastClaimTrack},
    {caseRole: CaseRole.DEFENDANT, track: fastClaimTrack},
  ])('$caseRole fast track trial arrangements notification and task', async ({caseRole, track}) => {
    if (caseRole === CaseRole.DEFENDANT) {
      (isDashboardEnabledForCase as jest.Mock).mockResolvedValue(true);
    }

    const claimId = `000MC-CP-TRL-${caseRole}`;
    const claim = buildBaseClaim(claimId, caseRole, track);
    const trialHref = CP_FINALISE_TRIAL_ARRANGEMENTS_URL.replace(':id', claimId);
    const hearingHref = VIEW_THE_HEARING_URL.replace(':id', claimId);
    const description = `${confirmTrialArrangementsNotification.content[0]} <a href="${trialHref}" class="govuk-link">${confirmTrialArrangementsNotification.nextStepLabel}</a>`;

    civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(claim);
    (getNotifications as jest.Mock).mockResolvedValue(
      buildNotificationList(confirmTrialArrangementsNotification.title, description),
    );
    (getDashboardForm as jest.Mock).mockResolvedValue(
      buildHearingTasks([
        {
          id: 'trial-arrangements',
          status: 'Action needed',
          nameHtml: `<a href="${trialHref}" class="govuk-link">Add the trial arrangements</a>`,
        },
        {
          id: 'view-hearing',
          status: 'Available',
          nameHtml: `<a href="${hearingHref}" class="govuk-link">View the hearing</a>`,
        },
      ]),
    );

    const res = await request(app).get(getDashboardUrl(caseRole, claimId)).expect(200);

    expect(res.text).toContain(confirmTrialArrangementsNotification.title);
    expect(res.text).toContain(confirmTrialArrangementsNotification.nextStepLabel);
    expectTaskNearStatus(res.text, 'Add the trial arrangements', 'Action needed');
    expect(res.text).toContain(trialHref);
    expect(res.text).toContain(hearingHref);
  });
});
