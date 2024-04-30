import config from 'config';
import nock from 'nock';
import {VIEW_RESPONSE_TO_CLAIM} from 'routes/urls';
import request from 'supertest';
import {CIVIL_SERVICE_CASES_URL} from 'client/civilServiceUrls';

import {app} from '../../../../../main/app';
import {CaseRole} from 'form/models/caseRoles';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../main/modules/oidc');

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
        .get(VIEW_RESPONSE_TO_CLAIM.replace(':id', claimId))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('View the response to the claim');
        });
    });

    it('should return http 500 when has error', async () => {
      //given
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(500);

      //then
      await request(app)
        .get(VIEW_RESPONSE_TO_CLAIM.replace(':id', claimId))
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
