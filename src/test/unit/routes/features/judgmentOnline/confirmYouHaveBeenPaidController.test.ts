import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {CONFIRM_YOU_HAVE_BEEN_PAID_CONFIRMATION_URL,
  CONFIRM_YOU_HAVE_BEEN_PAID_URL} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {
  TypeOfMediationDocuments,
  UploadDocuments,
} from 'models/mediation/uploadDocuments/uploadDocuments';
import {getTypeOfDocuments} from '../../../../utils/mocks/Mediation/uploadFilesMediationMocks';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

const CONTROLLER_URL = CONFIRM_YOU_HAVE_BEEN_PAID_URL;

describe('Confirm you have been paid Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  beforeEach(() => {
    mockGetCaseData.mockImplementation(async () => {
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.partyDetails = {firstName: 'John', lastName: 'Smith'};
      claim.mediationUploadDocuments = new UploadDocuments(getTypeOfDocuments());
      return claim;
    });
  });

  describe('on GET', () => {
    it('should open Confirm you have been paid page', async () => {
      await request(app)
        .get(CONTROLLER_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.CONFIRM_YOU_HAVE_BEEN_PAID_PAGE_TITLE);
          expect(res.text).toContain(TestMessages.CONFIRM_YOU_HAVE_BEEN_PAID_ENTER_THE_DATE);
          expect(res.text).toContain(TestMessages.CONFIRM_YOU_HAVE_BEEN_PAID_HINT);
          expect(res.text).toContain(TestMessages.CONFIRM_YOU_HAVE_BEEN_PAID_CONFIRM);
          expect(res.text).toContain(TestMessages.CONFIRM_YOU_HAVE_BEEN_PAID_JUDGMENT_LINK);
        });
    });

    it('should return http 500 when has error', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(CONTROLLER_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
  describe('on POST', () => {
    it('should redirect to the Confirm you have been paid Confirmation page ', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send({typeOfDocuments: TypeOfMediationDocuments.YOUR_STATEMENT})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CONFIRM_YOU_HAVE_BEEN_PAID_CONFIRMATION_URL);
        });
    });
    it('should Valid checkbox when not checked', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send({typeOfDocuments: ''})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.CONFIRM_YOU_HAVE_BEEN_PAID_CHECK_ERROR_MESSAGE);
        });
    });
    it('should Valid date is not in the future', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send({typeOfDocuments: ''})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ERRORS_CORRECT_DATE_NOT_IN_FUTURE);
        });
    });
    it('should show errors if date not present', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send({typeOfDocuments: ''})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ERRORS_VALID_DATE);
          expect(res.text).toContain(TestMessages.VALID_DAY);
          expect(res.text).toContain(TestMessages.VALID_MONTH);
          expect(res.text).toContain(TestMessages.VALID_YEAR);
          expect(res.text).toContain(TestMessages.VALID_FOUR_DIGIT_YEAR);
        });
    });

    it('should return http 500 when has error', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(CONTROLLER_URL)
        .send({alternativeContactPerson: 'Joe Bloggs'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
