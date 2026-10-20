import {Response} from 'express';
import postcodeLookupController from 'routes/features/response/citizenDetails/postcodeLookupController';
import {POSTCODE_LOOKUP_URL} from 'routes/urls';
import {lookupByPostcodeAndDataSet} from 'modules/ordnance-survey-key/ordnanceSurveyKeyService';
import {MOCK_API_ADDRESS} from '../../../../../utils/mocks/ordnanceSurvey/osMocks';
import {AppRequest} from 'models/AppRequest';
import {createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/ordnance-survey-key/ordnanceSurveyKeyService');

const createJsonResponse = () => {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
  };
  res.status.mockReturnValue(res);
  return res;
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

  it('should return 500 as postcode incomplete', async () => {
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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 when the postcode is not provided', async () => {
    const {res} = await invoke({postcode: ''});

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {status: 400, message: 'Postcode not provided'},
    });
    expect(lookupByPostcodeAndDataSet).not.toHaveBeenCalled();
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
});
