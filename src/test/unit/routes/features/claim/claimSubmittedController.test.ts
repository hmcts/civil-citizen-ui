import {CLAIM_CONFIRMATION_URL} from 'routes/urls';

import nock from 'nock';
import request from 'supertest';
import config from 'config';
import {mockCivilClaim, mockRedisFailure} from '../../../../utils/mockDraftStore';
import {getClaimById} from 'modules/utilityService';
import {Claim} from 'models/claim';
import claim from '../../../../utils/mocks/civilClaimResponseMock.json';
import {checkIfClaimFeeHasChanged} from 'services/features/claim/amount/checkClaimFee';
import {YesNo} from 'form/models/yesNo';

const {app} = require('../../../../../main/app');

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('services/features/claim/amount/checkClaimFee');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));

const claimFeeHasChanged = checkIfClaimFeeHasChanged as jest.Mock;

describe('Claim - Claim Submitted', () => {
  const idamServiceUrl: string = config.get('services.idam.url');
  const citizenRoleToken: string = config.get('citizenRoleToken');

  const claimId = '1111111111';
  const caseData = Object.assign(new Claim(), claim.case_data);

  beforeAll(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    app.locals.draftStoreClient = mockCivilClaim;
  });

  describe('on GET', () => {
    it('should return claim submitted page  when HWF number not submitted ' +
      ': Pay Fee button set with Fee Change Url', async () => {
      //given
      claimFeeHasChanged.mockImplementation(() => {
        return true;
      });
      caseData.claimDetails.helpWithFees = {
        'option': YesNo.NO,
      };
      (getClaimById as jest.Mock).mockReturnValue(caseData);
      //when-then
      await request(app)
        .get(CLAIM_CONFIRMATION_URL.replace(':id', claimId))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Claim submitted');
          expect(res.text).toContain('/claim/'+claimId+'/fee-change');
        });
    });

    it('should return claim submitted page and HWF number not submitted ' +
      ': Pay Fee button set with Pay  fee Breakup Url', async () => {
      //given
      claimFeeHasChanged.mockImplementation(() => {
        return false;
      });
      caseData.claimDetails.helpWithFees = {
        'option': YesNo.NO,
      };
      (getClaimById as jest.Mock).mockReturnValue(caseData);
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
      app.locals.draftStoreClient = mockRedisFailure;
      //when-then
      await request(app)
        .get(CLAIM_CONFIRMATION_URL.replace(':id', claimId))
        .expect((res) => {
          expect(res.status).toBe(500);
        });
    });
  });
});
