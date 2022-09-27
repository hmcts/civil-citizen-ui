import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {EXPERT_DETAILS_URL, EXPERT_EVIDENCE_URL} from '../../../../../../main/routes/urls';
import {mockCivilClaim, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Expert Report Details Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return Have you already got a report written by an expert', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(EXPERT_DETAILS_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.EXPERT_DETAILS.PAGE_TITLE'));
      });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(EXPERT_DETAILS_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    beforeEach(() => {
      app.locals.draftStoreClient = mockCivilClaim;
    });

    it('should return page with error message on empty post', async () => {
      await request(app).post(EXPERT_DETAILS_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_YES_NO_SELECTION);
      });
    });

    it('should redirect to give evidence yourself if option yes is selected', async () => {
      await request(app).post(EXPERT_DETAILS_URL)
        .send({items: [{
        firstName: 'Joe',
        lastName: 'Doe',
        emailAddress: 'test@test.com',
        phoneNumber: '600000000',
        whyNeedExpert: 'Test',
        fieldOfExpertise: 'Test',
        estimatedCost: 100
      }]})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(EXPERT_EVIDENCE_URL);
        });
    });

    it('should redirect to expert guidance page if option no is selected', async () => {
      await request(app).post(EXPERT_DETAILS_URL).send({hasExpertReports: 'no'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(EXPERT_DETAILS_URL);
        });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(EXPERT_DETAILS_URL)
        .send({hasExpertReports: 'yes', reportDetails: [{expertName: 'Ahmet', day: '1', month: '3', year: '2022'}]})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
