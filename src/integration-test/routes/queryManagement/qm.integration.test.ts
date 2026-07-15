import request from 'supertest';
process.env.NODE_ENV = 'test';
import '../../setup/testSetup';
jest.mock('../../../main/modules/draft-store/draftStoreService', () =>
  jest.requireActual('../../setup/sharedMocks').draftStoreServiceMock,
);
jest.mock('../../../main/services/dashboard/dashboardService', () =>
  jest.requireActual('../../setup/sharedMocks').dashboardServiceMock,
);
jest.mock('modules/utilityService', () => ({
  ...jest.requireActual('modules/utilityService'),
  getClaimById: jest.fn(),
}));
jest.mock('services/caseDocuments/documentService', () => ({
  saveDocumentsToExistingClaim: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('services/features/response/submitConfirmation/submitConfirmationService', () => ({
  getClaimWithExtendedPaymentDeadline: jest.fn().mockResolvedValue(undefined),
}));
import {app} from '../../../main/app';
import {
  DASHBOARD_CLAIMANT_URL,
  DEFENDANT_SUMMARY_URL,
  QM_FOLLOW_UP_CYA,
  QM_FOLLOW_UP_MESSAGE,
  QM_QUERY_DETAILS_URL,
  QM_VIEW_QUERY_URL,
} from '../../../main/routes/urls';
import {civilServiceClientMock, draftStoreServiceMock} from '../../setup/sharedMocks';
import {asUser, installSessionUserInjector} from '../../setup/sessionHelper';
import {CaseRole} from '../../../main/common/form/models/caseRoles';
import {Claim} from '../../../main/common/models/claim';
import {QueryManagement} from '../../../main/common/form/models/queryManagement/queryManagement';
import {
  isDashboardEnabledForCase,
  isQueryManagementEnabled,
  isBreathingSpaceEnabled,
} from '../../../main/app/auth/launchdarkly/launchDarklyClient';
import {
  getContactCourtLink,
  getDashboardForm,
  getHelpSupportLinks,
  getHelpSupportTitle,
  getNotifications,
} from '../../../main/services/dashboard/dashboardService';
import {getClaimById} from 'modules/utilityService';
import {
  buildClosedQueryMessages,
  buildDualPartyQueryMessages,
  buildHearingQueryMessages,
  buildNonHearingQueryMessages,
  buildQmClaim,
  buildQueryAfterFollowUpMessages,
  buildQueryAwaitingFollowUpMessages,
  QM_QUERY_IDS,
  QmPartyRole,
  userIdForRole,
} from './qmFixtures';

const CLAIM_ID = 'QM-INTEGRATION-CLAIM';
const parties: QmPartyRole[] = ['claimant', 'defendant'];

const routeWithClaimId = (url: string, claimId = CLAIM_ID): string => url.replace(':id', claimId);

const dashboardUrlForRole = (role: QmPartyRole): string =>
  role === 'claimant'
    ? routeWithClaimId(DASHBOARD_CLAIMANT_URL)
    : routeWithClaimId(DEFENDANT_SUMMARY_URL);

const queryDetailsUrl = (queryId: string, claimId = CLAIM_ID): string =>
  routeWithClaimId(QM_QUERY_DETAILS_URL, claimId).replace(':queryId', queryId);

const followUpMessageUrl = (queryId: string, claimId = CLAIM_ID): string =>
  routeWithClaimId(QM_FOLLOW_UP_MESSAGE, claimId).replace(':queryId', queryId);

const followUpCyaUrl = (queryId: string, claimId = CLAIM_ID): string =>
  routeWithClaimId(QM_FOLLOW_UP_CYA, claimId).replace(':queryId', queryId);

describe('Integration: query management views', () => {
  beforeAll(() => {
    installSessionUserInjector();
  });

  beforeEach(() => {
    (isQueryManagementEnabled as jest.Mock).mockResolvedValue(true);
    (isDashboardEnabledForCase as jest.Mock).mockResolvedValue(true);
    (isBreathingSpaceEnabled as jest.Mock).mockResolvedValue(false);
    (getContactCourtLink as jest.Mock).mockResolvedValue({text: 'Contact the court', url: '/contact-us'});
    (getHelpSupportTitle as jest.Mock).mockReturnValue('Help and support');
    (getHelpSupportLinks as jest.Mock).mockReturnValue([]);
    (getNotifications as jest.Mock).mockResolvedValue({items: []});
    (getDashboardForm as jest.Mock).mockResolvedValue(undefined);
    civilServiceClientMock.recordClick = jest.fn().mockResolvedValue(undefined);
    (getClaimById as jest.Mock).mockImplementation(async () => {
      const claim = new Claim();
      claim.id = CLAIM_ID;
      return claim;
    });
  });

  describe.each(parties)('%s query list and details', (role) => {
    it('renders hearing-related query list and detail with hearing date', async () => {
      const claim = buildQmClaim(CLAIM_ID, role, buildHearingQueryMessages(role));
      const queryId = role === 'claimant' ? QM_QUERY_IDS.claimantHearing : QM_QUERY_IDS.defendantHearing;
      const subject = role === 'claimant' ? 'Claimant Hearing query' : 'Defendant Hearing query';

      civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(claim);

      const listRes = await request(app)
        .get(routeWithClaimId(QM_VIEW_QUERY_URL))
        .set(asUser(userIdForRole(role)))
        .expect(200);

      expect(listRes.text).toContain('Messages to the court');
      expect(listRes.text).toContain(subject);
      expect(listRes.text).toContain('You');
      expect(listRes.text).toContain('Message sent');

      const detailRes = await request(app)
        .get(queryDetailsUrl(queryId))
        .set(asUser(userIdForRole(role)))
        .expect(200);

      expect(detailRes.text).toContain(subject);
      expect(detailRes.text).toContain(`${role === 'claimant' ? 'Claimant' : 'Defendant'} Hearing Test message`);
      expect(detailRes.text).toContain('Is your message about an upcoming hearing?');
      expect(detailRes.text).toContain('Yes');
      expect(detailRes.text).toContain('What is the date of the hearing?');
      expect(detailRes.text).toContain('The court is reviewing the message');
      expect(detailRes.text).not.toContain('Send a follow up message');
    });

    it('renders non-hearing query list and detail without hearing date', async () => {
      const claim = buildQmClaim(CLAIM_ID, role, buildNonHearingQueryMessages(role));
      const queryId = role === 'claimant' ? QM_QUERY_IDS.claimantNonHearing : QM_QUERY_IDS.defendantNonHearing;
      const subject = role === 'claimant' ? 'Claimant query' : 'Defendant query';

      civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(claim);

      const listRes = await request(app)
        .get(routeWithClaimId(QM_VIEW_QUERY_URL))
        .set(asUser(userIdForRole(role)))
        .expect(200);

      expect(listRes.text).toContain(subject);
      expect(listRes.text).toContain('Message sent');

      const detailRes = await request(app)
        .get(queryDetailsUrl(queryId))
        .set(asUser(userIdForRole(role)))
        .expect(200);

      expect(detailRes.text).toContain(subject);
      expect(detailRes.text).toContain('No');
      expect(detailRes.text).not.toContain('What is the date of the hearing?');
    });

    it('shows response received status and follow-up link after court response', async () => {
      const claim = buildQmClaim(CLAIM_ID, role, buildQueryAwaitingFollowUpMessages(role));
      const queryId = role === 'claimant' ? QM_QUERY_IDS.claimantWithResponse : QM_QUERY_IDS.defendantWithResponse;
      const subject = `${role === 'claimant' ? 'Claimant' : 'Defendant'} Query`;

      civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(claim);

      const listRes = await request(app)
        .get(routeWithClaimId(QM_VIEW_QUERY_URL))
        .set(asUser(userIdForRole(role)))
        .expect(200);

      expect(listRes.text).toContain(subject);
      expect(listRes.text).toContain('Response received');
      expect(listRes.text).toContain('Court staff');

      const detailRes = await request(app)
        .get(queryDetailsUrl(queryId))
        .set(asUser(userIdForRole(role)))
        .expect(200);

      expect(detailRes.text).toContain('Caseworker response to query.');
      expect(detailRes.text).toContain('Send a follow up message');
      expect(detailRes.text).toContain(followUpMessageUrl(queryId));
      expect(detailRes.text).toContain('Only send follow up messages related to the original query.');
    });

    it('hides follow-up link after a follow-up has been sent', async () => {
      const claim = buildQmClaim(CLAIM_ID, role, buildQueryAfterFollowUpMessages(role));
      const queryId = role === 'claimant' ? QM_QUERY_IDS.claimantWithResponse : QM_QUERY_IDS.defendantWithResponse;

      civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(claim);

      const detailRes = await request(app)
        .get(queryDetailsUrl(queryId))
        .set(asUser(userIdForRole(role)))
        .expect(200);

      expect(detailRes.text).toContain('Follow up message');
      expect(detailRes.text).toContain('The court is reviewing the message');
      expect(detailRes.text).not.toContain('Send a follow up message');
    });

    it('renders closed query on list and detail with warning text', async () => {
      const claim = buildQmClaim(CLAIM_ID, role, buildClosedQueryMessages(role));
      const queryId = role === 'claimant' ? QM_QUERY_IDS.claimantClosed : QM_QUERY_IDS.defendantClosed;
      const subject = `${role === 'claimant' ? 'Claimant' : 'Defendant'} Query`;

      civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(claim);

      const listRes = await request(app)
        .get(routeWithClaimId(QM_VIEW_QUERY_URL))
        .set(asUser(userIdForRole(role)))
        .expect(200);

      expect(listRes.text).toContain(subject);
      expect(listRes.text).toContain('Closed');

      const detailRes = await request(app)
        .get(queryDetailsUrl(queryId))
        .set(asUser(userIdForRole(role)))
        .expect(200);

      expect(detailRes.text).toContain('Caseworker closing query');
      expect(detailRes.text).toContain('This message has been closed by court staff');
      expect(detailRes.text).not.toContain('Send a follow up message');
    });

    it('shows other party as sender when viewing their query thread', async () => {
      const viewerRole: QmPartyRole = role === 'claimant' ? 'defendant' : 'claimant';
      const otherRole: QmPartyRole = role === 'claimant' ? 'claimant' : 'defendant';
      const claim = buildQmClaim(CLAIM_ID, viewerRole, buildQueryAwaitingFollowUpMessages(otherRole));
      const queryId = otherRole === 'claimant' ? QM_QUERY_IDS.claimantWithResponse : QM_QUERY_IDS.defendantWithResponse;
      const otherPartyName = otherRole === 'claimant' ? 'Claimant' : 'Defendant';

      civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(claim);

      const listRes = await request(app)
        .get(routeWithClaimId(QM_VIEW_QUERY_URL))
        .set(asUser(userIdForRole(viewerRole)))
        .expect(200);

      expect(listRes.text).toContain(`${otherPartyName} Query`);
      expect(listRes.text).toContain(otherPartyName);
      expect(listRes.text).not.toContain('>You<');

      const detailRes = await request(app)
        .get(queryDetailsUrl(queryId))
        .set(asUser(userIdForRole(viewerRole)))
        .expect(200);

      expect(detailRes.text).toContain(otherPartyName);
      expect(detailRes.text).not.toContain('Your message');
    });
  });

  describe('NOC dual-party visibility', () => {
    it.each([
      {role: 'defendant' as QmPartyRole, caseRole: CaseRole.DEFENDANT},
      {role: 'claimant' as QmPartyRole, caseRole: CaseRole.CLAIMANT},
    ])('$role sees claimant and defendant query threads on the list', async ({role}) => {
      const claim = buildQmClaim(CLAIM_ID, role, buildDualPartyQueryMessages());
      civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(claim);

      const res = await request(app)
        .get(routeWithClaimId(QM_VIEW_QUERY_URL))
        .set(asUser(userIdForRole(role)))
        .expect(200);

      expect(res.text).toContain('Claimant Query');
      expect(res.text).toContain('Defendant Query');
      expect(res.text).toContain('Message sent');

      const claimantDetail = await request(app)
        .get(queryDetailsUrl(QM_QUERY_IDS.claimantWithResponse))
        .set(asUser(userIdForRole(role)))
        .expect(200);

      expect(claimantDetail.text).toContain('This query was raised by Claimant.');
      expect(claimantDetail.text).toContain('follow up to caseworker response.');

      const defendantDetail = await request(app)
        .get(queryDetailsUrl(QM_QUERY_IDS.defendantWithResponse))
        .set(asUser(userIdForRole(role)))
        .expect(200);

      expect(defendantDetail.text).toContain('This query was raised by Defendant.');
      expect(defendantDetail.text).toContain('follow up to caseworker response.');
    });
  });

  describe.each(parties)('%s dashboard view messages link', (role) => {
    it('shows View messages when case has query threads', async () => {
      const claim = buildQmClaim(CLAIM_ID, role, buildQueryAwaitingFollowUpMessages(role));
      civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(claim);
      (getClaimById as jest.Mock).mockResolvedValue(claim);

      const res = await request(app)
        .get(dashboardUrlForRole(role))
        .set(asUser(userIdForRole(role)))
        .expect(200);

      expect(res.text).toContain('View messages');
      expect(res.text).toContain(routeWithClaimId(QM_VIEW_QUERY_URL));
    }, 15000);
  });

  describe('follow-up form', () => {
    beforeEach(() => {
      const draftClaim = new Claim();
      draftClaim.id = CLAIM_ID;
      draftClaim.queryManagement = new QueryManagement();
      (getClaimById as jest.Mock).mockResolvedValue(draftClaim);
      draftStoreServiceMock.getCaseDataFromStore.mockResolvedValue(draftClaim);
    });

    it.each(parties)('%s can render and submit follow-up message form', async (role) => {
      const queryId = role === 'claimant' ? QM_QUERY_IDS.claimantWithResponse : QM_QUERY_IDS.defendantWithResponse;
      const getRes = await request(app)
        .get(`${followUpMessageUrl(queryId)}?linkFrom=start`)
        .set(asUser(userIdForRole(role)))
        .expect(200);

      expect(getRes.text).toContain('Send a follow up message');
      expect(getRes.text).toContain('Enter message details');
      expect(getRes.text).toContain('Upload documents (optional)');

      const postRes = await request(app)
        .post(followUpMessageUrl(queryId))
        .set(asUser(userIdForRole(role)))
        .type('form')
        .send({messageDetails: 'Follow up message'})
        .expect(302);

      expect(postRes.headers.location).toContain(followUpCyaUrl(queryId));
      expect(draftStoreServiceMock.saveDraftClaim).toHaveBeenCalled();
    });

    it.each(parties)('%s sees validation when follow-up message is empty', async (role) => {
      const queryId = role === 'claimant' ? QM_QUERY_IDS.claimantWithResponse : QM_QUERY_IDS.defendantWithResponse;
      const res = await request(app)
        .post(followUpMessageUrl(queryId))
        .set(asUser(userIdForRole(role)))
        .type('form')
        .send({})
        .expect(200);

      expect(res.text).toContain('There was a problem');
      expect(res.text).toContain('Enter message details');
    });
  });
});
