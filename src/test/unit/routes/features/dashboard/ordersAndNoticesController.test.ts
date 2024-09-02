import config from 'config';
import nock from 'nock';
import {CIVIL_SERVICE_CASES_URL} from 'client/civilServiceUrls';
import {CaseRole} from 'form/models/caseRoles';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {VIEW_ORDERS_AND_NOTICES_URL} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

const civilServiceUrl = config.get<string>('services.civilService.url');
const claimId = '123';
const claim = require('../../../../utils/mocks/civilClaimResponseMock.json');

describe('view mediation settlement agreement document controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  beforeEach(() => {
    nock(civilServiceUrl)
      .get(CIVIL_SERVICE_CASES_URL + claimId + '/userCaseRoles')
      .reply(200, [CaseRole.DEFENDANT]);
  });

  describe('on Get', () => {
    it('should view the response to the claim', async () => {
      //Given
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claim);
      //then
      await request(app)
        .get(VIEW_ORDERS_AND_NOTICES_URL.replace(':id', claimId))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('View orders and notices');
        });
    });

    it('should return http 500 when has error', async () => {
      //given
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(500);

      //then
      await request(app)
        .get(VIEW_ORDERS_AND_NOTICES_URL.replace(':id', claimId))
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
