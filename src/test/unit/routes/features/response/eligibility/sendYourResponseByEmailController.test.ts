import {Response} from 'express';
import sendYourResponseByEmailController from 'routes/features/response/eligibility/sendYourResponseByEmailController';
import {SEND_RESPONSE_BY_EMAIL_URL} from 'routes/urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('client/civilServiceClient', () => {
  const methods = {
    getFeeRanges: jest.fn(),
  };
  return {CivilServiceClient: jest.fn(() => methods)};
});
jest.mock('modules/draft-store/draftStoreService');

const civilServiceMethods = new CivilServiceClient('http://localhost') as unknown as {
  getFeeRanges: jest.Mock;
};

const viewPath = 'features/response/eligibility/send-your-response-by-email';
const claimId = '12345';

const storedClaim = (): Claim => {
  const claim = new Claim();
  claim.applicant1 = {
    type: PartyType.INDIVIDUAL,
    partyDetails: {partyName: 'Joe Bloggs', firstName: 'Joe', lastName: 'Bloggs'},
  };
  claim.respondent1ResponseDeadline = new Date('2099-06-01T16:00:00.000Z');
  return claim;
};

const invoke = async () => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(sendYourResponseByEmailController, 'get', SEND_RESPONSE_BY_EMAIL_URL)(
    {
      params: {id: claimId},
      body: {},
      query: {},
      cookies: {},
      session: createMockSession({user: {id: 'user-1'}}),
    } as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

describe('Send your response by email', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (getCaseDataFromStore as jest.Mock).mockResolvedValue(storedClaim());
    civilServiceMethods.getFeeRanges.mockResolvedValue({value: []});
  });

  it('should render the send your response by email page', async () => {
    const {res} = await invoke();

    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      form: expect.any(Claim),
      fees: [[]],
      responseDeadline: storedClaim().formattedResponseDeadline(undefined),
    }));
  });

  it('should return the error when the claim cannot be loaded', async () => {
    const error = new Error('redis failure');
    (getCaseDataFromStore as jest.Mock).mockRejectedValue(error);

    const {next} = await invoke();

    expect(next).toHaveBeenCalledWith(error);
  });
});
