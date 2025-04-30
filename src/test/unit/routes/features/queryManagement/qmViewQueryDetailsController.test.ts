import request from 'supertest';
import {app} from '../../../../../main/app';
import {QM_QUERY_DETAILS_URL} from 'routes/urls';
import nock from 'nock';
import config from 'config';
import * as ViewQueriesService from 'services/features/queryManagement/viewQueriesService';
import {CIVIL_SERVICE_CASES_URL} from 'client/civilServiceUrls';
import {CaseRole} from 'form/models/caseRoles';
import {FormDocument} from 'models/queryManagement/caseQueries';
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
  const attachment: FormDocument[] = [
    {
      id: 'anAttachment',
      value: {
        document_url: 'http://fake.com',
        document_filename: 'banana.pdf',
        document_binary_url: 'http://fake/binary',
        category_id: 'categoryId',
      },
    },
  ];

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
      mockBuildQueryListItems.mockReturnValue([
        {
          id: '123456',
          subject: 'Query 1',
          body: 'super important information, probably',
          attachments: null,
          isHearingRelated: 'No',
          createdOn: '01 Jan 2025',
          createdOnString: '01 Jan 2025',
          children: [],
          lastUpdatedOn: '01 Jan 2025',
          lastUpdatedOnString: '01 Jan 2025',
          lastUpdatedBy: 'You',
          status: 'Message sent',
          parentDocumentLinks: 'null',
          childDocumentLinks: null,
        },
        {
          id: '654321',
          subject: 'Query 2',
          body: 'even more super important information, probably',
          attachments: attachment,
          isHearingRelated: 'Yes',
          createdOn: '02 Feb 2025',
          createdOnString: '02 Feb 2025',
          lastUpdatedOn: '09 Feb 2025',
          lastUpdatedOnString: '09 Feb 2025',
          lastUpdatedBy: 'Court staff',
          status: 'Message received',
          parentDocumentLinks: 'banana.pdf',
          childDocumentLinks: 'banana.pdf',
          children: [
            {
              id: '789654',
              parentId: '654321',
              subject: 'Query 2',
              body: 'a very formal reply',
              attachments: attachment,
              isHearingRelated: 'Yes',
              createdOn: '09 Feb 2025',
              createdOnString: '09 Feb 2025',
              lastUpdatedOn: '09 Feb 2025',
              lastUpdatedOnString: '09 Feb 2025',
              lastUpdatedBy: 'Court staff',
              status: 'Response received',
              parentDocumentLinks: 'banana.pdf',
              childDocumentLinks: 'banana.pdf',
            },
          ],
        },
      ]);
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

    it('should render query details, parent with children ', async () => {

      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claim);

      await request(app)
        .get(QM_QUERY_DETAILS_URL.replace(':id', claimId).replace(':queryId', '654321'))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Query 2');
          expect(res.text).toContain('Your message');
          expect(res.text).toContain('Message details');
          expect(res.text).toContain('even more super important information, probably');
          expect(res.text).toContain('Is your message about an upcoming hearing?');
          expect(res.text).toContain('Yes');
          expect(res.text).toContain('Uploaded documents (optional)');
          expect(res.text).toContain('banana.pdf');
          expect(res.text).toContain('Sent by');
          expect(res.text).toContain('You');
          expect(res.text).toContain('Sent on');
          expect(res.text).toContain('02 Feb 2025');
          // child card
          expect(res.text).toContain('Court&#39;s response');
          expect(res.text).toContain('Message details');
          expect(res.text).toContain('a very formal reply');
          expect(res.text).toContain('Is your message about an upcoming hearing?');
          expect(res.text).toContain('Yes');
          expect(res.text).toContain('Uploaded documents (optional)');
          expect(res.text).toContain('banana.pdf');
          expect(res.text).toContain('Sent by');
          expect(res.text).toContain('Court staff');
          expect(res.text).toContain('Sent on');
          expect(res.text).toContain('09 Feb 2025');
        });
    });
  });
});
