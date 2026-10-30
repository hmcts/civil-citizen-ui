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
import {
  DASHBOARD_NOTIFICATION_REDIRECT,
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

describe('Integration: dashboard pages', () => {
  beforeEach(() => {
    civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(buildClaim());
    civilServiceClientMock.recordClick.mockResolvedValue(undefined);
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
