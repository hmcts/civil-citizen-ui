import {Response} from 'express';
import viewSettlementAgreementDocument from 'routes/features/document/mediation/viewSettlementAgreementDocumentController';
import {VIEW_MEDIATION_SETTLEMENT_AGREEMENT_DOCUMENT} from 'routes/urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import {Claim} from 'models/claim';
import {MediationAgreement} from 'models/mediation/mediationAgreement';
import {DocumentType} from 'models/document/documentType';
import {MOCK_MEDIATION_AGREEMENT_DOCUMENT} from '../../../../../utils/mocks/documents/documentsMock';
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

const mediationClaim = (): Claim => {
  const claim = new Claim();
  claim.totalClaimAmount = 1000;
  claim.mediationAgreement = {
    name: 'fileName',
    documentType: DocumentType.MEDIATION_AGREEMENT,
    document: MOCK_MEDIATION_AGREEMENT_DOCUMENT,
    documentUploadedDatetime: new Date('2024-01-01'),
  } as MediationAgreement;
  return claim;
};

const invoke = async () => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(viewSettlementAgreementDocument, 'get', VIEW_MEDIATION_SETTLEMENT_AGREEMENT_DOCUMENT)(
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

describe('view mediation settlement agreement document controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('on Get', () => {
    it('should render the mediation settlement agreement page', async () => {
      civilServiceMethods.retrieveClaimDetails.mockResolvedValue(mediationClaim());

      const {res} = await invoke();

      expect(civilServiceMethods.retrieveClaimDetails).toHaveBeenCalledWith(claimId, expect.anything());
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageCaption: 'COMMON.MEDIATION',
        pageTitle: 'PAGES.VIEW_MEDIATION_SETTLEMENT_AGREEMENT_DOCUMENT.PAGE_TITLE',
        isCarm: true,
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
