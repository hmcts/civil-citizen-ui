import {Response} from 'express';
import postcodeLookupController from 'routes/features/response/citizenDetails/postcodeLookupController';
import {POSTCODE_LOOKUP_URL} from 'routes/urls';
import {lookupByPostcodeAndDataSet} from 'modules/ordnance-survey-key/ordnanceSurveyKeyService';
import {MOCK_API_ADDRESS} from '../../../../../utils/mocks/ordnanceSurvey/osMocks';
import {AppRequest} from 'models/AppRequest';
import {createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('modules/ordnance-survey-key/ordnanceSurveyKeyService', () => {
  const actual = jest.requireActual('modules/ordnance-survey-key/ordnanceSurveyKeyService');
  return {
    ...actual,
    lookupByPostcodeAndDataSet: jest.fn(),
  };
});
const nock = require('nock');

const createJsonResponse = () => {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
  };
  res.status.mockReturnValue(res);
  return res;
};

describe('Postcode Lookup Controller - HTTP status', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
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

it('should return 502 with a generic message when OS service throws 401 error', async () => {
  const error = createResponse(401);
  mockLookupByPostcodeAndDataSet.mockRejectedValue(error);

  await request(app)
    .get(POSTCODE_LOOKUP_URL + '?postcode=SW1A1AA')
    .expect((res) => {
      expect(res.status).toBe(502);
      expect(res.body.error.status).toBe(502);
      expect(res.body.error.message).toBe('Postcode lookup failed');
    });
});

it('should return 502 with a generic message when OS service throws 403 error', async () => {
  const error = createResponse(403);
  mockLookupByPostcodeAndDataSet.mockRejectedValue(error);

  await request(app)
    .get(POSTCODE_LOOKUP_URL + '?postcode=SW1A1AA')
    .expect((res) => {
      expect(res.status).toBe(502);
      expect(res.body.error.status).toBe(502);
      expect(res.body.error.message).toBe('Postcode lookup failed');
    });
});

it('should return 502 for InvalidApiKey fault even when OS status is 400', async () => {
  mockLookupByPostcodeAndDataSet.mockRejectedValue({
    response: {
      status: 400,
      data: { fault: { detail: { errorcode: 'oauth.v2.InvalidApiKey' } } },
    },
    message: 'Invalid ApiKey',
  });

  await request(app)
    .get(POSTCODE_LOOKUP_URL + '?postcode=SW1A1AA')
    .expect((res) => {
      expect(res.status).toBe(502);
      expect(res.body.error.message).toBe('Postcode lookup failed');
      expect(res.text).not.toContain('Invalid ApiKey');
    });
});
    const error = createResponse(500);
    mockLookupByPostcodeAndDataSet.mockRejectedValue(error);

    await request(app)
      .get(POSTCODE_LOOKUP_URL + '?postcode=BT')
      .expect((res) => {
        expect(res.status).toBe(500);
        expect(res.body.error.status).toBe(500);
        expect(res.body.error.message).toBe('Postcode lookup failed');
        expect(res.text).not.toContain('Postcode not found');
      });
  });

  it('should return 400 with a generic message when OS service throws 400 error', async () => {
    const error = createResponse(400);
    mockLookupByPostcodeAndDataSet.mockRejectedValue(error);

    await request(app)
      .get(POSTCODE_LOOKUP_URL + '?postcode=AB')
      .expect((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error.status).toBe(400);
        expect(res.body.error.message).toBe('Invalid postcode');
        expect(res.text).not.toContain('Postcode not found');
      });
  });

  it('should return 400 as postcode not provided without calling lookup', async () => {
    await request(app)
      .get(POSTCODE_LOOKUP_URL + '?postcode=')
      .expect((res) => {
        expect(res.status).toBe(400);
        expect(res.text).toContain('Postcode not provided');
      });
    expect(mockLookupByPostcodeAndDataSet).not.toHaveBeenCalled();
  });

});

describe('Postcode Lookup Controller', () => {
const citizenRoleToken: string = config.get('citizenRoleToken');
const idamUrl: string = config.get('idamUrl');

beforeEach(() => {
  jest.clearAllMocks();
});

beforeAll(() => {
  nock(idamUrl)
    .post('/o/token')
    .reply(200, { id_token: citizenRoleToken });
});
  });

  it('should return the address list for a postcode', async () => {
    const payload = {data: MOCK_API_ADDRESS};
    (lookupByPostcodeAndDataSet as jest.Mock).mockResolvedValue(payload);

    const {res} = await invoke({postcode: 'CV56GQ'});

mockLookupByPostcodeAndDataSet.mockResolvedValue(MOCK_API_ADDRESS);
await request(app)
  .get(POSTCODE_LOOKUP_URL + '?postcode=CV56GQ')
  .expect((res) => {
    expect(res.status).toBe(200);
    expect(res.text).toContain(MOCK_API_ADDRESS.addresses[0].uprn); // uprn
  });
expect(lookupByPostcodeAndDataSet).toHaveBeenCalledWith('CV56GQ');

const {res} = await invoke({postcode: 'BT'});

expect(res.status).toHaveBeenCalledWith(500);
expect(res.json).toHaveBeenCalledWith({
  error: {status: 500, message: 'Postcode not found'},
});
});
