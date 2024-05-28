import {app} from '../../../../../main/app';
import config from 'config';
import {CaseRole} from 'form/models/caseRoles';
import {BUNDLES_URL, DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL} from 'routes/urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import {Claim} from 'models/claim';
import request from 'supertest';

const nock = require('nock');
jest.mock('../../../../../main/modules/oidc');

jest.mock('services/features/caseProgression/bundles/bundlesService', () => ({
  getBundlesContent: jest.fn(),
}));

describe('Bundles Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  const claim = new Claim();
  claim.id='1645882162449409';
  claim.totalClaimAmount=12000;

  describe('on GET', () => {

    it('Should return claimant elements of bundles page', async () => {
      //given
      claim.caseRole = CaseRole.CLAIMANT;

      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValueOnce(claim);

      //when
      await request(app).get(BUNDLES_URL.replace(':id', claim.id))
        //then
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('View the bundle');
          expect(res.text).toContain(DASHBOARD_CLAIMANT_URL.replace(':id', claim.id));
        });
    });

    it('Should return defendant elements of bundles page', async () => {
      //given
      claim.caseRole = CaseRole.DEFENDANT;

      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValueOnce(claim);

      //when
      await request(app).get(BUNDLES_URL.replace(':id', claim.id))
        //then
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('View the bundle');
          expect(res.text).toContain(DEFENDANT_SUMMARY_URL.replace(':id', claim.id));
        });
    });
  });
});
