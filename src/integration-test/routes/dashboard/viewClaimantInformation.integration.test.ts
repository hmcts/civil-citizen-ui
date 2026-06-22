import request from 'supertest';
import {app} from '../../../main/app';
import {VIEW_CLAIMANT_INFO} from '../../../main/routes/urls';
import {civilServiceClientMock} from '../../setup/sharedMocks';
import {Claim} from '../../../main/common/models/claim';
import {Party} from '../../../main/common/models/party';
import {PartyType} from '../../../main/common/models/partyType';
import {PartyDetails} from '../../../main/common/form/models/partyDetails';

describe('Integration: View claimant information route', () => {
  it('renders claimant information page from mocked claim data', async () => {
    const claim = new Claim();
    claim.id = '000MC001';
    claim.totalClaimAmount = 500;
    claim.claimantResponse = {mediation: {}} as never;
    claim.applicant1 = new Party();
    claim.applicant1.type = PartyType.INDIVIDUAL;
    claim.applicant1.partyDetails = new PartyDetails({
      individualFirstName: 'Jane',
      individualLastName: 'Doe',
    });

    civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(claim);

    await request(app)
      .get(VIEW_CLAIMANT_INFO.replace(':id', '000MC001'))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('View information about the claimant');
        expect(res.text).toContain('Case number: 000M C001');
        expect(res.text).toContain('Claim amount: £500.00');
      });
  });
});

