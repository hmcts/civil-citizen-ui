import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {CITIZEN_PHONE_NUMBER_URL, CLAIMANT_PHONE_NUMBER_URL, CLAIMANT_TASK_LIST_URL} from 'routes/urls';
import {t} from 'i18next';
import {
  civilClaimResponseMock,
  mockCivilClaim,
  mockDraftClaim,
  mockRedisFailure,
} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {configureSpy} from '../../../../../utils/spyConfiguration';
import * as carmToggleUtils from 'common/utils/carmToggleUtils';
import {cloneDeep} from 'lodash';
import {Claim} from 'models/claim';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

const PHONE_NUMBER = '01632960001';

const isCarmEnabledSpy = (calmEnabled: boolean) => configureSpy(carmToggleUtils, 'isCarmEnabledForCase')
  .mockReturnValue(Promise.resolve(calmEnabled));

describe('Completing Claim', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  app.request.cookies = {eligibilityCompleted: true};
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  // delete after CARM release
  describe('on GET, CARM off', () => {
    beforeEach(() => {
      isCarmEnabledSpy(false);
    });

    it('should return on your claimant phone number page successfully', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(CLAIMANT_PHONE_NUMBER_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.CLAIMANT_PHONE.TITLE'));
        });
    });

    it('should return 500 status code when error occurs', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CLAIMANT_PHONE_NUMBER_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on GET, CARM on', () => {
    beforeEach(() => {
      isCarmEnabledSpy(true);
    });

    it('should return on your claimant phone number page successfully', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(CLAIMANT_PHONE_NUMBER_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.CLAIMANT_PHONE.TITLE_MANDATORY'));
        });
    });

    it('should return 500 status code when error occurs', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CLAIMANT_PHONE_NUMBER_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  // delete after CARM release
  describe('on Post, CARM off', () => {
    beforeEach(() => {
      isCarmEnabledSpy(false);
    });

    it('should redirect to task list when optional phone number provided', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CLAIMANT_PHONE_NUMBER_URL)
        .send({telephoneNumber: PHONE_NUMBER})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIMANT_TASK_LIST_URL);
        });
    });

    it('should redirect to task list when optional phone number is not provided', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CLAIMANT_PHONE_NUMBER_URL)
        .send({telephoneNumber: ''})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIMANT_TASK_LIST_URL);
        });
    });

    it('should return error on incorrect input', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CLAIMANT_PHONE_NUMBER_URL)
        .send({telephoneNumber: 'abc'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_PHONE_NUMBER'));
        });
    });

    it('should return status 500 when there is error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CLAIMANT_PHONE_NUMBER_URL)
        .send({telephoneNumber: PHONE_NUMBER})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on Post, CARM on', () => {
    beforeEach(() => {
      isCarmEnabledSpy(true);
    });

    it('should redirect to task list when mandatory phone number provided', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CLAIMANT_PHONE_NUMBER_URL)
        .send({telephoneNumber: PHONE_NUMBER})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIMANT_TASK_LIST_URL);
        });
    });

    it('should return error on empty input', async () => {
      const draftClaim = cloneDeep(civilClaimResponseMock);
      draftClaim.case_data.statementOfMeans = undefined;
      app.locals.draftStoreClient = mockDraftClaim(draftClaim as unknown as Claim);
      await request(app)
        .post(CITIZEN_PHONE_NUMBER_URL)
        .send('telephoneNumber=')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.ENTER_TELEPHONE_NUMBER'));
        });
    });

    it('should return error on incorrect input', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CLAIMANT_PHONE_NUMBER_URL)
        .send({telephoneNumber: 'abc'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_PHONE_NUMBER'));
        });
    });

    it('should return error on input with interior spaces', async () => {
      await request(app)
        .post(CLAIMANT_PHONE_NUMBER_URL)
        .send('telephoneNumber=123 456')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_PHONE_NUMBER'));
        });
    });

    it('should accept input with trailing whitespaces', async () => {
      await request(app)
        .post(CLAIMANT_PHONE_NUMBER_URL)
        .send('telephoneNumber= 01234567890 ')
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

    it('should return status 500 when there is error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CLAIMANT_PHONE_NUMBER_URL)
        .send({telephoneNumber: PHONE_NUMBER})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
