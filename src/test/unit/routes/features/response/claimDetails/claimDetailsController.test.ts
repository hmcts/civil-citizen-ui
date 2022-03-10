import request from 'supertest';
import {app} from '../../../../../../main/app';
import config from 'config';
import {
  CLAIM_DETAILS,
  CLAIM_NUMBER,
} from '../../../../../../main/common/form/validationErrors/errorMessageConstants';
import {mockClaim as mockResponse} from '../../../../../utils/mockClaim';
//import {mockClaim as mockResponse} from '../../../../../utils/mockClaim';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
const nock = require('nock');

describe('Confirm Details page', () => {
  const idamUrl: string = config.get('idamUrl');
  const citizenRoleToken: string = config.get('citizenRoleToken');

  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on Get', () => {
    test('should return your claim details page with default values', async () => {
      nock('http://localhost:4000')
        .get('/cases/1111')
        .reply(400 );

      await request(app)
        .get('/case/1111/response/claim-details')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(CLAIM_DETAILS);
          expect(res.text).toContain(CLAIM_NUMBER);
        });
    });
    test('should return your claim details page with values from civil-service', async () => {
      nock('http://localhost:4000')
        .get('/cases/1111')
        .reply(200, mockResponse );

      await request(app)
        .get('/case/1111/response/claim-details')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(CLAIM_DETAILS);
          expect(res.text).toContain(mockResponse.legacyCaseReference);
        });
    });
  });
});

