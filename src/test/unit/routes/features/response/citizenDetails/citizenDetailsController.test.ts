import { app } from '../../../../../../main/app';
import config from 'config';
import request from 'supertest';
import {CITIZEN_DETAILS_URL} from '../../../../../../main/routes/urls';
import {
  VALID_ADDRESS_LINE_1,
  VALID_CITY,
  VALID_POSTCODE,
  VALID_CORRESPONDENCE_ADDRESS_LINE_1,
  VALID_CORRESPONDENCE_CITY,
  VALID_CORRESPONDENCE_POSTCODE,
  REDIS_ERROR_MESSAGE,
} from '../../../../../../main/common/form/validationErrors/errorMessageConstants';
import {
  getRespondentInformation,
  saveRespondent,
} from '../../../../../../main/modules/citizenDetails/citizenDetailsService';
import {Claim} from '../../../../../../main/common/models/claim';
import {Respondent} from '../../../../../../main/common/models/respondent';
import {buildCorrespondenceAddress, buildPrimaryAddress} from '../../../../../utils/mockClaim';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/modules/citizenDetails/citizenDetailsService');

const mockGetRespondentInformation = getRespondentInformation as jest.Mock;
const mockSaveRespondent = saveRespondent as jest.Mock;

const claim = new Claim();

const buildClaimOfRespondent = (): Respondent => {
  claim.respondent1 = new Respondent();
  claim.respondent1.individualTitle = 'individualTitle';
  claim.respondent1.individualFirstName = 'individualFirstName';
  claim.respondent1.individualLastName = 'individualLastName';
  claim.respondent1.primaryAddress = buildPrimaryAddress();
  claim.respondent1.correspondenceAddress = buildCorrespondenceAddress();
  return claim.respondent1;
};

const nock = require('nock');

const validDataForPost = {
  primaryAddressLine1: 'Flat 3A Middle Road',
  primaryAddressLine2: '',
  primaryAddressLine3: '',
  primaryCity: 'London',
  primaryPostCode: 'SW1H 9AJ',
  postToThisAddress: 'no',
  correspondenceAddressLine1: '',
  correspondenceAddressLine2: '',
  correspondenceAddressLine3: '',
  correspondenceCity: '',
  correspondencePostCode: '',
};

