import {Response} from 'express';
import viewMediationDocuments from 'routes/features/document/mediation/viewMediationDocumentsController';
import {VIEW_MEDIATION_DOCUMENTS} from 'routes/urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('client/civilServiceClient', () => {
  const methods = {
    retrieveClaimDetails: jest.fn(),
  };
  return {CivilServiceClient: jest.fn(() => methods)};
});

const civilServiceMethods = new CivilServiceClient('http://localhost') as unknown as {
  retrieveClaimDetails: jest.Mock;
};

const claimId = '123';
const viewPath = 'features/common/viewDocuments';

const invoke = async () => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(viewMediationDocuments, 'get', VIEW_MEDIATION_DOCUMENTS)(
    {
      params: {id: claimId},
      body: {},
      query: {},
      cookies: {},
      session: createMockSession(),
    } as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

describe('view mediation document controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('on Get', () => {
    it('should render the mediation documents page', async () => {
      const claim = new Claim();
      claim.totalClaimAmount = 1000;
      civilServiceMethods.retrieveClaimDetails.mockResolvedValue(claim);

      const {res} = await invoke();

      expect(civilServiceMethods.retrieveClaimDetails).toHaveBeenCalledWith(claimId, expect.anything());
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageCaption: 'COMMON.MEDIATION',
        pageTitle: 'PAGES.VIEW_MEDIATION_DOCUMENTS.PAGE_TITLE',
        isCarm: true,
        claimAmount: 1000,
      }));
    });

    it('should pass the error to next when retrieving the claim fails', async () => {
      const error = new Error('civil service failure');
      civilServiceMethods.retrieveClaimDetails.mockRejectedValue(error);

      const {next} = await invoke();

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
