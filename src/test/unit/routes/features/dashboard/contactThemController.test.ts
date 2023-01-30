import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {CITIZEN_CONTACT_THEM_URL} from 'routes/urls';
import {mockCivilClaim, mockRedisFailure} from '../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../main/modules/oidc');

describe('Claimant details', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const claim = require('../../../../utils/mocks/civilClaimResponseMock.json');
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });
  describe('on GET', () => {
    it('should return contact claimant details from claim', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(CITIZEN_CONTACT_THEM_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Claimant');
          expect(res.text).toContain('Address');
          expect(res.text).toContain('Phone:');
          expect(res.text).toContain('About claim');
          expect(res.text).toContain('Claimant name:');
          expect(res.text).toContain('Claim amount:');
          expect(res.text).toContain('Claim details:');
          expect(res.text).toContain('Contact us for help');
          expect(res.text).toContain(claim.case_data.applicant1.partyDetails.partyName);
          expect(res.text).toContain(claim.case_data.applicant1.partyDetails.primaryAddress.addressLine1);
          expect(res.text).toContain(claim.case_data.applicant1.partyDetails.primaryAddress.addressLine2);
          expect(res.text).toContain(claim.case_data.applicant1.partyDetails.primaryAddress.addressLine3);
          expect(res.text).toContain(claim.case_data.applicant1.partyDetails.primaryAddress.postCode);
        });
    });
    it('should return http 500 when has error in the get method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CITIZEN_CONTACT_THEM_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
