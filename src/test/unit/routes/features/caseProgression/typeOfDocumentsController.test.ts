import request from 'supertest';
import {civilClaimResponseMock,
} from '../../../../utils/mockDraftStore';
import {
  TYPES_OF_DOCUMENTS_URL,
  CP_UPLOAD_DOCUMENTS_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {app} from '../../../../../main/app';
import config from 'config';
import nock from 'nock';
import express from 'express';
import {isCaseProgressionV1Enable} from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import civilClaimResponseDefendantMock from '../../../../utils/mocks/civilClaimResponseDefendantMock.json';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');

const mockGetCaseData = getCaseDataFromStore as jest.Mock;
const typeOfDocumentUrl = TYPES_OF_DOCUMENTS_URL.replace(':id', 'aaa');

describe('Upload document- type of documents controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });
  beforeEach(()=> {
    (isCaseProgressionV1Enable as jest.Mock).mockReturnValueOnce(true);
  });
  describe('on GET', () => {
    it('should render page successfully if cookie has correct values', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      await request(app).get(typeOfDocumentUrl).query({lang: 'en'}).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('What types of documents do you want to upload?');
        expect(res.text).toContain('Hearing');
      });
    });

    it('should render page successfully in Welsh if cookie has correct values and query gives cy', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      await request(app).get(typeOfDocumentUrl).query({lang: 'cy'}).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Pa fath o ddogfennau ydych chi eisiau eu huwchlwytho?');
        expect(res.text).toContain('Gwrandawiad');
      });
    });

    it('should render page successfully on defendant request if cookie has correct values', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseDefendantMock.case_data);
      });
      await request(app).get(typeOfDocumentUrl).query({lang: 'en'}).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('What types of documents do you want to upload?');
        expect(res.text).toContain('Hearing');
      });
    });

    it('should render page successfully  in Welsh on defendant request if cookie has correct values and query gives cy', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseDefendantMock.case_data);
      });
      await request(app).get(typeOfDocumentUrl).query({lang: 'cy'}).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Pa fath o ddogfennau ydych chi eisiau eu huwchlwytho?');
        expect(res.text).toContain('Gwrandawiad');
      });
    });

    it('should return 500 error page for redis failure', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(typeOfDocumentUrl)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
  describe('on POST', () => {
    beforeEach(() => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      (isCaseProgressionV1Enable as jest.Mock).mockReturnValueOnce(true);
    });
    it('should display error when there is no option selection', async () => {
      await request(app)
        .post(typeOfDocumentUrl)
        .send({
          model: {items:[]},
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_ENTER_AT_LEAST_ONE_UPLOAD);
        });
    });

    it('when at least 1 is  selected, should redirect to Upload documents screen', async () => {
      await request(app)
        .post(typeOfDocumentUrl)
        .send({
          documents: 'documents',
          list: 'list',
        })
        .expect((res: express.Response) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CP_UPLOAD_DOCUMENTS_URL.replace(':id', 'aaa'));
        });
    });

    it('when at least 1 is  selected, should redirect to Upload documents screen on defendant request', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseDefendantMock.case_data);
      });
      await request(app)
        .post(typeOfDocumentUrl)
        .send({
          documents: 'documents',
          list: 'list',
        })
        .expect((res: express.Response) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CP_UPLOAD_DOCUMENTS_URL.replace(':id', 'aaa'));
        });
    });
  });
});
