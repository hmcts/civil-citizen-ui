import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {
  CLAIMANT_RESPONSE_COURT_OFFERED_SET_DATE_URL,
  CLAIMANT_RESPONSE_REJECTION_REASON_URL,
  CLAIMANT_RESPONSE_TASK_LIST_URL,
} from '../../../../../main/routes/urls';
import {mockCivilClaim, mockRedisFailure} from '../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import {CourtProposedDateOptions} from '../../../../../main/common/form/models/claimantResponse/courtProposedDate.ts';

jest.mock('../../../../../main/modules/oidc');

describe('Claimant court proposed date Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
  });

  describe('on GET', () => {
    it('should return court proposed date page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(CLAIMANT_RESPONSE_COURT_OFFERED_SET_DATE_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.CLAIMANT_RESPONSE.COURT_PROPOSED_DATE.TITLE'));
      });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CLAIMANT_RESPONSE_COURT_OFFERED_SET_DATE_URL)
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

    it('should return error on empty post', async () => {
      await request(app).post(CLAIMANT_RESPONSE_COURT_OFFERED_SET_DATE_URL)
        .send({decision: null})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_YES_NO_SELECTION'));
        });
    });

    it('should redirect to the claimant response task-list if option ACCEPT_REPAYMENT_DATE is selected', async () => {
      await request(app).post(CLAIMANT_RESPONSE_COURT_OFFERED_SET_DATE_URL)
        .send({ decision: CourtProposedDateOptions.ACCEPT_REPAYMENT_DATE })
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CLAIMANT_RESPONSE_TASK_LIST_URL);
        });
    });

    it('should redirect to rejection reason if option JUDGE_REPAYMENT_DATE is selected', async () => {
      await request(app).post(CLAIMANT_RESPONSE_COURT_OFFERED_SET_DATE_URL)
        .send({ decision: CourtProposedDateOptions.JUDGE_REPAYMENT_DATE })
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CLAIMANT_RESPONSE_REJECTION_REASON_URL);
        });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CLAIMANT_RESPONSE_COURT_OFFERED_SET_DATE_URL)
        .send({ decision: CourtProposedDateOptions.JUDGE_REPAYMENT_DATE })
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
