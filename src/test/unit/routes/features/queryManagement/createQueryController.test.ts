import request from 'supertest';
import {app} from '../../../../../main/app';
import {QUERY_MANAGEMENT_CREATE_QUERY} from 'routes/urls';
import nock from 'nock';
import config from 'config';
import * as QueryManagementService from 'services/features/queryManagement/queryManagementService';
import * as utilityService from 'modules/utilityService';
import {Claim} from 'models/claim';
import {QueryManagement} from 'form/models/queryManagement/queryManagement';
import {CreateQuery} from 'models/queryManagement/createQuery';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('services/features/queryManagement/queryManagementService');
jest.mock('../../../../../main/modules/utilityService');
jest.mock('routes/guards/shareQueryConfirmationGuard', () => ({
  shareQueryConfirmationGuard: (req: any, res: any, next: any) => next(),
  clearShareQuerySessionIfLeftJourney: (req: any, res: any, next: any) => next(),
}));

const mockGetClaimById = utilityService.getClaimById as jest.Mock;

describe('create query conroller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('GET', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });
    it('should render query page', async () => {
      mockGetClaimById.mockImplementation(async () => {
        return new Claim();
      });
      await request(app)
        .get(QUERY_MANAGEMENT_CREATE_QUERY)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Send a message');
          expect(res.text).toContain('Enter message details');
          expect(res.text).toContain('Message subject');
          expect(res.text).toContain('The subject should be a summary of your message');
          expect(res.text).toContain('Message details');
          expect(res.text).toContain('Include as many details as possible so case workers can respond to your message');
          expect(res.text).toContain('Is your message about an upcoming hearing?');
          expect(res.text).toContain('Upload documents (optional)');
        });
    });

    it('should pre fill field values when session data is set', async () => {
      const date = new Date();
      const preFilledData = {'messageSubject': 'test sub', 'messageDetails': 'test body', 'isHearingRelated': 'yes',
        'year': (date.getFullYear() + 1).toString(), 'month': date.getMonth().toString(), 'day': date.getDay().toString()};
      mockGetClaimById.mockImplementation(async () => {
        const claim = new Claim();
        claim.queryManagement = new QueryManagement();
        claim.queryManagement.createQuery = preFilledData as unknown as CreateQuery;
        return claim;
      });

      await request(app)
        .get(QUERY_MANAGEMENT_CREATE_QUERY)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('test sub');
          expect(res.text).toContain('test body');
          expect(res.text).toContain('yes');
        });
    });
  });

  describe('POST', ()=> {

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should redirect on successful form', async () => {
      mockGetClaimById.mockImplementation(async () => {
        return new Claim();
      });
      const saveQueryManagement = jest.spyOn(QueryManagementService, 'saveQueryManagement');
      const date = new Date();
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear() + 1;
      const data = {'messageSubject': 'test sub', 'messageDetails': 'test body', 'isHearingRelated': 'yes', 'year': year.toString(),
        'month': month.toString(), 'day': day.toString()};
      const res = await request(app).post(QUERY_MANAGEMENT_CREATE_QUERY).send(data);
      expect(res.status).toBe(302);
      expect(saveQueryManagement).toHaveBeenCalled();
    });

    it('should render the page with errors for the missing fields', async () => {
      mockGetClaimById.mockImplementation(async () => {
        return new Claim();
      });
      const res = await request(app).post(QUERY_MANAGEMENT_CREATE_QUERY).send({});
      expect(res.status).toBe(200);
      expect(res.text).toContain('There was a problem');
      expect(res.text).toContain('Enter message subject');
      expect(res.text).toContain('Enter message details');
      expect(res.text).toContain('Is your message about an upcoming hearing?');
    });

    it('should trigger redirect on successful file upload', async () => {
      mockGetClaimById.mockImplementation(async () => {
        return new Claim();
      });

      const uploadSelectedFile = jest.spyOn(QueryManagementService, 'uploadSelectedFile');
      await request(app).post(QUERY_MANAGEMENT_CREATE_QUERY).send({
        action: 'uploadButton',
        messageSubject: 'test sub',
        messageDetails: 'test body',
        isHearingRelated: 'no',
      })
        .expect(res => {
          expect(res.status).toBe(302);
          expect(uploadSelectedFile).toHaveBeenCalled();
        });
    });

    it('should trigger redirect on successful file exclusion', async () => {
      mockGetClaimById.mockImplementation(async () => {
        return new Claim();
      });

      const spyRemoveSelectedDocument = jest.spyOn(QueryManagementService, 'removeSelectedDocument');
      await request(app).post(QUERY_MANAGEMENT_CREATE_QUERY).send({
        action: '[1][deleteFile]',
        messageSubject: 'test sub',
        messageDetails: 'test body',
        isHearingRelated: 'no',
      })
        .expect(res => {
          expect(res.status).toBe(302);
          expect(spyRemoveSelectedDocument).toHaveBeenCalled();
        });
    });
  });
});
