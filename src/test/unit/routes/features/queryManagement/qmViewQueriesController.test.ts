import request from 'supertest';
import {app} from '../../../../../main/app';
import {QM_VIEW_QUERY_URL} from 'routes/urls';
import nock from 'nock';
import config from 'config';
import * as ViewQueriesService from 'services/features/queryManagement/viewQueriesService';
import {CIVIL_SERVICE_CASES_URL} from 'client/civilServiceUrls';
import {CaseRole} from 'form/models/caseRoles';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
const mockBuildQueryListItems = ViewQueriesService.ViewQueriesService.buildQueryListItems as jest.Mock;

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/modules/utilityService');
jest.mock('services/features/queryManagement/viewQueriesService');

const civilServiceUrl = config.get<string>('services.civilService.url');
const claimId = '12345';
const claim = require('../../../../utils/mocks/civilClaimResponseMock.json');

describe('View query controller', () => {
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
      .reply(200, [CaseRole.CLAIMANT]);
  });

  describe('GET', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });
    it('should render query page', async () => {

      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claim);

      await request(app)
        .get(QM_VIEW_QUERY_URL.replace(':id', claimId))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Messages');
        });
    });

    it('should render view query page with query list items', async () => {
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claim);
      mockBuildQueryListItems.mockReturnValue([
        {
          subject: 'Test Subject',
          createdOnString: '01 Jan 2025',
          lastUpdatedBy: 'Court staff',
          lastUpdatedOnString: '02 Jan 2025',
          status: 'Response received',
        },
        {
          subject: 'Another Test Subject',
          createdOnString: '21 Jan 2025',
          lastUpdatedBy: 'You',
          lastUpdatedOnString: '25 Jan 2025',
          status: 'Message sent',
        },
      ]);

      const res = await request(app).get(QM_VIEW_QUERY_URL.replace(':id', claimId)).expect(200);
      expect(res.text).toContain('Message subject');
      expect(res.text).toContain('Sent on');
      expect(res.text).toContain('Last updated by');
      expect(res.text).toContain('Last updated on');
      expect(res.text).toContain('Status');
      // Row 1
      expect(res.text).toContain('Test Subject');
      expect(res.text).toContain('01 Jan 2025');
      expect(res.text).toContain('Court staff');
      expect(res.text).toContain('02 Jan 2025');
      expect(res.text).toContain('Response received');
      // Row 2
      expect(res.text).toContain('Another Test Subject');
      expect(res.text).toContain('21 Jan 2025');
      expect(res.text).toContain('You');
      expect(res.text).toContain('25 Jan 2025');
      expect(res.text).toContain('Message sent');
    });

    it('should render query page with no items', async () => {
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claim);
      mockBuildQueryListItems.mockReturnValue([]);
      const res = await request(app).get(QM_VIEW_QUERY_URL.replace(':id', claimId)).expect(200);
      expect(res.text).toContain('Messages');
      expect(res.text).not.toContain('Test Subject');
    });

    it('should return http 500 when has error', async () => {
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(500);
      await request(app)
        .get(QM_VIEW_QUERY_URL.replace(':id', claimId))
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
