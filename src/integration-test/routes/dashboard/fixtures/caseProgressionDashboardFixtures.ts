import {Claim} from 'models/claim';
import {CaseRole} from 'form/models/caseRoles';
import {CaseState} from 'form/models/claimDetails';
import {claimType as ClaimTrack} from 'form/models/claimType';
import {Party} from 'models/party';
import {PartyType} from 'models/partyType';
import {PartyDetails} from 'form/models/partyDetails';
import {Dashboard} from 'models/dashboard/dashboard';
import {DashboardTaskList} from 'models/dashboard/taskList/dashboardTaskList';
import {DashboardTask} from 'models/dashboard/taskList/dashboardTask';
import {DashboardNotificationList} from 'models/dashboard/dashboardNotificationList';
import {DashboardNotification} from 'models/dashboard/dashboardNotification';
import {getCaseProgressionHearingMock} from '../../../../test/utils/caseProgression/mockCaseProgressionHearing';
import civilClaimResponseMock from '../../../../test/utils/mocks/civilClaimResponseMock.json';
import {CCDClaim} from 'models/civilClaimResponse';
import {translateCCDCaseDataToCUIModel} from 'services/translation/convertToCUI/cuiTranslation';
import {
  BUNDLES_URL,
  CP_FINALISE_TRIAL_ARRANGEMENTS_URL,
  EVIDENCE_UPLOAD_DOCUMENTS_URL,
  VIEW_ORDERS_AND_NOTICES_URL,
  VIEW_THE_HEARING_URL,
} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

export type CaseProgressionTrack = 'SMALL_CLAIM' | 'FAST_CLAIM';

export const CP_NOTIFICATIONS = {
  bundleReady: {
    title: 'The bundle is ready to view',
    content:
      'The bundle contains all the documents that will be referred to at the hearing. Review the bundle to ensure that the information is accurate.',
  },
  orderMade: {
    title: 'An order has been made',
    content: 'The judge has made an order on your claim.',
  },
  claimStruckOut: {
    title: 'The claim has been struck out',
    content:
      'This is because the hearing fee was not paid by 10 November 2023 as stated in the hearing notice.',
  },
  uploadDocuments: {
    title: 'Upload documents',
    content:
      'You can upload and submit documents to support your defence. Follow the instructions set out in the directions order.',
  },
  hearingScheduled: {
    title: 'A hearing has been scheduled',
    content:
      'Your hearing has been scheduled for 26 April 2023 at Central London County Court. Please keep your contact details and anyone you wish to rely on in court up to date.',
  },
  otherSideTrialArrangements: {
    title: 'The other side has confirmed their trial arrangements',
    content: "You can view the arrangements that they've confirmed.",
  },
  confirmTrialArrangements: {
    title: 'Confirm your trial arrangements',
    content: 'You must confirm your trial arrangements by 12 April 2023.',
  },
} as const;

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

export const buildCaseProgressionClaim = (
  id: string,
  caseRole: CaseRole,
  track: CaseProgressionTrack,
): Claim => {
  const claim = new Claim();
  const {applicant1, respondent1} = buildParties();
  claim.id = id;
  claim.caseRole = caseRole;
  claim.ccdState = CaseState.CASE_PROGRESSION;
  claim.totalClaimAmount = track === 'FAST_CLAIM' ? 15000 : 1500;
  claim.submittedDate = new Date('2024-06-01');
  claim.applicant1 = applicant1;
  claim.respondent1 = respondent1;
  claim.responseClaimTrack = track === 'FAST_CLAIM' ? ClaimTrack.FAST_CLAIM : ClaimTrack.SMALL_CLAIM;
  claim.specRespondent1Represented = undefined;
  claim.respondentSolicitor1EmailAddress = undefined;
  return claim;
};

const buildNotification = (id: string, title: string, descriptionEn: string): DashboardNotification =>
  new DashboardNotification(
    id,
    title,
    '',
    descriptionEn,
    '',
    '',
    undefined,
    undefined,
    '2026-04-27T00:00:00',
    undefined,
  );