describe('Confirm Details page', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.resetAllMocks();

  });
  describe('on Exception', () => {
    test('should return http 500 when has error in the get method', async () => {
      mockGetRespondentInformation.mockImplementation(async () => {
        throw new Error(REDIS_ERROR_MESSAGE);
      });
      await request(app)
        .get(CITIZEN_DETAILS_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toEqual({error: REDIS_ERROR_MESSAGE});
        });
    });
  });

  test('should return http 500 when has error in the post method', async () => {
    mockSaveRespondent.mockImplementation(async () => {
      throw new Error(REDIS_ERROR_MESSAGE);
    });
    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send(validDataForPost)
      .expect((res) => {
        expect(res.status).toBe(500);
        expect(res.body).toEqual({error: REDIS_ERROR_MESSAGE});
      });
  });
  test('should return your details page with empty information', async () => {

    mockGetRespondentInformation.mockImplementation(async () => {
      return new Respondent();
    });
    await request(app)
      .get(CITIZEN_DETAILS_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Confirm your details');
      });
  });
  test('should return your details page with information', async () => {

    mockGetRespondentInformation.mockImplementation(async () => {
      return buildClaimOfRespondent();
    });
    await request(app)
      .get(CITIZEN_DETAILS_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Confirm your details');
      });
  });
  test('should return your details page with information without correspondent address', async () => {
    const buildClaimOfRespondentWithoutCorrespondent = (): Respondent => {
      claim.respondent1 = new Respondent();
      claim.respondent1.individualTitle = 'individualTitle';
      claim.respondent1.individualFirstName = 'individualFirstName';
      claim.respondent1.individualLastName = 'individualLastName';
      claim.respondent1.primaryAddress = buildPrimaryAddress();
      return claim.respondent1;
    };
    mockGetRespondentInformation.mockImplementation(async () => {
      return buildClaimOfRespondentWithoutCorrespondent();
    });
    await request(app)
      .get(CITIZEN_DETAILS_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Confirm your details');
      });
  });
  test('POST/Citizen details - should redirect on correct primary address', async () => {

    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        primaryAddressLine1: 'Flat 3A Middle Road',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: 'London',
        primaryPostCode: 'SW1H 9AJ',
        postToThisAddress: 'no',
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
      })
      .expect((res) => {
        expect(res.status).toBe(302);
      });
  });

  test('POST/Citizen details - should redirect on correct correspondence address', async () => {

    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        primaryAddressLine1: 'Flat 3A Middle Road',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: 'London',
        primaryPostCode: 'SW1H 9AJ',
        postToThisAddress: 'yes',
        correspondenceAddressLine1: 'Flat 3A Middle Road',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: 'London',
        correspondencePostCode: 'SW1H 9AJ',
      })
      .expect((res) => {
        expect(res.status).toBe(302);
      });
  });

  test('POST/Citizen details - should return error on empty primary address line', async () => {

    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        primaryAddressLine1: '',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: 'London',
        primaryPostCode: 'SW1H 9AJ',
        postToThisAddress: 'no',
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_ADDRESS_LINE_1);
      });
  });

  test('POST/Citizen details - should return error on empty primary city', async () => {

    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        primaryAddressLine1: 'Flat 3A Middle Road',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: '',
        primaryPostCode: 'SW1H 9AJ',
        postToThisAddress: 'no',
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_CITY);
      });
  });

  test('POST/Citizen details - should return error on empty primary postcode', async () => {

    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        primaryAddressLine1: 'Flat 3A Middle Road',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: 'London',
        primaryPostCode: '',
        postToThisAddress: 'no',
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_POSTCODE);
      });
  });

  test('POST/Citizen details - should return error on empty correspondence address line', async () => {

    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        primaryAddressLine1: 'Flat 3A Middle Road',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: 'London',
        primaryPostCode: 'SW1H 9AJ',
        postToThisAddress: 'yes',
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_CORRESPONDENCE_ADDRESS_LINE_1);
      });
  });

  test('POST/Citizen details - should return error on empty correspondence city', async () => {

    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        primaryAddressLine1: 'Flat 3A Middle Road',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: 'London',
        primaryPostCode: 'SW1H 9AJ',
        postToThisAddress: 'yes',
        correspondenceAddressLine1: 'Flat 3A Middle Road',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: 'SW1H 9AJ',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_CORRESPONDENCE_CITY);
      });
  });

  test('POST/Citizen details - should return error on empty correspondence postcode', async () => {

    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        primaryAddressLine1: 'Flat 3A Middle Road',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: 'London',
        primaryPostCode: 'SW1H 9AJ',
        postToThisAddress: 'yes',
        correspondenceAddressLine1: 'Flat 3A Middle Road',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: 'London',
        correspondencePostCode: '',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_CORRESPONDENCE_POSTCODE);
      });
  });

  test('POST/Citizen details - should return error on no input', async () => {

    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        primaryAddressLine1: '',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: '',
        primaryPostCode: '',
        postToThisAddress: 'yes',
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_ADDRESS_LINE_1);
        expect(res.text).toContain(VALID_CITY);
        expect(res.text).toContain(VALID_POSTCODE);
        expect(res.text).toContain(VALID_CORRESPONDENCE_ADDRESS_LINE_1);
        expect(res.text).toContain(VALID_CORRESPONDENCE_CITY);
        expect(res.text).toContain(VALID_CORRESPONDENCE_POSTCODE);
      });
  });

  test('POST/Citizen details - should return error on input for primary address when postToThisAddress is set to NO', async () => {

    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        primaryAddressLine1: '',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: '',
        primaryPostCode: '',
        postToThisAddress: 'no',
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_ADDRESS_LINE_1);
        expect(res.text).toContain(VALID_CITY);
        expect(res.text).toContain(VALID_POSTCODE);
      });
  });

  test('POST/Citizen details - should return error on input for correspondence address when postToThisAddress is set to YES', async () => {

    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        primaryAddressLine1: '',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: '',
        primaryPostCode: '',
        postToThisAddress: 'yes',
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_CORRESPONDENCE_ADDRESS_LINE_1);
        expect(res.text).toContain(VALID_CORRESPONDENCE_CITY);
        expect(res.text).toContain(VALID_CORRESPONDENCE_POSTCODE);
      });
  });

  test('get/Citizen details - should return test variable when there is no data on redis and civil-service', async () => {

    await request(app)
      .get('/case/1111/response/your-details')
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Confirm your details');
        expect(res.text).toContain('individualTitle Test');
      });
  });
});
