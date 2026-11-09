import {Response} from 'express';
import postcodeLookupController from 'routes/features/response/citizenDetails/postcodeLookupController';
import {POSTCODE_LOOKUP_URL} from 'routes/urls';
import {lookupByPostcodeAndDataSet} from 'modules/ordnance-survey-key/ordnanceSurveyKeyService';
import {MOCK_API_ADDRESS} from '../../../../../utils/mocks/ordnanceSurvey/osMocks';
import {AppRequest} from 'models/AppRequest';
import {createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/ordnance-survey-key/ordnanceSurveyKeyService', () => {
  const actual = jest.requireActual('modules/ordnance-survey-key/ordnanceSurveyKeyService');
  return {
    ...actual,
    lookupByPostcodeAndDataSet: jest.fn(),
  };
});

const createJsonResponse = () => {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
  };
  res.status.mockReturnValue(res);
  return res;
};

const invoke = async (query: Record<string, unknown> = {}) => {
  const res = createJsonResponse();
  const next = jest.fn();
  await getRouteHandler(postcodeLookupController, 'get', POSTCODE_LOOKUP_URL)(
    {
      params: {},
      body: {},
      query,
      cookies: {},
      session: createMockSession(),
    } as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

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

  it('should return 404 when postcode has no matching addresses', async () => {
    (lookupByPostcodeAndDataSet as jest.Mock).mockResolvedValue({
      addresses: [],
      valid: true,
    });

    const {res} = await invoke({postcode: 'SW1A1AA'});

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: {status: 404, message: 'Postcode not found'},
    });
  });

  it('should return the address list for a postcode', async () => {
    (lookupByPostcodeAndDataSet as jest.Mock).mockResolvedValue(MOCK_API_ADDRESS);

    const {res} = await invoke({postcode: 'CV56GQ'});

    expect(lookupByPostcodeAndDataSet).toHaveBeenCalledWith('CV56GQ');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(MOCK_API_ADDRESS);
  });

  it('should return 502 with a generic message when OS service throws 401 error', async () => {
    (lookupByPostcodeAndDataSet as jest.Mock).mockRejectedValue({
      response: {status: 401},
      message: 'Unauthorized',
    });

    const {res} = await invoke({postcode: 'SW1A1AA'});

    expect(res.status).toHaveBeenCalledWith(502);
    expect(res.json).toHaveBeenCalledWith({
      error: {status: 502, message: 'Postcode lookup failed'},
    });
  });

  it('should return 502 with a generic message when OS service throws 403 error', async () => {
    (lookupByPostcodeAndDataSet as jest.Mock).mockRejectedValue({
      response: {status: 403},
      message: 'Forbidden',
    });

    const {res} = await invoke({postcode: 'SW1A1AA'});

    expect(res.status).toHaveBeenCalledWith(502);
    expect(res.json).toHaveBeenCalledWith({
      error: {status: 502, message: 'Postcode lookup failed'},
    });
  });

  it('should return 502 for InvalidApiKey fault even when OS status is 400', async () => {
    (lookupByPostcodeAndDataSet as jest.Mock).mockRejectedValue({
      response: {
        status: 400,
        data: {fault: {detail: {errorcode: 'oauth.v2.InvalidApiKey'}}},
      },
      message: 'Invalid ApiKey',
    });

    const {res} = await invoke({postcode: 'SW1A1AA'});

    expect(res.status).toHaveBeenCalledWith(502);
    expect(res.json).toHaveBeenCalledWith({
      error: {status: 502, message: 'Postcode lookup failed'},
    });
  });

  it('should return 400 with a generic message when OS service throws 400 error', async () => {
    (lookupByPostcodeAndDataSet as jest.Mock).mockRejectedValue({
      response: {status: 400},
      message: 'Bad Request',
    });

    const {res} = await invoke({postcode: 'AB'});

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {status: 400, message: 'Invalid postcode'},
    });
  });

  it('should return 500 with a generic message when OS service throws 500 error', async () => {
    (lookupByPostcodeAndDataSet as jest.Mock).mockRejectedValue({
      response: {status: 500},
      message: 'Internal Server Error',
    });

    const {res} = await invoke({postcode: 'BT'});

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: {status: 500, message: 'Postcode lookup failed'},
    });
  });
});
