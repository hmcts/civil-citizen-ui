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
  CITIZEN_FREE_TELEPHONE_MEDIATION_URL,
  DASHBOARD_CLAIMANT_URL,
  DEFENDANT_SUMMARY_URL,
  START_MEDIATION_UPLOAD_FILES,
  VIEW_MEDIATION_DOCUMENTS,
  VIEW_MEDIATION_SETTLEMENT_AGREEMENT_DOCUMENT,
} from '../../../main/routes/urls';
import {civilServiceClientMock} from '../../setup/sharedMocks';
import {Claim} from '../../../main/common/models/claim';
import {CaseRole} from '../../../main/common/form/models/caseRoles';
import {CaseState} from '../../../main/common/form/models/claimDetails';
import {Party} from '../../../main/common/models/party';
import {PartyType} from '../../../main/common/models/partyType';
import {PartyDetails} from '../../../main/common/form/models/partyDetails';
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

const mediationSuccessful = {
  title: 'Mediation appointment successful',
  content: [
    'Both parties attended mediation and an agreement was reached.',
    'This case is now settled and no further action is needed.',
    'You can view your mediation agreement here.',
  ],
};

const mediationUnsuccessfulNotContactable = {
  title: 'Mediation appointment unsuccessful',
  content: [
    'You were not able to resolve this claim using mediation.',
    'This case will now be reviewed by the court.',
  ],
};

const mediationUnsuccessfulClaimantNonAttendance = {
  title: 'You did not attend mediation',
  content:
    'You did not attend your mediation appointment, and the judge may issue a penalty against you. Your case will now be reviewed by the court.',
  nextStepLabel: 'Explain why you did not attend your appointment',
};

const joinNotificationHtml = (paragraphs: string[]): string =>
  paragraphs.map((p) => `<p class="govuk-body">${p}</p>`).join('');

