import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/server';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {
  RESPONSE_TASK_LIST_URL,
  REQUEST_MORE_TIME_URL,
} from 'routes/urls';
import {ResponseDeadline} from 'form/models/responseDeadline';
import {AdditionalTimeOptions} from 'form/models/additionalTime';
import {PartyType} from 'models/partyType';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {Party} from '../../../../../main/common/models/party';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseData = getCaseDataFromStore as jest.Mock;
const mockSaveCaseData = saveDraftClaim as jest.Mock;
const mockClaim = new Claim();
mockClaim.applicant1 = {
  type: PartyType.INDIVIDUAL,
  partyDetails: {
    partyName: 'Joe Bloggs',
  },
};

describe('Request More Time Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should render the page if there is no additional time set', async () => {
      mockGetCaseData.mockImplementation(async () => mockClaim);
      await request(app).get(REQUEST_MORE_TIME_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Request more time to respond');
      });
    });

    it('should render the page if additional time is set', async () => {
      const claim = new Claim();
      claim.applicant1 = {
        type: PartyType.SOLE_TRADER,
        partyDetails: {
          partyName: 'Miss Jane',
        },
      };
      claim.responseDeadline = new ResponseDeadline();
      claim.responseDeadline.additionalTime = AdditionalTimeOptions.MORE_THAN_28_DAYS;
      mockGetCaseData.mockImplementation(async () => claim);
      await request(app).get(REQUEST_MORE_TIME_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Request more time to respond');
      });
    });

    it('should render error page when partyName is not set', async () => {
      const claim = new Claim();
      claim.applicant1 = new Party();
      claim.applicant1.type = PartyType.SOLE_TRADER;

      mockGetCaseData.mockImplementation(async () => undefined);
      await request(app).get(REQUEST_MORE_TIME_URL).expect((res) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
    });

    it('should render error page on redis failure error', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app).get(REQUEST_MORE_TIME_URL).expect((res) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
    });
  });

  describe('on POST', () => {
    it('should render error message when additional time option is not selected', async () => {
      mockGetCaseData.mockImplementation(async () => mockClaim);
      await request(app).post(REQUEST_MORE_TIME_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Request more time to respond');
        expect(res.text).toContain('There was a problem');
      });
    });

    it('should render task list page if "Up to 28 days" option is selected', async () => {
      mockGetCaseData.mockImplementation(async () => mockClaim);
      await request(app).post(REQUEST_MORE_TIME_URL).send({'option': 'up-to-28-days'}).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(RESPONSE_TASK_LIST_URL);
      });
    });

    it('should render task list page if "More than 28 days" option is selected', async () => {
      mockGetCaseData.mockImplementation(async () => mockClaim);
      await request(app).post(REQUEST_MORE_TIME_URL).send({'option': 'more-than-28-days'}).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(RESPONSE_TASK_LIST_URL);
      });
    });

    it('should render error message when invalid option is provided', async () => {
      await request(app).post(REQUEST_MORE_TIME_URL).send({'option': 'foo'}).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Request more time to respond');
      });
    });

    it('should render error page on redis failure error', async () => {
      mockSaveCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app).post(REQUEST_MORE_TIME_URL).send({'option': 'more-than-28-days'}).expect((res) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
    });
  });
});
