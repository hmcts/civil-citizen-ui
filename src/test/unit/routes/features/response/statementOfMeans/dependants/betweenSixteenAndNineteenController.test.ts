import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {app} from '../../../../../../../main/app';
import {
  CHILDREN_DISABILITY_URL,
  CITIZEN_DEPENDANTS_EDUCATION_URL,
  CITIZEN_OTHER_DEPENDANTS_URL,
} from '../../../../../../../main/routes/urls';
import {hasDisabledChildren}
  from '../../../../../../../main/services/features/response/statementOfMeans/dependants/childrenDisabilityService';
import {mockRedisFailure, mockResponseFullAdmitPayBySetDate} from '../../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import * as draftStoreService from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/services/features/response/statementOfMeans/dependants/childrenDisabilityService');
const mockHasDisabledChildren = hasDisabledChildren as jest.Mock;

const EXPECTED_TEXT = 'Children aged 16 to 19 living with you';

describe('Dependant Teenagers', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  describe('on GET', () => {
    app.locals.draftStoreClient = mockResponseFullAdmitPayBySetDate;
    it('should return dependent teenagers page', async () => {
      await request(app)
        .get(CITIZEN_DEPENDANTS_EDUCATION_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(EXPECTED_TEXT);
        });
    });
    it('should return 500 error code when there is an error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CITIZEN_DEPENDANTS_EDUCATION_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
  describe('on POST', () => {
    beforeEach(() => {
      app.locals.draftStoreClient = mockResponseFullAdmitPayBySetDate;
    });
    it('should show error when no number is added', async () => {
      await request(app)
        .post(CITIZEN_DEPENDANTS_EDUCATION_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_INTEGER);
        });
    });
    it('should show error when number is negative', async () => {
      await request(app)
        .post(CITIZEN_DEPENDANTS_EDUCATION_URL)
        .send({value: -1, maxValue: 3})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_POSITIVE_NUMBER);
        });
    });
    it('should show error when number is decimal', async () => {
      await request(app)
        .post(CITIZEN_DEPENDANTS_EDUCATION_URL)
        .send({value: 1.3, maxValue: 3})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_INTEGER);
        });
    });
    it('should show error when number is greater than maxValue', async () => {
      await request(app)
        .post(CITIZEN_DEPENDANTS_EDUCATION_URL)
        .send({value: 4, maxValue: 3})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_NUMBER_FOR_PREVIOUS_PAGE);
        });
    });
    it('should redirect to other dependants when hasDisabledChildren returns false and no errors', async () => {
      mockHasDisabledChildren.mockImplementation(() => {
        return false;
      });
      await request(app)
        .post(CITIZEN_DEPENDANTS_EDUCATION_URL)
        .send({value: 1, maxValue: 3})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_OTHER_DEPENDANTS_URL);
        });
    });
    it('should redirect to other dependants when hasDisabledChildren returns true and no errors', async () => {
      mockHasDisabledChildren.mockImplementation(() => {
        return true;
      });
      await request(app)
        .post(CITIZEN_DEPENDANTS_EDUCATION_URL)
        .send({value: 1, maxValue: 3})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CHILDREN_DISABILITY_URL);
        });
    });
    it('should return 500 code when there is an error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CITIZEN_DEPENDANTS_EDUCATION_URL)
        .send({value: 1, maxValue: 3})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
