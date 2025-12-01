import request from 'supertest';
import nock from 'nock';
import config from 'config';
import { app } from '../../../../../main/app';
import { Claim } from 'common/models/claim';
import claim from '../../../../utils/mocks/civilClaimResponseMock.json';
import { VIEW_CLAIMANT_INFO } from 'routes/urls';
import {CivilServiceClient} from 'client/civilServiceClient';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/app/client/civilServiceClient');

describe('View Defendant Information', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
  });
  it('should return contact claimant details from claim ', async () => {
    const caseData = Object.assign(new Claim(), claim.case_data);
    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValueOnce(caseData);
    await request(app)
      .get(VIEW_CLAIMANT_INFO)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('View information about the claimant');
        expect(res.text).toContain('Phone:');
        expect(res.text).toContain('Contact us for help');
        expect(res.text).toContain(claim.case_data.applicant1.partyDetails.partyName);
        expect(res.text).toContain(claim.case_data.applicant1.partyDetails.primaryAddress.addressLine1);
        expect(res.text).toContain(claim.case_data.applicant1.partyDetails.primaryAddress.addressLine2);
        expect(res.text).toContain(claim.case_data.applicant1.partyDetails.primaryAddress.addressLine3);
        expect(res.text).toContain(claim.case_data.applicant1.partyDetails.primaryAddress.postCode);
      });
  });
});
