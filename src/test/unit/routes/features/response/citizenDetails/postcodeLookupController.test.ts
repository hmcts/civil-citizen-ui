import {app} from '../../../../../../main/app';
import config from 'config';
import request from 'supertest';
import {POSTCODE_LOOKUP_URL} from 'routes/urls';

import {lookupByPostcodeAndDataSet} from 'modules/ordnance-survey-key/ordnanceSurveyKeyService';
import {MOCK_API_ADDRESS} from '../../../../../utils/mocks/ordnanceSurvey/osMocks';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('modules/ordnance-survey-key/ordnanceSurveyKeyService');
const nock = require('nock');

const mockLookupByPostcodeAndDataSet = lookupByPostcodeAndDataSet as jest.Mock;

const createResponse = (statusCode: number) => {
  return {
    response: {
      status: statusCode,
    },
    message: 'Postcode not found',
  };
};

describe('Postcode Lookup Controller - HTTP status', () => {

  it('should return 404 when postcode has no matching addresses', async () => {
    mockLookupByPostcodeAndDataSet.mockResolvedValue({
      addresses: [],
      valid: true,
    });

    await request(app)
      .get(POSTCODE_LOOKUP_URL + '?postcode=SW1A1AA')
      .expect((res) => {
        expect(res.status).toBe(404);
        expect(res.body.error.message).toBe('Postcode not found');
      });
  });

  it('should return 500 when ordnance survey service throws 500 error', async () => {
    const error = createResponse(500);
    mockLookupByPostcodeAndDataSet.mockRejectedValue(error);

    await request(app)
      .get(POSTCODE_LOOKUP_URL + '?postcode=BT')
      .expect((res) => {
        expect(res.status).toBe(500);
      });
  });

  it('should return 400 when OS service throws 400 error', async () => {
    const error = createResponse(400);
    mockLookupByPostcodeAndDataSet.mockRejectedValue(error);

    await request(app)
      .get(POSTCODE_LOOKUP_URL + '?postcode=AB')
      .expect((res) => {
        expect(res.status).toBe(400);
      });
  });

  it('should return 400 as postcode not provided', async () => {
    const error = createResponse(400);
    mockLookupByPostcodeAndDataSet.mockRejectedValue(error);

    await request(app)
      .get(POSTCODE_LOOKUP_URL + '?postcode=')
      .expect((res) => {
        expect(res.status).toBe(400);
        expect(res.text).toContain('Postcode not provided');
      });
  });
});

describe('Postcode Lookup Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });

  });

  it('should return list of addresses', async () => {

    mockLookupByPostcodeAndDataSet.mockResolvedValue(MOCK_API_ADDRESS);
    await request(app)
      .get(POSTCODE_LOOKUP_URL + '?postcode=CV56GQ')
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(MOCK_API_ADDRESS.addresses[0].uprn); // uprn
      });
  });

});
