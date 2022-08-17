import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../main/common/models/claim';
import {
  AGREED_TO_MORE_TIME_URL,
  CLAIM_TASK_LIST_URL,
  REQUEST_MORE_TIME_URL,
  RESPONSE_DEADLINE_OPTIONS_URL,
} from '../../../../../main/routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {CounterpartyType} from '../../../../../main/common/models/counterpartyType';
import {ResponseOptions} from '../../../../../main/common/form/models/responseDeadline';
import {mockRedisFailure} from '../../../../utils/mockDraftStore';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveCaseData = draftStoreService.saveDraftClaim as jest.Mock;
const mockClaim = new Claim();
mockClaim.applicant1 = {
  type: CounterpartyType.INDIVIDUAL,
  partyName: 'Joe Bloggs',
};

describe('Response Deadline Options Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should render the page if response deadline option is not set', async () => {
      mockGetCaseData.mockImplementation(async () => mockClaim);
      await request(app).get(RESPONSE_DEADLINE_OPTIONS_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Response deadline');
      });
    });

    it('should render the page if response deadline option is set', async () => {
      mockClaim.responseDeadline = {
        option: ResponseOptions.REQUEST_REFUSED,
      };
      mockGetCaseData.mockImplementation(async () => mockClaim);
      await request(app).get(RESPONSE_DEADLINE_OPTIONS_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Response deadline');
      });
    });

    it('should render error page when partyName is not set', async () => {
      mockGetCaseData.mockImplementation(async () => new Claim());
      await request(app).get(RESPONSE_DEADLINE_OPTIONS_URL).expect((res) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
    });

    it('should render error page on redis failure error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app).get(RESPONSE_DEADLINE_OPTIONS_URL).expect((res) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
    });

    describe('on POST', () => {
      it('should render error message when response deadline option is not selected', async () => {
        mockGetCaseData.mockImplementation(async () => mockClaim);
        await request(app).post(RESPONSE_DEADLINE_OPTIONS_URL).expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Response deadline');
          expect(res.text).toContain('There was a problem');
        });
      });

      it('should render task list page when radio \'No, I do not want to request more time\' is selected', async () => {
        mockGetCaseData.mockImplementation(async () => mockClaim);
        await request(app).post(RESPONSE_DEADLINE_OPTIONS_URL).send({'option': 'no'}).expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(CLAIM_TASK_LIST_URL);
        });
      });

      it('should render task list page when radio \'My request for more time has been refused\' is selected', async () => {
        mockGetCaseData.mockImplementation(async () => mockClaim);
        await request(app).post(RESPONSE_DEADLINE_OPTIONS_URL).send({'option': 'request-refused'}).expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(CLAIM_TASK_LIST_URL);
        });
      });

      it('should render request more time page when radio \'Yes, I want to request more time\' is selected', async () => {
        mockGetCaseData.mockImplementation(async () => mockClaim);
        await request(app).post(RESPONSE_DEADLINE_OPTIONS_URL).send({'option': 'yes'}).expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(REQUEST_MORE_TIME_URL);
        });
      });

      it('should render agreed to more time page when radio \'I have already agreed more time\' is selected', async () => {
        mockGetCaseData.mockImplementation(async () => mockClaim);
        await request(app).post(RESPONSE_DEADLINE_OPTIONS_URL).send({'option': 'already-agreed'}).expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(AGREED_TO_MORE_TIME_URL);
        });
      });

      it('should render error page on redis failure error', async () => {
        mockSaveCaseData.mockImplementation(async () => {
          throw new Error(TestMessages.REDIS_FAILURE);
        });
        await request(app).post(RESPONSE_DEADLINE_OPTIONS_URL).send({'option': 'yes'}).expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
      });
    });
  });
});
