import express from 'express';
import nock from 'nock';
import config from 'config';
import {CITIZEN_COURT_ORDERS_URL, CITIZEN_PRIORITY_DEBTS_URL} from 'routes/urls';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import {mockResponseFullAdmitPayBySetDate, mockRedisFailure} from '../../../../../../utils/mockDraftStore';
import * as draftStoreService from 'modules/draft-store/draftStoreService';

const request = require('supertest');
const {app} = require('../../../../../../../main/app');

jest.mock('../../../../../../../main/modules/oidc');

const respondentCourtOrdersUrl = CITIZEN_COURT_ORDERS_URL.replace(':id', 'aaa');

describe('Citizen court orders', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');

  beforeAll(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  describe('on GET', () => {
    it('should return court orders page', async () => {
      app.locals.draftStoreClient = mockResponseFullAdmitPayBySetDate;
      await request(app)
        .get(respondentCourtOrdersUrl)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Are you paying money as a result of any court orders?');
        });
    });
    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(respondentCourtOrdersUrl)
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    beforeAll(() => {
      app.locals.draftStoreClient = mockResponseFullAdmitPayBySetDate;
    });

    it('when Yes option and one court order fully filled in, should redirect to Debts screen', async () => {
      await request(app)
        .post(respondentCourtOrdersUrl)
        .send('declared=yes')
        .send('rows[0][claimNumber]=abc1')
        .send('rows[0][amount]=120')
        .send('rows[0][instalmentAmount]=10')
        .expect((res: express.Response) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CITIZEN_PRIORITY_DEBTS_URL.replace(':id', 'aaa'));
        });
    });

    it('when no option selected should show an error', async () => {
      await request(app)
        .post(respondentCourtOrdersUrl)
        .send('_csrf=')
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_YES_NO_SELECTION);
        });
    });

    it('when Yes option and an empty court order, should show an error', async () => {
      await request(app)
        .post(respondentCourtOrdersUrl)
        .send('declared=yes')
        .send('rows[0][claimNumber]=')
        .send('rows[0][amount]=')
        .send('rows[0][instalmentAmount]=')
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_AT_LEAST_ONE_COURT_ORDER);
        });
    });

    it('when Yes option and missing court order claim number, should show an error', async () => {
      await request(app)
        .post(respondentCourtOrdersUrl)
        .send('declared=yes')
        .send('rows[0][claimNumber]=')
        .send('rows[0][amount]=120')
        .send('rows[0][instalmentAmount]=10')
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_CLAIM_NUMBER);
        });
    });

    it('when Yes option and missing court order claim amount, should show an error', async () => {
      await request(app)
        .post(respondentCourtOrdersUrl)
        .send('declared=yes')
        .send('rows[0][claimNumber]=abc1')
        .send('rows[0][amount]=')
        .send('rows[0][instalmentAmount]=10')
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_AMOUNT_ONE_POUND_OR_MORE);
        });
    });

    it('when Yes option and missing court order claim instalment amount, should show an error', async () => {
      await request(app)
        .post(respondentCourtOrdersUrl)
        .send('declared=yes')
        .send('rows[0][claimNumber]=abc1')
        .send('rows[0][amount]=120')
        .send('rows[0][instalmentAmount]=')
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_STRICTLY_POSITIVE_NUMBER);
        });
    });

    it('should status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(respondentCourtOrdersUrl)
        .send('declared=yes')
        .send('rows[0][claimNumber]=abc1')
        .send('rows[0][amount]=120')
        .send('rows[0][instalmentAmount]=10')
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
