import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {mockCivilClaim, mockRedisFailure} from '../../../../utils/mockDraftStore';
import {
  DQ_CONSIDER_CLAIMANT_DOCUMENTS_URL,
  DQ_DEFENDANT_EXPERT_EVIDENCE_URL,
} from '../../../../../main/routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

describe('Consider Claimant Documents Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return consider claimant documents page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(DQ_CONSIDER_CLAIMANT_DOCUMENTS_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Are there any documents the claimant has that you want the court to consider?');
      });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(DQ_CONSIDER_CLAIMANT_DOCUMENTS_URL)
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    beforeEach(() => {
      app.locals.draftStoreClient = mockCivilClaim;
    });

    it('should return consider claimant documents page', async () => {
      await request(app).post(DQ_CONSIDER_CLAIMANT_DOCUMENTS_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Are there any documents the claimant has that you want the court to consider?');
      });
    });

    it('should redirect to the use expert evidence page if option yes is selected', async () => {
      await request(app).post(DQ_CONSIDER_CLAIMANT_DOCUMENTS_URL).send({option: 'yes', details : 'details'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DQ_DEFENDANT_EXPERT_EVIDENCE_URL);
        });
    });

    it('should redirect to the use expert evidence page if option no is selected', async () => {
      await request(app).post(DQ_CONSIDER_CLAIMANT_DOCUMENTS_URL).send({option: 'no'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DQ_DEFENDANT_EXPERT_EVIDENCE_URL);
        });
    });

    it('should show errors when no option is selected', async () => {
      await request(app)
        .post(DQ_CONSIDER_CLAIMANT_DOCUMENTS_URL)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.SELECT_YES_IF_DOCUMENTS'));
        });
    });

    it('should show errors when yes is selected and details not given', async () => {
      await request(app)
        .post(DQ_CONSIDER_CLAIMANT_DOCUMENTS_URL)
        .send({ option: 'yes', details: '' })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.GIVE_DETAILS_DOCUMENTS'));
        });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(DQ_CONSIDER_CLAIMANT_DOCUMENTS_URL)
        .send({option: 'yes', details : 'details'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
