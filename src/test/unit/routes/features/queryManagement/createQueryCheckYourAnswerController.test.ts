import request from 'supertest';
import { app } from '../../../../../main/app';
import {QM_CYA, QM_FOLLOW_UP_CYA} from 'routes/urls';
import nock from 'nock';
import config from 'config';
import * as utilityService from 'modules/utilityService';
import { Claim } from 'models/claim';
import { QueryManagement } from 'form/models/queryManagement/queryManagement';
import { CreateQuery } from 'models/queryManagement/createQuery';
import * as createCheckYourAnswerService from 'services/features/queryManagement/createQueryCheckYourAnswerService';
import * as QueryManagementService from 'services/features/queryManagement/queryManagementService';
import { CivilServiceClient } from 'client/civilServiceClient';
import { CaseRole } from 'form/models/caseRoles';
import {SendFollowUpQuery} from 'models/queryManagement/sendFollowUpQuery';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('services/features/queryManagement/queryManagementService');
jest.mock('../../../../../main/modules/utilityService');

const mockGetClaimById = utilityService.getClaimById as jest.Mock;

describe('create query check your answer controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });
  afterAll(() => {
    jest.clearAllMocks();
  });
  describe('GET', () => {
    it('should render query page from create query', async () => {
      mockGetClaimById.mockImplementation(async () => {
        const claim = new Claim();
        claim.queryManagement = new QueryManagement();
        const date = new Date();
        claim.queryManagement.createQuery = new CreateQuery('Dummy subject', 'Message details', 'Yes', (date.getFullYear() + 1).toString(), date.getMonth().toString(), date.getDay().toString());
        return claim;
      });
      await request(app)
        .get(QM_CYA)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Dummy subject');
          expect(res.text).toContain('Send a message');
          expect(res.text).toContain('Review message details');
          expect(res.text).toContain('Message subject');
          expect(res.text).toContain('Message details');
          expect(res.text).toContain('Is your message about an upcoming hearing?');
          expect(res.text).toContain('Attachments');
        });
    });

    it('should render query page from follow up', async () => {
      mockGetClaimById.mockImplementation(async () => {
        const claim = new Claim();
        claim.queryManagement = new QueryManagement();
        claim.queryManagement.sendFollowUpQuery = new SendFollowUpQuery('Dummy details');
        return claim;
      });
      await request(app)
        .get(QM_FOLLOW_UP_CYA)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Send a follow up message');
          expect(res.text).toContain('Check your answers');
          expect(res.text).toContain('Dummy details');
        });
    });

    it('should catch the error for civil service call failure from create query', async () => {
      mockGetClaimById.mockRejectedValueOnce('civil service call fail');
      await request(app)
        .get(QM_CYA)
        .expect((res) => {
          expect(res.status).toBe(500);
        });
    });

    it('should catch the error for civil service call failure from follow up', async () => {
      mockGetClaimById.mockRejectedValueOnce('civil service call fail');
      await request(app)
        .get(QM_FOLLOW_UP_CYA)
        .expect((res) => {
          expect(res.status).toBe(500);
        });
    });
  });

  describe('POST', () => {
    let retrieveClaimDetails: unknown;
    let saveQueryManagement: unknown;

    beforeEach(() => {
      retrieveClaimDetails = jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValueOnce(new Claim());
      saveQueryManagement = jest.spyOn(QueryManagementService, 'saveQueryManagement');
    });

    it('should submit the query for the claimant', async () => {
      mockGetClaimById.mockImplementation(async () => {
        const claim = new Claim();
        claim.caseRole = CaseRole.CLAIMANT;
        claim.queryManagement = new QueryManagement();
        const date = new Date();
        claim.queryManagement.createQuery = new CreateQuery('Dummy subject', 'Message details', 'Yes', (date.getFullYear() + 1).toString(), date.getMonth().toString(), date.getDay().toString());
        return claim;
      });
      const createApplicantCitizenQuery = jest.spyOn(createCheckYourAnswerService, 'createApplicantCitizenQuery').mockResolvedValueOnce(undefined);

      await request(app)
        .post(QM_CYA)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(createApplicantCitizenQuery).toHaveBeenCalled();
          expect(retrieveClaimDetails).toHaveBeenCalled();
          expect(saveQueryManagement).toHaveBeenCalled();
        });
    });

    it('should submit the query for the claimant follow up', async () => {
      mockGetClaimById.mockImplementation(async () => {
        const claim = new Claim();
        claim.caseRole = CaseRole.CLAIMANT;
        claim.queryManagement = new QueryManagement();
        claim.queryManagement.sendFollowUpQuery = new SendFollowUpQuery('Dummy details');
        return claim;
      });
      const createApplicantCitizenQuery = jest.spyOn(createCheckYourAnswerService, 'createApplicantCitizenQuery').mockResolvedValueOnce(undefined);

      await request(app)
        .post(QM_FOLLOW_UP_CYA)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(createApplicantCitizenQuery).toHaveBeenCalled();
          expect(retrieveClaimDetails).toHaveBeenCalled();
          expect(saveQueryManagement).toHaveBeenCalled();
        });
    });

    it('should submit the query for the defendant', async () => {
      mockGetClaimById.mockImplementation(async () => {
        const claim = new Claim();
        claim.caseRole = CaseRole.DEFENDANT;
        claim.queryManagement = new QueryManagement();
        const date = new Date();
        claim.queryManagement.createQuery = new CreateQuery('Dummy subject', 'Message details', 'Yes', (date.getFullYear() + 1).toString(), date.getMonth().toString(), date.getDay().toString());
        return claim;
      });
      const createRespondentCitizenQuery = jest.spyOn(createCheckYourAnswerService, 'createRespondentCitizenQuery').mockResolvedValueOnce(undefined);
      await request(app)
        .post(QM_CYA)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(createRespondentCitizenQuery).toHaveBeenCalled();
          expect(retrieveClaimDetails).toHaveBeenCalled();
          expect(saveQueryManagement).toHaveBeenCalled();
        });
    });

    it('should submit the query for the defendant follow up', async () => {
      mockGetClaimById.mockImplementation(async () => {
        const claim = new Claim();
        claim.caseRole = CaseRole.DEFENDANT;
        claim.queryManagement = new QueryManagement();
        claim.queryManagement.sendFollowUpQuery = new SendFollowUpQuery('Dummy details');
        return claim;
      });
      const createRespondentCitizenQuery = jest.spyOn(createCheckYourAnswerService, 'createRespondentCitizenQuery').mockResolvedValueOnce(undefined);
      await request(app)
        .post(QM_FOLLOW_UP_CYA)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(createRespondentCitizenQuery).toHaveBeenCalled();
          expect(retrieveClaimDetails).toHaveBeenCalled();
          expect(saveQueryManagement).toHaveBeenCalled();
        });
    });

    it('should throw error for civil service failure', async () => {
      mockGetClaimById.mockImplementation(async () => {
        const claim = new Claim();
        claim.caseRole = CaseRole.DEFENDANT;
        claim.queryManagement = new QueryManagement();
        const date = new Date();
        claim.queryManagement.createQuery = new CreateQuery('Dummy subject', 'Message details', 'Yes', (date.getFullYear() + 1).toString(), date.getMonth().toString(), date.getDay().toString());
        return claim;
      });
      jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockRejectedValueOnce(new Error('Error'));
      jest.spyOn(createCheckYourAnswerService, 'createRespondentCitizenQuery').mockRejectedValueOnce(new Error('Error'));
      await request(app)
        .post(QM_CYA)
        .expect((res) => {
          expect(res.status).toBe(500);
        });
    });

    it('should throw error for civil service failure follow up', async () => {
      mockGetClaimById.mockImplementation(async () => {
        const claim = new Claim();
        claim.caseRole = CaseRole.DEFENDANT;
        claim.queryManagement = new QueryManagement();
        claim.queryManagement.sendFollowUpQuery = new SendFollowUpQuery('Dummy details');
        return claim;
      });
      jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockRejectedValueOnce(new Error('Error'));
      jest.spyOn(createCheckYourAnswerService, 'createRespondentCitizenQuery').mockRejectedValueOnce(new Error('Error'));
      await request(app)
        .post(QM_FOLLOW_UP_CYA)
        .expect((res) => {
          expect(res.status).toBe(500);
        });
    });

  });
});
