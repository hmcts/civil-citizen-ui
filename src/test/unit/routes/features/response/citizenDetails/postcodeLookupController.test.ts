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

  it('should return the address list for a postcode', async () => {
    const payload = {data: MOCK_API_ADDRESS};
    (lookupByPostcodeAndDataSet as jest.Mock).mockResolvedValue(payload);

    const {res} = await invoke({postcode: 'CV56GQ'});

    expect(lookupByPostcodeAndDataSet).toHaveBeenCalledWith('CV56GQ');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(payload);
  });

  it('should return the upstream status when lookup fails', async () => {
    (lookupByPostcodeAndDataSet as jest.Mock).mockRejectedValue({
      response: {status: 500},
      message: 'Postcode not found',
    });

    const {res} = await invoke({postcode: 'BT'});

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: {status: 500, message: 'Postcode not found'},
    });
  });
});
