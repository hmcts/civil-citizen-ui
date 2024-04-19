import express from 'express';
import nock from 'nock';
import config from 'config';
import request from 'supertest';
import {app} from '../../../../../main/server';
import {
  mockCivilClaimWithExpertAndWitness,
  mockRedisFailure,
} from '../../../../utils/mockDraftStore';
import {
  DQ_COURT_LOCATION_URL,
  SUPPORT_REQUIRED_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {YesNo} from 'form/models/yesNo';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

const supportRequiredUrl = SUPPORT_REQUIRED_URL.replace(':id', 'aaa');

describe('Support required', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');

  beforeAll(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return supportRequired page', async () => {
      app.locals.draftStoreClient = mockCivilClaimWithExpertAndWitness;
      await request(app)
        .get(supportRequiredUrl)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Do you, your experts or witnesses need support to attend a hearing');
        });
    });
    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(supportRequiredUrl)
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    beforeAll(() => {
      app.locals.draftStoreClient = mockCivilClaimWithExpertAndWitness;
    });

    it('wshould display error when there is no option selection', async () => {
      await request(app)
        .post(supportRequiredUrl)
        .send({
          model: {items:[]},
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.SELECT_YES_IF_SUPPORT);
        });
    });

    it('when yes selected, name provided and any checkbox selected, should redirect to claim task list screen', async () => {
      await request(app)
        .post(supportRequiredUrl)
        .send({
          option: YesNo.YES,
          model: {
            items: [
              {
                declared: 'disabledAccess',
                fullName: 'johndoe',
              },
            ],
          },
        })
        .expect((res: express.Response) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DQ_COURT_LOCATION_URL.replace(':id', 'aaa'));
        });
    });

    it('when no selected, should redirect to claim task list screen', async () => {
      await request(app)
        .post(supportRequiredUrl)
        .send({
          option: YesNo.NO,
          model: {},
        })
        .expect((res: express.Response) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DQ_COURT_LOCATION_URL.replace(':id', 'aaa'));
        });
    });

    it('changing from yes to no should redirect to claim task list screen', async () => {
      await request(app)
        .post(supportRequiredUrl)
        .send({
          option: YesNo.NO,
          declared: ['disabledAccess'],
          model: {
            items: [
              {fullName: 'johndoe'},
            ],
          },
        })
        .expect((res: express.Response) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DQ_COURT_LOCATION_URL.replace(':id', 'aaa'));
        });
    });

    it('should show error when yes selected but no name provided', async () => {
      await request(app)
        .post(supportRequiredUrl)
        .send({
          option: YesNo.YES,
          model: {
            items: [{
              fullName: '',
            }]},
        })
        .expect((res:Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.NO_NAME_SELECTED);
        });
    });

    it('should show error when yes selected but no support selected', async () => {
      await request(app)
        .post(supportRequiredUrl)
        .send({
          option: YesNo.YES,
          model: {
            items: [{
              fullName: 'johndoe',
            }],
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.NO_SUPPORT_SELECTED);
        });
    });

    it('should show error when yes and sign language interpreter selected, but no free text provided', async () => {
      await request(app)
        .post(supportRequiredUrl)
        .send({
          option: YesNo.YES,
          model: {
            items: [{
              declared: 'signLanguageInterpreter',
              fullName: 'johndoe',
            }],
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.NO_SIGN_LANGUAGE_ENTERED);
        });
    });

    it('should show error when yes and language interpreter selected, but no free text provided', async () => {
      await request(app)
        .post(supportRequiredUrl)
        .send({
          option: YesNo.YES,
          model: {
            items: [{
              declared: 'languageInterpreter',
              fullName: 'johndoe',
            }],
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.NO_LANGUAGE_ENTERED);
        });
    });

    it('should show error when yes and other support selected, but no free text provided', async () => {
      await request(app)
        .post(supportRequiredUrl)
        .send({
          option: YesNo.YES,
          declared: ['otherSupport'],
          model: {
            items: [{
              fullName: 'johndoe',
            }],
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.NO_OTHER_SUPPORT);
        });
    });

    it('should status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(supportRequiredUrl)
        .send({
          option: YesNo.NO,
          declared: ['disabledAccess'],
          model: {
            items: [
              {fullName: 'johndoe'},
            ],
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
