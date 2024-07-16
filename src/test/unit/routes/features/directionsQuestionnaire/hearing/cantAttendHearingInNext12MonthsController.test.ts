import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {
  DQ_AVAILABILITY_DATES_FOR_HEARING_URL,
  DQ_NEXT_12MONTHS_CAN_NOT_HEARING_URL,
  DQ_PHONE_OR_VIDEO_HEARING_URL,
} from 'routes/urls';
import {civilClaimResponseMock} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('cannot attend hearing in next months Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return cannot attend hearing in next months page', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      await request(app).get(DQ_NEXT_12MONTHS_CAN_NOT_HEARING_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Are there any dates in the next 12 months when you, your experts or witnesses cannot go to a hearing?');
      });
    });

    it('should return status 500 when error thrown', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(DQ_NEXT_12MONTHS_CAN_NOT_HEARING_URL)
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
    });

    it('should return cannot attend hearing in next months page on empty post', async () => {
      await request(app).post(DQ_NEXT_12MONTHS_CAN_NOT_HEARING_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_NEXT_12MONTHS_CANNOT_HEARING);
      });
    });

    it('should redirect to availability dates page if option yes is selected', async () => {
      await request(app).post(DQ_NEXT_12MONTHS_CAN_NOT_HEARING_URL).send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DQ_AVAILABILITY_DATES_FOR_HEARING_URL);
        });
    });

    it('should redirect to phone or video hearing page page if option no is selected', async () => {
      await request(app).post(DQ_NEXT_12MONTHS_CAN_NOT_HEARING_URL).send({option: 'no'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DQ_PHONE_OR_VIDEO_HEARING_URL);
        });
    });

    it('should return status 500 when error thrown', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(DQ_NEXT_12MONTHS_CAN_NOT_HEARING_URL)
        .send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
