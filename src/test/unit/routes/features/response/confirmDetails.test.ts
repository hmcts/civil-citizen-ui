import request from 'supertest';

import {app} from '../../../../../../main/app';
import config from 'config';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

const nock = require('nock');

const agent = request.agent(app);

describe('Confirm Details page', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  test('should return your details page', async () => {
    await agent
      .get('/case/12334/response/your-details')
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Confirm your details');
      });
  });

  test('POST/Citizen details', async () => {
    await agent
      .post('/case/12334/response/your-details')
      .send({
        primaryAddressLine1: 'Flat 3A Middle Road',
        primaryAddressLine2: 'Flat 3A Middle Road',
        primaryAddressLine3: '',
        primaryCity: 'London',
        primaryPostCode: 'SW1H 9AJ',
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
      })
      .expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toContain('case/1643033241924739/response/your-dob');
      });
  });
});
