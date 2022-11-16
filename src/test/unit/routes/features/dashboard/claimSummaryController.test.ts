import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {DEFENDANT_SUMMARY_URL} from '../../../../../main/routes/urls';
import {PartyType} from '../../../../../main/common/models/partyType';
import {CCDClaim, CivilClaimResponse} from '../../../../../main/common/models/civilClaimResponse';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

const mockCivilClaimResponse = new CivilClaimResponse();
mockCivilClaimResponse.case_data = new CCDClaim();
mockCivilClaimResponse.case_data.legacyCaseReference = '000MC009';
mockCivilClaimResponse.case_data.applicant1 = {
  companyName: '',
  individualDateOfBirth: '',
  individualFirstName: '',
  individualLastName: '',
  individualTitle: '',
  partyEmail: '',
  partyPhone: '',
  primaryAddress: undefined,
  soleTraderDateOfBirth: '',
  soleTraderFirstName: '',
  soleTraderLastName: '',
  soleTraderTitle: '',
  soleTraderTradingAs: '',
  type: PartyType.ORGANISATION,
  organisationName: 'Mr. Jan Clark',
};
mockCivilClaimResponse.case_data.respondent1 = {
  companyName: '',
  individualDateOfBirth: '',
  individualFirstName: '',
  individualLastName: '',
  individualTitle: '',
  partyEmail: '',
  partyPhone: '',
  primaryAddress: undefined,
  soleTraderDateOfBirth: '',
  soleTraderFirstName: '',
  soleTraderLastName: '',
  soleTraderTitle: '',
  soleTraderTradingAs: '',
  type: PartyType.ORGANISATION,
  organisationName: 'Version 1',
};

describe('Claim summary', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return your claim summary from civil-service', async () => {
      nock('http://localhost:4000')
        .get('/cases/5129')
        .reply(200, mockCivilClaimResponse);
      await request(app)
        .get(DEFENDANT_SUMMARY_URL.replace(':id', '5129'))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Mr. Jan Clark v Version 1');
          expect(res.text).toContain('000MC009');
          expect(res.text).toContain('Latest update');
          expect(res.text).toContain('Documents');
        });
    });
  });
});
