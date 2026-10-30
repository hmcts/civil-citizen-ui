import request from 'supertest';
process.env.NODE_ENV = 'test';
import '../../setup/testSetup';
import {app} from '../../../main/app';
import {civilServiceClientMock} from '../../setup/sharedMocks';
import {Claim} from '../../../main/common/models/claim';
import {Party} from '../../../main/common/models/party';
import {PartyType} from '../../../main/common/models/partyType';
import {PartyDetails} from '../../../main/common/form/models/partyDetails';
import {CaseRole} from '../../../main/common/form/models/caseRoles';
import {DashboardDefendantItem} from '../../../main/common/models/dashboard/dashboardItem';
import {asUser, installSessionUserInjector} from '../../setup/sessionHelper';
import {
  DASHBOARD_NOTIFICATION_REDIRECT,
  DASHBOARD_URL,
  VIEW_DEFENDANT_INFO,
  VIEW_ORDERS_AND_NOTICES_URL,
} from '../../../main/routes/urls';

const claimId = '000MC6283';

const buildClaim = (): Claim => {
  const claim = new Claim();
  claim.id = claimId;
  claim.caseRole = CaseRole.CLAIMANT;
  claim.totalClaimAmount = 1000;
  claim.submittedDate = new Date('2024-01-01');
  claim.applicant1 = new Party();
  claim.applicant1.type = PartyType.INDIVIDUAL;
  claim.applicant1.partyDetails = new PartyDetails({
    title: 'Ms',
    firstName: 'Jane',
    lastName: 'Doe',
    partyName: 'Jane Doe',
    addressLine1: '1 High Street',
    city: 'London',
    postCode: 'SW1A 1AA',
  });
  claim.respondent1 = new Party();
  claim.respondent1.type = PartyType.ORGANISATION;
  claim.respondent1.partyDetails = new PartyDetails({
    title: 'Mx',
    firstName: 'Sam',
    lastName: 'Smith',
    partyName: 'Version 1',
    addressLine1: 'Flat 2',
    addressLine2: 'Caversham House',
    addressLine3: 'Church Road',
    city: 'Reading',
    postCode: 'RG4 7AA',
  });
  return claim;
};

const buildDefendantClaim = (): DashboardDefendantItem => {
  const item = new DashboardDefendantItem();
  item.status = 'NO_STATUS';
  item.claimId = '256MC007';
  item.claimNumber = '256MC007';
  item.claimAmount = 1000;
  item.claimantName = 'Mr Baddy Bad';
  item.defendantName = 'Mr Bad Guy';
  item.admittedAmount = 200;
  item.paymentDate = new Date('2022-06-21');
  item.ccjRequestedDate = new Date('2023-02-24');
  item.responseDeadline = new Date('2023-02-05');
  item.defaultJudgementIssuedDate = '2023-02-24';
  item.numberOfDays = '0';
  item.numberOfDaysOverdue = '0';
  item.ocmc = false;
  return item;
};

describe('Integration: dashboard pages', () => {
  beforeAll(() => {
    installSessionUserInjector();
  });

  beforeEach(() => {
    civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(buildClaim());
    civilServiceClientMock.recordClick.mockResolvedValue(undefined);
    civilServiceClientMock.getClaimsForClaimant.mockResolvedValue({claims: [], totalPages: 1});
    civilServiceClientMock.getClaimsForDefendant.mockResolvedValue({
      claims: [buildDefendantClaim()],
      totalPages: 1,
    });
  });

  it('renders the claims made against you list', async () => {
    app.locals.draftStoreClient = {
      set: jest.fn(() => Promise.resolve({})),
      get: jest.fn(() => Promise.resolve(null)),
      del: jest.fn(() => Promise.resolve({})),
      ttl: jest.fn(() => Promise.resolve(-1)),
      expireat: jest.fn(() => Promise.resolve({})),
    };

    await request(app)
      .get(DASHBOARD_URL)
      .set(asUser('user-1'))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Claims made against you');
      });
  });

  it('renders view defendant information', async () => {
    await request(app)
      .get(VIEW_DEFENDANT_INFO.replace(':id', claimId))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('View information about the defendant');
      });
  });

  it('redirects a notification click to orders and notices', async () => {
    await request(app)
      .get(DASHBOARD_NOTIFICATION_REDIRECT
        .replace(':notificationId', 'note-1')
        .replace(':locationName', 'VIEW_ORDERS_AND_NOTICES')
        .replace(':id', claimId))
      .expect(302)
      .expect('Location', VIEW_ORDERS_AND_NOTICES_URL.replace(':id', claimId));
  });
});
