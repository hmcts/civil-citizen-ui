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

  const queryMessage=()=>new QueryListItem(
    'initial query',
    YesNoUpperCamelCase.NO,
    Array.of(new FormattedDocument('fileName', 'documentUrl')),
    'claimant-user-id',
    'Claimant',
    '01 Jan 2025',
    true,
  );

  const responseMessage=()=>new QueryListItem(
    'query response',
    YesNoUpperCamelCase.YES,
    Array.of(new FormattedDocument('fileName', 'documentUrl')),
    'caseworker-user-id',
    'Caseworker',
    '01 Jan 2025',
    true,
    '13 February 2025, 11:30:10 am',
  );

  const followUpMessage=()=>new QueryListItem(
    'query follow up',
    YesNoUpperCamelCase.YES,
    Array.of(new FormattedDocument('fileName', 'documentUrl')),
    'claimant-user-id',
    'Claimant',
    '01 Jan 2025',
    true,
    '13 February 2025, 11:30:10 am',
  );

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

    it('should render query details with a single message without follow up button', async () => {
      buildQueryListItemsByQueryIdMock.mockReturnValue(new QueryDetail(
        'Query 1',
        'PAGES.QM.VIEW_QUERY.STATUS_SENT',
        Array.of(queryMessage()), false, '',
      ));

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
          expect(res.text).toContain('initial query');
          expect(res.text).toContain('Is your message about an upcoming hearing?');
          expect(res.text).toContain('No');
          expect(res.text).toContain('Attachments');
          expect(res.text).toContain('Sent by');
          expect(res.text).toContain('You');
          expect(res.text).toContain('Sent on');
          expect(res.text).not.toContain('Send a follow up message');
        });
    });

    it('should render query details with a query and response with follow up button', async () => {
      buildQueryListItemsByQueryIdMock.mockReturnValue(new QueryDetail(
        'Query 1',
        'PAGES.QM.VIEW_QUERY.STATUS_RECEIVED',
        Array.of(queryMessage(), responseMessage()),
        false, '',
      ));

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
          expect(res.text).toContain('initial query');
          expect(res.text).toContain('query response');
          expect(res.text).toContain('Is your message about an upcoming hearing?');
          expect(res.text).toContain('No');
          expect(res.text).toContain('Attachments');
          expect(res.text).toContain('Sent by');
          expect(res.text).toContain('You');
          expect(res.text).toContain('Sent on');
          expect(res.text).toContain('Send a follow up message');
          expect(res.text).toContain('Only send follow up messages related to the original query.');
          expect(res.text).toContain('Sending follow up messages that are not related will delay the court’s response.');
          expect(res.text).not.toContain('The court is reviewing the message');
          expect(res.text).not.toContain('Our team will read the message and respond.');
        });
    });

    it('should render query details with a query, response and follow up without follow up button', async () => {
      buildQueryListItemsByQueryIdMock.mockReturnValue(new QueryDetail(
        'Query 1',
        'PAGES.QM.VIEW_QUERY.STATUS_SENT',
        Array.of(queryMessage(), responseMessage(), followUpMessage()),
        false, '',
      ));

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
          expect(res.text).toContain('initial query');
          expect(res.text).toContain('query response');
          expect(res.text).toContain('query follow up');
          expect(res.text).toContain('Is your message about an upcoming hearing?');
          expect(res.text).toContain('No');
          expect(res.text).toContain('Attachments');
          expect(res.text).toContain('Sent by');
          expect(res.text).toContain('You');
          expect(res.text).toContain('Sent on');
          expect(res.text).toContain('The court is reviewing the message');
          expect(res.text).toContain('Our team will read the message and respond.');
          expect(res.text).not.toContain('Send a follow up message');
          expect(res.text).not.toContain('Only send follow up messages related to the original query.');
          expect(res.text).not.toContain('Sending follow up messages that are not related will delay the court’s response.');
        });
    });

    it('should render query details with a query and response without follow up button when case is offline', async () => {
      const claimOffLine = {...claim};
      claimOffLine.case_data.ccdState = 'CASE_DISMISSED';
      claimOffLine.state = 'CASE_DISMISSED';
      buildQueryListItemsByQueryIdMock.mockReturnValue(new QueryDetail(
        'Query 1',
        'PAGES.QM.VIEW_QUERY.STATUS_RECEIVED',
        Array.of(queryMessage(), responseMessage()),
        false, '',
      ));

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
          expect(res.text).toContain('initial query');
          expect(res.text).toContain('query response');
          expect(res.text).toContain('Is your message about an upcoming hearing?');
          expect(res.text).toContain('No');
          expect(res.text).toContain('Attachments');
          expect(res.text).toContain('Sent by');
          expect(res.text).toContain('You');
          expect(res.text).toContain('Sent on');
          expect(res.text).toContain('The court is reviewing the message');
          expect(res.text).toContain('Our team will read the message and respond.');
          expect(res.text).not.toContain('Send a follow up message');
          expect(res.text).not.toContain('Only send follow up messages related to the original query.');
          expect(res.text).not.toContain('Sending follow up messages that are not related will delay the court’s response.');
        });
    });
  });
});