export const buildNotificationList = (title: string, descriptionEn: string): DashboardNotificationList =>
  new DashboardNotificationList([buildNotification('cp-notification-1', title, descriptionEn)]);

export const buildNotificationListFromItems = (
  items: Array<{title: string; descriptionEn: string}>,
): DashboardNotificationList =>
  new DashboardNotificationList(
    items.map((item, index) => buildNotification(`cp-notification-${index}`, item.title, item.descriptionEn)),
  );

export const joinNotificationHtml = (paragraphs: string[]): string =>
  paragraphs.map((p) => `<p class="govuk-body">${p}</p>`).join('');

export const expectTaskNearStatus = (html: string, taskSnippet: string, status: string): void => {
  const idx = html.indexOf(taskSnippet);
  expect(idx).toBeGreaterThan(-1);
  expect(html.slice(idx, idx + 2500)).toContain(status);
};

const taskLink = (href: string, label: string): string =>
  `<a href="${href}" class="govuk-link">${label}</a>`;

export const buildCpHearingTaskList = (
  claimId: string,
  tasks: Array<{label: string; status: string; path: string}>,
): Dashboard =>
  new Dashboard([
    new DashboardTaskList('The claim', 'The claim', []),
    new DashboardTaskList('Mediation', 'Mediation', []),
    new DashboardTaskList(
      'Hearing',
      'Hearing',
      tasks.map((task, index) =>
        new DashboardTask(
          `cp-task-${index}`,
          taskLink(constructResponseUrlWithIdParams(claimId, task.path), task.label),
          '',
          task.status,
          '',
          'govuk-tag--grey',
          '',
          '',
        ),
      ),
    ),
  ]);

export const cpTaskPaths = {
  uploadHearingDocuments: EVIDENCE_UPLOAD_DOCUMENTS_URL,
  viewDocuments: `${EVIDENCE_UPLOAD_DOCUMENTS_URL}/view`,
  viewHearing: VIEW_THE_HEARING_URL,
  viewOrders: VIEW_ORDERS_AND_NOTICES_URL,
  viewBundle: BUNDLES_URL,
  addTrialArrangements: CP_FINALISE_TRIAL_ARRANGEMENTS_URL,
};

export const buildLegacyCaseProgressionClaim = (
  id: string,
  caseRole: CaseRole,
  track: CaseProgressionTrack,
  options: {
    withHearing?: boolean;
    withBundle?: boolean;
    struckOut?: boolean;
  } = {},
): Claim => {
  const hearingMock = getCaseProgressionHearingMock();
  const caseData = {
    ...civilClaimResponseMock.case_data,
    id,
    ccdState: CaseState.CASE_PROGRESSION,
    caseRole,
    responseClaimTrack: track === 'FAST_CLAIM' ? ClaimTrack.FAST_CLAIM : ClaimTrack.SMALL_CLAIM,
    caseDismissedHearingFeeDueDate: options.struckOut ? new Date() : undefined,
    hearingDate: options.withHearing || options.struckOut ? hearingMock.hearingDate : undefined,
    hearingLocation: options.withHearing || options.struckOut ? hearingMock.hearingLocation : undefined,
    hearingTimeHourMinute: options.withHearing || options.struckOut ? hearingMock.hearingTimeHourMinute : undefined,
    hearingDocuments: options.withHearing || options.struckOut ? hearingMock.hearingDocuments : undefined,
    caseBundles:
      options.withBundle && options.withHearing
        ? [
          {
            id: 'bundle-1',
            value: {
              title: 'Trial bundle',
              stitchedDocument: {
                document_url: 'http://dm-store:8080/documents/bundle',
                document_filename: 'bundle.pdf',
                document_binary_url: 'http://dm-store:8080/documents/bundle/binary',
              },
              createdOn: '2024-01-01',
              bundleHearingDate: '2024-04-26',
            },
          },
        ]
        : civilClaimResponseMock.case_data.caseBundles,
  };

  return translateCCDCaseDataToCUIModel(caseData as CCDClaim);
};
