import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {CLAIM_FEE_CHANGE_URL, CLAIMANT_TASK_LIST_URL} from 'routes/urls';
import {mockCivilClaim, mockRedisFailure} from '../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {getDraftClaimData} from '../../../../../main/services/dashboard/draftClaimService';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/services/dashboard/draftClaimService.ts');

const getData = getDraftClaimData as jest.Mock;
const civilServiceUrl = config.get<string>('services.civilService.url');

describe('Claimant Date of Birth Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should claim fee page with no draft claim data', async () => {

      nock(civilServiceUrl)
        .get('/fees/claim/110')
        .reply(200, {calculatedAmountInPence : 8000});

      getData.mockResolvedValue({
        claimCreationUrl: 'testOcmcUrl',
        draftClaim: undefined,
      });

      app.locals.draftStoreClient = mockCivilClaim;
      const res = await request(app).get(CLAIM_FEE_CHANGE_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('Claim fee has changed');
      expect(res.text).toContain('testOcmcUrl');
    });

    it('should claim fee page with claim data', async () => {

      nock(civilServiceUrl)
        .get('/fees/claim/110')
        .reply(200, {calculatedAmountInPence : 8000});

      getData.mockResolvedValue({
        claimCreationUrl: 'testOcmcUrl',
        draftClaim: {
          claimId: 'draftClaim',
        },
      });

      app.locals.draftStoreClient = mockCivilClaim;
      const res = await request(app).get(CLAIM_FEE_CHANGE_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('Claim fee has changed');
      expect(res.text).toContain(CLAIMANT_TASK_LIST_URL);
    });

    it('should return http 500 when has error in the get method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CLAIM_FEE_CHANGE_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
