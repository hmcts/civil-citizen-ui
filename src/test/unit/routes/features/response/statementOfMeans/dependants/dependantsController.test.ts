import express from 'express';
import nock from 'nock';
import config from 'config';
import {
  CHILDREN_DISABILITY_URL,
  CITIZEN_DEPENDANTS_EDUCATION_URL,
  CITIZEN_DEPENDANTS_URL,
  CITIZEN_OTHER_DEPENDANTS_URL,
} from '../../../../../../../main/routes/urls';
import {hasDisabledChildren}
  from '../../../../../../../main/services/features/response/statementOfMeans/dependants/childrenDisabilityService';
import {mockRedisFailure, mockResponseFullAdmitPayBySetDate} from '../../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import * as draftStoreService from 'modules/draft-store/draftStoreService';

const request = require('supertest');
const {app} = require('../../../../../../../main/app');

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/services/features/response/statementOfMeans/dependants/childrenDisabilityService');
const mockHasDisabledChildren = hasDisabledChildren as jest.Mock;

const respondentDependantsUrl = CITIZEN_DEPENDANTS_URL.replace(':id', 'aaa');

describe('Citizen dependants', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');

  beforeAll(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  describe('on GET', () => {
    beforeEach(() => {
      app.locals.draftStoreClient = mockResponseFullAdmitPayBySetDate;
    });

    it('should return dependants page', async () => {
      await request(app)
        .get(respondentDependantsUrl)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Do any children live with you?');
        });
    });
    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(respondentDependantsUrl)
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
  describe('on POST', () => {
    beforeEach(() => {
      app.locals.draftStoreClient = mockResponseFullAdmitPayBySetDate;
    });

    it('when Yes option,under11 field filled in, hasDisabledChildren returns false, should redirect to Other Dependants screen', async () => {
      mockHasDisabledChildren.mockImplementation(() => {
        return false;
      });
      await request(app)
        .post(respondentDependantsUrl)
        .send('declared=yes')
        .send('under11=1')
        .expect((res: express.Response) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CITIZEN_OTHER_DEPENDANTS_URL.replace(':id', 'aaa'));
        });
    });

    it('when Yes option and under11 field filled in, hasDisabledChildren returns true, should redirect to Other Dependants screen', async () => {
      mockHasDisabledChildren.mockImplementation(() => {
        return true;
      });
      await request(app)
        .post(respondentDependantsUrl)
        .send('declared=yes')
        .send('under11=1')
        .expect((res: express.Response) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CHILDREN_DISABILITY_URL.replace(':id', 'aaa'));
        });
    });
    it('when Yes option and between16and19 field filled in should redirect to Dependants Education screen', async () => {
      await request(app)
        .post(respondentDependantsUrl)
        .send('declared=yes')
        .send('between16and19=1')
        .expect((res: express.Response) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CITIZEN_DEPENDANTS_EDUCATION_URL.replace(':id', 'aaa'));
        });
    });
    it('should show error when Yes option and no number is filled in', async () => {
      await request(app)
        .post(respondentDependantsUrl)
        .send('declared=yes')
        .send('under11=')
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Enter a number for at least one field');
        });
    });
    it('should show error when Yes option and invalid under11 input', async () => {
      await request(app)
        .post(respondentDependantsUrl)
        .send('declared=yes')
        .send('under11=-1')
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_POSITIVE_NUMBER);
        });
    });
    it('should show error when Yes option and invalid between11and15 input', async () => {
      await request(app)
        .post(respondentDependantsUrl)
        .send('declared=yes')
        .send('between11and15=-1')
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_POSITIVE_NUMBER);
        });
    });
    it('should show error when Yes option and invalid between16and19 input', async () => {
      await request(app)
        .post(respondentDependantsUrl)
        .send('declared=yes')
        .send('between16and19=1.5')
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Enter a numeric, for example 3');
        });
    });
    it('should status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(respondentDependantsUrl)
        .send('declared=yes')
        .send('under11=1')
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