const buildNotificationList = (title: string, descriptionEn: string): DashboardNotificationList =>
  new DashboardNotificationList([
    new DashboardNotification(
      'notification-mediation-1',
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

const buildBaseClaim = (id: string, caseRole: CaseRole): Claim => {
  const claim = new Claim();
  const {applicant1, respondent1} = buildParties();
  claim.id = id;
  claim.caseRole = caseRole;
  claim.ccdState = CaseState.IN_MEDIATION;
  claim.totalClaimAmount = 900;
  claim.submittedDate = new Date('2026-01-15');
  claim.applicant1 = applicant1;
  claim.respondent1 = respondent1;
  claim.specRespondent1Represented = undefined;
  claim.respondentSolicitor1EmailAddress = undefined;
  return claim;
};

const buildCarmMediationTasks = (
  viewDocs: {status: string; nameHtml: string},
  upload: {status: string; nameHtml: string},
  settlement: {status: string; nameHtml: string},
): Dashboard =>
  new Dashboard([
    new DashboardTaskList('Mediation', 'Mediation', [
      new DashboardTask('med-view-docs', viewDocs.nameHtml, '', viewDocs.status, '', 'govuk-tag--grey', '', ''),
      new DashboardTask('med-upload', upload.nameHtml, '', upload.status, '', 'govuk-tag--grey', '', ''),
      new DashboardTask('med-settlement', settlement.nameHtml, '', settlement.status, '', 'govuk-tag--grey', '', ''),
    ]),
  ]);

const expectTaskNearStatus = (html: string, taskSnippet: string, status: string): void => {
  const idx = html.indexOf(taskSnippet);
  expect(idx).toBeGreaterThan(-1);
  expect(html.slice(idx, idx + 2500)).toContain(status);
};

describe('Integration: mediation dashboard notifications and task list', () => {
  beforeEach(() => {
    (getContactCourtLink as jest.Mock).mockResolvedValue({text: 'Contact the court', url: '/contact-us'});
    (getHelpSupportTitle as jest.Mock).mockReturnValue('Help and support');
    (getHelpSupportLinks as jest.Mock).mockReturnValue([]);
    (isQueryManagementEnabled as jest.Mock).mockResolvedValue(true);
    (isCarmEnabledForCase as jest.Mock).mockResolvedValue(true);
    (isDashboardEnabledForCase as jest.Mock).mockResolvedValue(false);
    (extractOrderDocumentIdFromNotification as jest.Mock).mockReturnValue(undefined);
  });

  it('claimant dashboard: unsuccessful mediation (not contactable) shows notification and mediation task states', async () => {
    const claimId = '000MC-MED-CLM-01';
    const claim = buildBaseClaim(claimId, CaseRole.CLAIMANT);
    const viewHref = VIEW_MEDIATION_DOCUMENTS.replace(':id', claimId);
    const uploadHref = START_MEDIATION_UPLOAD_FILES.replace(':id', claimId);
    const settlementHref = VIEW_MEDIATION_SETTLEMENT_AGREEMENT_DOCUMENT.replace(':id', claimId);

    civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(claim);
    (getNotifications as jest.Mock).mockResolvedValue(
      buildNotificationList(
        mediationUnsuccessfulNotContactable.title,
        joinNotificationHtml(mediationUnsuccessfulNotContactable.content),
      ),
    );
    (getDashboardForm as jest.Mock).mockResolvedValue(
      buildCarmMediationTasks(
        {
          status: 'Not available yet',
          nameHtml: `<a href="${viewHref}" class="govuk-link">View mediation documents</a>`,
        },
        {
          status: 'Inactive',
          nameHtml: `<a href="${uploadHref}" class="govuk-link">Upload mediation documents</a>`,
        },
        {
          status: 'Inactive',
          nameHtml: `<a href="${settlementHref}" class="govuk-link">View mediation settlement agreement</a>`,
        },
      ),
    );

    const res = await request(app).get(DASHBOARD_CLAIMANT_URL.replace(':id', claimId)).expect(200);

    expect(res.text).toContain(mediationUnsuccessfulNotContactable.title);
    for (const line of mediationUnsuccessfulNotContactable.content) {
      expect(res.text).toContain(line);
    }

    expectTaskNearStatus(res.text, 'View mediation documents', 'Not available yet');
    expectTaskNearStatus(res.text, 'Upload mediation documents', 'Inactive');
    expectTaskNearStatus(res.text, 'View mediation settlement agreement', 'Inactive');
  });

  it('claimant dashboard: successful mediation shows notification and settlement agreement available with link', async () => {
    const claimId = '000MC-MED-CLM-02';
    const claim = buildBaseClaim(claimId, CaseRole.CLAIMANT);
    const viewHref = VIEW_MEDIATION_DOCUMENTS.replace(':id', claimId);
    const uploadHref = START_MEDIATION_UPLOAD_FILES.replace(':id', claimId);
    const settlementHref = VIEW_MEDIATION_SETTLEMENT_AGREEMENT_DOCUMENT.replace(':id', claimId);

    civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(claim);
    (getNotifications as jest.Mock).mockResolvedValue(
      buildNotificationList(mediationSuccessful.title, joinNotificationHtml(mediationSuccessful.content)),
    );
    (getDashboardForm as jest.Mock).mockResolvedValue(
      buildCarmMediationTasks(
        {
          status: 'Inactive',
          nameHtml: `<a href="${viewHref}" class="govuk-link">View mediation documents</a>`,
        },
        {
          status: 'Inactive',
          nameHtml: `<a href="${uploadHref}" class="govuk-link">Upload mediation documents</a>`,
        },
        {
          status: 'Available',
          nameHtml: `<a href="${settlementHref}" class="govuk-link">View mediation settlement agreement</a>`,
        },
      ),
    );

    const res = await request(app).get(DASHBOARD_CLAIMANT_URL.replace(':id', claimId)).expect(200);

    expect(res.text).toContain(mediationSuccessful.title);
    for (const line of mediationSuccessful.content) {
      expect(res.text).toContain(line);
    }

    expectTaskNearStatus(res.text, 'View mediation settlement agreement', 'Available');
    expect(res.text).toContain(settlementHref);

    expectTaskNearStatus(res.text, 'View mediation documents', 'Inactive');
    expectTaskNearStatus(res.text, 'Upload mediation documents', 'Inactive');
  });

  it('claimant dashboard: when CARM is off, legacy Free telephone mediation task label and link still render', async () => {
    const claimId = '000MC-MED-CLM-03';
    const claim = buildBaseClaim(claimId, CaseRole.CLAIMANT);
    (isCarmEnabledForCase as jest.Mock).mockResolvedValue(false);

    civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(claim);
    (getNotifications as jest.Mock).mockResolvedValue(
      buildNotificationList(
        mediationUnsuccessfulNotContactable.title,
        joinNotificationHtml(mediationUnsuccessfulNotContactable.content),
      ),
    );
    const ftmHref = CITIZEN_FREE_TELEPHONE_MEDIATION_URL.replace(':id', claimId);
    (getDashboardForm as jest.Mock).mockResolvedValue(
      new Dashboard([
        new DashboardTaskList('The claim', 'The claim', [
          new DashboardTask(
            'legacy-ftm',
            `<a href="${ftmHref}" class="govuk-link">Free telephone mediation</a>`,
            '',
            'Action needed',
            '',
            'govuk-tag--red',
            '',
            '',
          ),
        ]),
      ]),
    );

    const res = await request(app).get(DASHBOARD_CLAIMANT_URL.replace(':id', claimId)).expect(200);

    expect(res.text).toContain('Free telephone mediation');
    expect(res.text).toContain(ftmHref);
    expectTaskNearStatus(res.text, 'Free telephone mediation', 'Action needed');
  });

  it('defendant dashboard: unsuccessful mediation (claimant non-attendance) shows notification, next-step link, and upload task', async () => {
    const claimId = '000MC-MED-DEF-01';
    const claim = buildBaseClaim(claimId, CaseRole.DEFENDANT);
    (isDashboardEnabledForCase as jest.Mock).mockResolvedValue(true);

    const explainHref = START_MEDIATION_UPLOAD_FILES.replace(':id', claimId);
    const description = `${mediationUnsuccessfulClaimantNonAttendance.content} <a href="${explainHref}" class="govuk-link">${mediationUnsuccessfulClaimantNonAttendance.nextStepLabel}</a>`;

    const viewHref = VIEW_MEDIATION_DOCUMENTS.replace(':id', claimId);
    const uploadHref = START_MEDIATION_UPLOAD_FILES.replace(':id', claimId);
    const settlementHref = VIEW_MEDIATION_SETTLEMENT_AGREEMENT_DOCUMENT.replace(':id', claimId);

    civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(claim);
    (getNotifications as jest.Mock).mockResolvedValue(
      buildNotificationList(mediationUnsuccessfulClaimantNonAttendance.title, description),
    );
    (getDashboardForm as jest.Mock).mockResolvedValue(
      buildCarmMediationTasks(
        {
          status: 'Not available yet',
          nameHtml: `<a href="${viewHref}" class="govuk-link">View mediation documents</a>`,
        },
        {
          status: 'Action needed',
          nameHtml: `<a href="${uploadHref}" class="govuk-link">Upload mediation documents</a>`,
        },
        {
          status: 'Inactive',
          nameHtml: `<a href="${settlementHref}" class="govuk-link">View mediation settlement agreement</a>`,
        },
      ),
    );

    const res = await request(app).get(DEFENDANT_SUMMARY_URL.replace(':id', claimId)).expect(200);

    expect(res.text).toContain(mediationUnsuccessfulClaimantNonAttendance.title);
    expect(res.text).toContain(mediationUnsuccessfulClaimantNonAttendance.content);
    expect(res.text).toContain(explainHref);
    expect(res.text).toContain(mediationUnsuccessfulClaimantNonAttendance.nextStepLabel);

    expectTaskNearStatus(res.text, 'Upload mediation documents', 'Action needed');
    expect(res.text).toContain(uploadHref);

    expectTaskNearStatus(res.text, 'View mediation documents', 'Not available yet');
    expectTaskNearStatus(res.text, 'View mediation settlement agreement', 'Inactive');
  });

  it('defendant dashboard: successful mediation mirrors claimant settlement agreement availability', async () => {
    const claimId = '000MC-MED-DEF-02';
    const claim = buildBaseClaim(claimId, CaseRole.DEFENDANT);
    (isDashboardEnabledForCase as jest.Mock).mockResolvedValue(true);

    const viewHref = VIEW_MEDIATION_DOCUMENTS.replace(':id', claimId);
    const uploadHref = START_MEDIATION_UPLOAD_FILES.replace(':id', claimId);
    const settlementHref = VIEW_MEDIATION_SETTLEMENT_AGREEMENT_DOCUMENT.replace(':id', claimId);

    civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(claim);
    (getNotifications as jest.Mock).mockResolvedValue(
      buildNotificationList(mediationSuccessful.title, joinNotificationHtml(mediationSuccessful.content)),
    );
    (getDashboardForm as jest.Mock).mockResolvedValue(
      buildCarmMediationTasks(
        {
          status: 'Inactive',
          nameHtml: `<a href="${viewHref}" class="govuk-link">View mediation documents</a>`,
        },
        {
          status: 'Inactive',
          nameHtml: `<a href="${uploadHref}" class="govuk-link">Upload mediation documents</a>`,
        },
        {
          status: 'Available',
          nameHtml: `<a href="${settlementHref}" class="govuk-link">View mediation settlement agreement</a>`,
        },
      ),
    );

    const res = await request(app).get(DEFENDANT_SUMMARY_URL.replace(':id', claimId)).expect(200);

    expect(res.text).toContain(mediationSuccessful.title);
    expectTaskNearStatus(res.text, 'View mediation settlement agreement', 'Available');
    expect(res.text).toContain(settlementHref);
  });
});
