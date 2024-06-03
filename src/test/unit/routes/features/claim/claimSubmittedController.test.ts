import {CLAIM_CONFIRMATION_URL} from 'routes/urls';

import nock from 'nock';
import request from 'supertest';
import config from 'config';
import {mockCivilClaim} from '../../../../utils/mockDraftStore';
import {Claim} from 'models/claim';
import claim from '../../../../utils/mocks/civilClaimResponseMock.json';
import {YesNo} from 'form/models/yesNo';
import {CivilServiceClient} from 'client/civilServiceClient';

const {app} = require('../../../../../main/app');

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('services/features/claim/amount/checkClaimFee');
jest.mock('modules/utilityService', () => ({
  getRedisStoreForSession: jest.fn(),
}));

describe('Claim - Claim Submitted', () => {
  const idamServiceUrl: string = config.get('services.idam.url');
  const citizenRoleToken: string = config.get('citizenRoleToken');

  const claimId = '1111111111';
  const caseData = Object.assign(new Claim(), claim.case_data);

  beforeAll(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
    app.locals.draftStoreClient = mockCivilClaim;
  });

  describe('on GET', () => {

    it('should return claim submitted page and HWF number not submitted ' +
      ': Pay Fee button set with Pay  fee Breakup Url', async () => {
      //given
      caseData.claimDetails.helpWithFees = {
        'option': YesNo.NO,
      };
      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValueOnce(caseData);
      //when-then
      await request(app)
        .get(CLAIM_CONFIRMATION_URL.replace(':id', claimId))
        .expect(res => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Claim submitted');
          expect(res.text).toContain(claimId);
          expect(res.text).toContain('/claim/'+claimId+'/fee');
        });
    });

    it('should contain help with fees info', async () => {
      //given
      caseData.claimDetails.helpWithFees = {
        'option': YesNo.YES,
      };
      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValueOnce(caseData);
      const text = 'Your claim will be issued once your Help With Fees application has been confirmed.';
      //when-then
      await request(app)
        .get(CLAIM_CONFIRMATION_URL)
        .expect(res => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Claim submitted');
          expect(res.text).toContain(text);
        });
    });

    it('should return 500 status code when error occurs', async () => {
      //given
      const error = new Error('Test error');
      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockRejectedValueOnce(error);
      //when-then
      await request(app)
        .get(CLAIM_CONFIRMATION_URL.replace(':id', claimId))
        .expect((res) => {
          expect(res.status).toBe(500);
        });
    });
  });
});
