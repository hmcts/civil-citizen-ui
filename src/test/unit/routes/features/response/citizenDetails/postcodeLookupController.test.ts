import {Response} from 'express';
import postcodeLookupController from '../../../../../../main/routes/features/response/citizenDetails/postcodeLookupController';
import {lookupByPostcodeAndDataSet} from 'modules/ordance-survey-key/ordanceSurveyKeyService';
import {MOCK_API_ADDRESS} from '../../../../../utils/mocks/ordanceSurvey/osMocks';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/ordance-survey-key/ordanceSurveyKeyService');

const mockLookupByPostcodeAndDataSet = lookupByPostcodeAndDataSet as jest.Mock;

const createResponse = (statusCode: number) => ({
  response: {
    status: statusCode,
  },
  message: 'Postcode not found',
});

const createJsonResponse = () => {
  const res = {
    ...createMockResponse(),
    status: jest.fn(),
    json: jest.fn(),
  };
  res.status.mockReturnValue(res);
  return res;
};

describe('Postcode Lookup Controller', () => {
  const getHandler = getRouteHandler(postcodeLookupController, 'get');
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createJsonResponse>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      session: createMockSession({user: {id: 'user-id'}}),
      body: {},
      query: {},
      cookies: {},
    };
    res = createJsonResponse();
    next = jest.fn();
    mockLookupByPostcodeAndDataSet.mockReset();
  });

  it('should return 500 as postcode incomplete', async () => {
    const error = createResponse(500);
    mockLookupByPostcodeAndDataSet.mockRejectedValue(error);
    req.query = {postcode: 'BT'};

    await getHandler(req as AppRequest, res as unknown as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.objectContaining({status: 500}),
    }));
  });

  it('should return 400 as postcode not provided', async () => {
    req.query = {postcode: ''};

    await getHandler(req as AppRequest, res as unknown as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {status: 400, message: 'Postcode not provided'},
    });
    expect(mockLookupByPostcodeAndDataSet).not.toHaveBeenCalled();
  });

  it('should return list of addresses', async () => {
    mockLookupByPostcodeAndDataSet.mockResolvedValue({data: MOCK_API_ADDRESS});
    req.query = {postcode: 'CV56GQ'};

    await getHandler(req as AppRequest, res as unknown as Response, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({data: MOCK_API_ADDRESS});
  });
});
