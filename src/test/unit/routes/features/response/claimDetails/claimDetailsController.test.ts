import {Response} from 'express';
import claimDetailsController from 'routes/features/response/claimDetails/claimDetailsController';
import {CLAIM_DETAILS_URL} from 'routes/urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import {isWelshEnabledForMainCase} from 'app/auth/launchdarkly/launchDarklyClient';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {CaseState} from 'form/models/claimDetails';
import {DocumentType} from 'models/document/documentType';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import civilClaimResponseMock from '../../../../../utils/mocks/civilClaimResponseMock.json';
import civilClaimResponsePDFTimeline from '../../../../../utils/mocks/civilClaimResponsePDFTimelineMock.json';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('app/auth/launchdarkly/launchDarklyClient', () => ({
  isWelshEnabledForMainCase: jest.fn(),
}));

const viewPath = 'features/response/claimDetails/claim-details-new';
const claimId = '1111';

const basicClaim = (): Claim => {
  const claim = new Claim();
  claim.legacyCaseReference = '000MC009';
  claim.applicant1 = {
    type: PartyType.INDIVIDUAL,
    partyDetails: {partyName: 'Joe Bloggs', firstName: 'Joe', lastName: 'Bloggs'},
  };
  return claim;
};

const claimFrom = (caseData: object): Claim => Object.assign(new Claim(), caseData);

const invoke = async (req: Record<string, unknown> = {}) => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(claimDetailsController, 'get', CLAIM_DETAILS_URL)(
    {
      params: {id: claimId},
      body: {},
      query: {},
      cookies: {},
      session: createMockSession({user: {id: 'user-1'}}),
      ...req,
    } as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

describe('Claim details page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (isWelshEnabledForMainCase as jest.Mock).mockResolvedValue(false);
    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValue(basicClaim());
    jest.spyOn(CivilServiceClient.prototype as unknown as {calculateClaimInterestFromCivilService: () => Promise<number>},
      'calculateClaimInterestFromCivilService').mockResolvedValue(15);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render the claim details page', async () => {
    const {res} = await invoke();

    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      pageTitle: 'PAGES.CLAIM_DETAILS.PAGE_TITLE_NEW',
      pageCaption: 'PAGES.CLAIM_DETAILS.THE_CLAIM',
      showErrorAwaitingTranslation: false,
    }));
  });

  it('should include the timeline download url when the claim has a timeline document', async () => {
    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValue(
      claimFrom(civilClaimResponsePDFTimeline.case_data),
    );

    const {res} = await invoke();

    expect(res.render.mock.calls[0][1].timelinePdfUrl).toContain('74bf213e-72dd-4908-9e08-72fefaed9c5c');
  });

  it('should flag documents that are still being translated', async () => {
    const claim = claimFrom(civilClaimResponseMock.case_data);
    claim.ccdState = CaseState.PENDING_CASE_ISSUED;
    claim.preTranslationDocuments = [{
      id: '1234',
      value: {
        createdBy: 'someone',
        documentLink: {
          document_url: 'url',
          document_filename: 'filename',
          document_binary_url: 'http://dm-store:8080/documents/77121e9b-e83a-440a-9429-e7f0fe89e518/binary',
        },
        documentName: 'some name',
        documentType: DocumentType.SEALED_CLAIM,
        documentSize: 123,
        createdDatetime: new Date(),
      },
    }];
    (isWelshEnabledForMainCase as jest.Mock).mockResolvedValue(true);
    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValue(claim);

    const {res} = await invoke();

    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      showErrorAwaitingTranslation: true,
      sealedClaimPdfUrl: constructResponseUrlWithIdParams(claimId, CLAIM_DETAILS_URL),
    }));
  });

  it('should calculate interest once for the request', async () => {
    const downstreamInterestSpy = jest
      .spyOn(CivilServiceClient.prototype as unknown as {calculateClaimInterestFromCivilService: () => Promise<number>},
        'calculateClaimInterestFromCivilService')
      .mockResolvedValue(15);
    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValue(
      claimFrom(civilClaimResponseMock.case_data),
    );

    const {res} = await invoke();

    expect(res.render).toHaveBeenCalledWith(viewPath, expect.anything());
    expect(downstreamInterestSpy).toHaveBeenCalledTimes(1);
  });

  it('should return the error when the claim cannot be retrieved', async () => {
    const error = new Error('Test error');
    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockRejectedValue(error);

    const {next} = await invoke();

    expect(next).toHaveBeenCalledWith(error);
  });
});
