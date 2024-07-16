import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {app} from '../../../../../../../main/app';
import {
  CHILDREN_DISABILITY_URL,
  CITIZEN_DEPENDANTS_EDUCATION_URL,
  CITIZEN_OTHER_DEPENDANTS_URL,
} from 'routes/urls';
import {hasDisabledChildren}
  from 'services/features/response/statementOfMeans/dependants/childrenDisabilityService';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import fullAdmitPayBySetDateMock from '../../../../../../utils/mocks/fullAdmitPayBySetDateMock.json';
import {Claim} from 'models/claim';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/services/features/response/statementOfMeans/dependants/childrenDisabilityService');
jest.mock('modules/draft-store/draftStoreService');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;
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
    mockGetCaseData.mockImplementation(async () => {
      return Object.assign(new Claim(), fullAdmitPayBySetDateMock.case_data);
    });
    it('should return dependent teenagers page', async () => {
      await request(app)
        .get(CITIZEN_DEPENDANTS_EDUCATION_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(EXPECTED_TEXT);
        });
    });
    it('should return 500 error code when there is an error', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
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
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), fullAdmitPayBySetDateMock.case_data);
      });
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
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
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
