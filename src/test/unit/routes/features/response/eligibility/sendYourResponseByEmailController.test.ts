import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {SEND_RESPONSE_BY_EMAIL_URL} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {civilClaimResponseMock} from '../../../../../utils/mockDraftStore';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('Send your response by email', () => {
  const data = require('../../../../../utils/mocks/feeRangesMock.json');
  const citizenBaseUrl: string = config.get('services.civilService.url');
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    nock(citizenBaseUrl).get('/fees/ranges/').reply(200, data);
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  describe('on GET', () => {
    it('should return send your response by email page', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      await request(app)
        .get(SEND_RESPONSE_BY_EMAIL_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.SEND_YOUR_RESPONSE_BY_EMAIL);
          expect(res.text).toContain('How to counterclaim');
          expect(res.text).toContain('View claim fees');
          expect(res.text).toContain('How to counterclaim');
          expect(res.text).toContain('Help and support');
          expect(res.text).toContain('Email');
          expect(res.text).toContain('Telephone');
        });
    });
    it('should return http 500 when has error', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      await request(app)
        .get(SEND_RESPONSE_BY_EMAIL_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
