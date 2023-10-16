import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {mockCivilClaim, mockRedisFailure} from '../../../../utils/mockDraftStore';
import {setResponseDeadline} from 'services/features/common/responseDeadlineAgreedService';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/services/features/common/responseDeadlineAgreedService');
import * as draftStoreService from 'modules/draft-store/draftStoreService';

const mockSetResponseDeadline = setResponseDeadline as jest.Mock;

describe('Claimant details', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const claim = require('../../../../utils/mocks/civilClaimResponseMock.json');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    mockSetResponseDeadline.mockImplementation(async () => {
      return new Date();
    });
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  describe('on GET', () => {
    it('should return contact claimant details from claim', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(RESPONSE_TASK_LIST_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Respond to a money claim');
          expect(res.text).toContain('Prepare your response');
          expect(res.text).toContain('Respond to claim');
          expect(res.text).toContain('Submit');
          expect(res.text).toContain('Response deadline:');
          expect(res.text).toContain('15 May 2025'); // Response deadline value
          expect(res.text).toContain('Claim number:');
          expect(res.text).toContain(claim.case_data.legacyCaseReference);
          expect(res.text).toContain('Total claim amount:');
          expect(res.text).toContain(claim.case_data.totalClaimAmount.toString());
          expect(res.text).toContain('Claim details:');
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(RESPONSE_TASK_LIST_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
        });
    });
  });
});
