import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {app} from '../../../../../../../main/app';
import {
  CHILDREN_DISABILITY_URL,
  CITIZEN_DEPENDANTS_EDUCATION_URL,
  CITIZEN_OTHER_DEPENDANTS_URL,
} from '../../../../../../../main/routes/urls';
import {
  VALID_INTEGER,
  VALID_NUMBER_FOR_PREVIOUS_PAGE,
  VALID_POSITIVE_NUMBER,
} from '../../../../../../../main/common/form/validationErrors/errorMessageConstants';
import * as childrenDisabilityService
  from '../../../../../../../main/services/features/response/statementOfMeans/dependants/childrenDisabilityService';
import {mockCivilClaim, mockRedisFailure} from '../../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/services/features/response/statementOfMeans/dependants/childrenDisabilityService');
const mockHasDisabledChildren = childrenDisabilityService.hasDisabledChildren as jest.Mock;

const EXPECTED_TEXT = 'Children aged 16 to 19 living with you';

describe('Dependant Teenagers', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });
  describe('on GET', () => {
    app.locals.draftStoreClient = mockCivilClaim;
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
    app.locals.draftStoreClient = mockCivilClaim;
    it('should show error when no number is added', async () => {
      await request(app)
        .post(CITIZEN_DEPENDANTS_EDUCATION_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_INTEGER);
        });
    });
    it('should show error when number is negative', async () => {
      await request(app)
        .post(CITIZEN_DEPENDANTS_EDUCATION_URL)
        .send({value: -1, maxValue: 3})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_POSITIVE_NUMBER);
        });
    });
    it('should show error when number is decimal', async () => {
      await request(app)
        .post(CITIZEN_DEPENDANTS_EDUCATION_URL)
        .send({value: 1.3, maxValue: 3})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_INTEGER);
        });
    });
    it('should show error when number is greater than maxValue', async () => {
      await request(app)
        .post(CITIZEN_DEPENDANTS_EDUCATION_URL)
        .send({value: 4, maxValue: 3})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_NUMBER_FOR_PREVIOUS_PAGE);
        });
    });
    it('should redirect to other dependants when hasDisabledChildren returns false and no errors', async () => {
      mockHasDisabledChildren.mockImplementation(() => {
        return false;
      });
      app.locals.draftStoreClient = mockCivilClaim;
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
      app.locals.draftStoreClient = mockCivilClaim;
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
