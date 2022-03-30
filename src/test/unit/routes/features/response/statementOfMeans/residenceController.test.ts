import express from 'express';
const request = require('supertest');
const {app} = require('../../../../../../main/app');
import nock from 'nock';
import config from 'config';
import {
  VALID_HOUSING,
  VALID_OPTION_SELECTION,
  VALID_TEXT_LENGTH,
} from '../../../../../../main/common/form/validationErrors/errorMessageConstants';
import {CITIZEN_PARTNER_URL, CITIZEN_RESIDENCE_URL} from '../../../../../../main/routes/urls';
import {FREE_TEXT_MAX_LENGTH} from '../../../../../../main/common/form/validators/validationConstraints';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

const agent = request.agent(app);
const tooLongHousingDetails: string = Array(FREE_TEXT_MAX_LENGTH + 2).join('a');
const respondentResidenceUrl = CITIZEN_RESIDENCE_URL.replace(':id', 'aaa');
const DRAFT_STORE_EXCEPTION = 'Draft store exception';
const mockDraftStore = {
  get: jest.fn(() => Promise.resolve('{"id": "id", "case_data": {"statementOfMeans": {}}}')),
  set: jest.fn(() => Promise.resolve()),
};

const mockGetExceptionDraftStore = {
  get: jest.fn(() => {
    throw new Error(DRAFT_STORE_EXCEPTION);
  }),
  set: jest.fn(() => Promise.resolve()),
};

describe('Citizen residence', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');

  beforeEach(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
  });

  describe('on GET', () => {
    beforeEach(() => {
      app.locals.draftStoreClient = mockDraftStore;
    });

    test('should return residence page', async () => {
      await agent
        .get(respondentResidenceUrl)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Where do you live?');
        });
    });
    test('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockGetExceptionDraftStore;
      await agent
        .get(respondentResidenceUrl)
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.body).toMatchObject({errorMessage: DRAFT_STORE_EXCEPTION});
        });
    });
  });
  describe('on POST', () => {
    beforeEach(() => {
      app.locals.draftStoreClient = mockDraftStore;
    });

    test('should redirect when OWN_HOME option selected', async () => {
      await agent
        .post(respondentResidenceUrl)
        .send('type=OWN_HOME')
        .expect((res: express.Response) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CITIZEN_PARTNER_URL.replace(':id', 'aaa'));
        });
    });
    test('should return error when no option selected', async () => {
      await agent
        .post(respondentResidenceUrl)
        .send('type=')
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_OPTION_SELECTION);
        });
    });
    test('should return error when type is \'Other\' and housing details not provided', async () => {
      await agent
        .post(respondentResidenceUrl)
        .send('type=OTHER')
        .send('housingDetails=')
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_HOUSING);
        });
    });
    test('should redirect when type is \'Other\' and housing details are provided', async () => {
      await agent
        .post(respondentResidenceUrl)
        .send('type=OTHER')
        .send('housingDetails=Palace')
        .expect((res: express.Response) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CITIZEN_PARTNER_URL.replace(':id', 'aaa'));
        });
    });
    test('should return error when type is \'Other\' and housing details are too long', async () => {
      await agent
        .post(respondentResidenceUrl)
        .send('type=OTHER')
        .send(`housingDetails=${tooLongHousingDetails}`)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_TEXT_LENGTH);
        });
    });
    test('should status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockGetExceptionDraftStore;
      await agent
        .post(respondentResidenceUrl)
        .send('type=OTHER')
        .send('housingDetails=Palace')
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.body).toMatchObject({errorMessage: DRAFT_STORE_EXCEPTION});
        });
    });
  });
});
