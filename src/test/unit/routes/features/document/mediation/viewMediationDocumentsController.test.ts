import config from 'config';
import nock from 'nock';
import {VIEW_MEDIATION_DOCUMENTS} from 'routes/urls';
import request from 'supertest';
import {CIVIL_SERVICE_CASES_URL} from 'client/civilServiceUrls';

import {app} from '../../../../../../main/app';
import {CaseRole} from 'form/models/caseRoles';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {
  MEDIATION_DOCUMENTS_MOCK,
} from '../../../../../utils/mocks/Mediation/uploadFilesMediationMocks';

jest.mock('../../../../../../main/modules/oidc');

const civilServiceUrl = config.get<string>('services.civilService.url');
const claimId = '123';

describe('view mediation document controller', () => {
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
      .reply(200, [CaseRole.APPLICANTSOLICITORONE]);
  });

  describe('on Get', () => {
    it('should view mediation agreement ', async () => {
      //Given
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, MEDIATION_DOCUMENTS_MOCK(claimId));
      //then
      await request(app)
        .get(VIEW_MEDIATION_DOCUMENTS.replace(':id', claimId))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VIEW_MEDIATION_DOCUMENTS);
        });
    });

    it('should return http 500 when has error', async () => {
      //given
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(500);

      //then
      await request(app)
        .get(VIEW_MEDIATION_DOCUMENTS.replace(':id', claimId))
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
