import request from 'supertest';
import {app} from '../../../../../main/app';
import {QM_QUERY_DETAILS_URL} from 'routes/urls';
import nock from 'nock';
import config from 'config';
import * as ViewQueriesService from 'services/features/queryManagement/viewQueriesService';
import {CIVIL_SERVICE_CASES_URL} from 'client/civilServiceUrls';
import {CaseRole} from 'form/models/caseRoles';
import {FormattedDocument, QueryDetail, QueryListItem} from 'form/models/queryManagement/viewQuery';
import {YesNoUpperCamelCase} from 'form/models/yesNo';

const buildQueryListItemsByQueryIdMock = ViewQueriesService.ViewQueriesService.buildQueryListItemsByQueryId as jest.Mock;

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
      buildQueryListItemsByQueryIdMock.mockReturnValue(new QueryDetail(
        'Query 1',
        'PAGES.QM.VIEW_QUERY.STATUS_SENT',
        Array.of(new QueryListItem(
          'super important information, probably',
          YesNoUpperCamelCase.NO,
          Array.of(new FormattedDocument('fileName', 'documentUrl')),
          'You',
          '01 Jan 2025',
        ),
        new QueryListItem(
          'even more super important information, probably',
          YesNoUpperCamelCase.YES,
          Array.of(new FormattedDocument('fileName', 'documentUrl')),
          'You',
          '01 Jan 2025',
          '13 February 2025, 11:30:10 am',
        ),
        ),
      ));
    });
    it('should render query details', async () => {

      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claim);

      await request(app)
        .get(QM_QUERY_DETAILS_URL.replace(':id', claimId).replace(':queryId', '123456'))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Query 1');
          expect(res.text).toContain('Your message');
          expect(res.text).toContain('Message details');
          expect(res.text).toContain('super important information, probably');
          expect(res.text).toContain('Is your message about an upcoming hearing?');
          expect(res.text).toContain('No');
          expect(res.text).toContain('Uploaded documents (optional)');
          expect(res.text).toContain('Sent by');
          expect(res.text).toContain('You');
          expect(res.text).toContain('Sent on');
          expect(res.text).toContain('01 Jan 2025');
        });

    });

    it('should render query details without follow Up Button', async () => {

      const claimOffLine = {...claim};
      claimOffLine.case_data.ccdState = 'CASE_DISMISSED';
      claimOffLine.state = 'CASE_DISMISSED';
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claimOffLine);

      await request(app)
        .get(QM_QUERY_DETAILS_URL.replace(':id', claimId).replace(':queryId', '123456'))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Query 1');
          expect(res.text).toContain('Your message');
          expect(res.text).toContain('Message details');
          expect(res.text).toContain('super important information, probably');
          expect(res.text).toContain('Is your message about an upcoming hearing?');
          expect(res.text).toContain('No');
          expect(res.text).toContain('Uploaded documents (optional)');
          expect(res.text).toContain('Sent by');
          expect(res.text).toContain('You');
          expect(res.text).toContain('Sent on');
          expect(res.text).not.toContain('Send a follow up message');
        });
    });
  });
});
