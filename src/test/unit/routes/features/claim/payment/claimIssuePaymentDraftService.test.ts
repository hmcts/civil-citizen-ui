import {getClaimIssuePaymentClaim} from 'routes/features/claim/payment/claimIssuePaymentDraftService';
import {createOrLoadDraft, getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';
import {PaymentInformation} from 'models/feePayment/paymentInformation';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {Party} from 'models/party';

jest.mock('modules/draft-store/draftStoreManagerService');

const mockGetDraftClaim = getDraftClaim as jest.Mock;
const mockCreateOrLoadDraft = createOrLoadDraft as jest.Mock;
const mockUpdateDraftClaim = updateDraftClaim as jest.Mock;

const claimId = '1790252856529614';
const draftId = 'draft-123';

const createReq = (id = claimId, withSessionDraftId = false): AppRequest => ({
  params: {id},
  session: {
    user: {id: 'user-id'},
    ...(withSessionDraftId ? {draftId} : {}),
  },
} as unknown as AppRequest);

const createClaim = (id?: string, withApplicant = false): Claim => {
  const claim = new Claim();
  if (id) {
    claim.id = id;
  }
  if (withApplicant) {
    claim.applicant1 = new Party();
  }
  claim.claimDetails = new ClaimDetails();
  claim.claimDetails.claimFeePayment = new PaymentInformation('ext', 'RC-1');
  return claim;
};

const createManagerResult = (claim: Claim, rawCaseId?: string): DraftClaimManagerResult => ({
  claimResponse: {
    id: draftId,
    case_data: claim,
  } as unknown as CivilClaimResponse,
  rawResponse: {
    draftId,
    caseId: rawCaseId,
    payload: claim as unknown as Record<string, unknown>,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: '2026-08-01T11:00:00.000Z',
    expiresAt: '2026-09-01T10:00:00.000Z',
  },
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T11:00:00.000Z',
  expiresAt: '2026-09-01T10:00:00.000Z',
});

describe('getClaimIssuePaymentClaim', () => {
  const retrieveClaimDetailsSpy = jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails');

  beforeEach(() => {
    jest.clearAllMocks();
    retrieveClaimDetailsSpy.mockReset();
  });

  afterAll(() => {
    retrieveClaimDetailsSpy.mockRestore();
  });

  it('should return claim and draftId when payload id matches url claim id', async () => {
    mockGetDraftClaim.mockResolvedValueOnce(createManagerResult(createClaim(claimId)));

    const result = await getClaimIssuePaymentClaim(createReq());

    expect(result.draftId).toBe(draftId);
    expect(result.claim.id).toBe(claimId);
    expect(result.claim.claimDetails.claimFeePayment?.paymentReference).toBe('RC-1');
    expect(retrieveClaimDetailsSpy).not.toHaveBeenCalled();
  });

  it('should match using rawResponse.caseId when payload id is missing', async () => {
    const claim = createClaim();
    mockGetDraftClaim.mockResolvedValueOnce(createManagerResult(claim, claimId));

    const result = await getClaimIssuePaymentClaim(createReq());

    expect(result.claim.claimDetails.claimFeePayment?.paymentReference).toBe('RC-1');
    expect(result.draftId).toBe(draftId);
    expect(retrieveClaimDetailsSpy).not.toHaveBeenCalled();
  });

  it('should restore session.draftId from the durable draft', async () => {
    const req = createReq();
    mockGetDraftClaim.mockResolvedValueOnce(createManagerResult(createClaim(claimId)));

    await getClaimIssuePaymentClaim(req);

    expect(req.session.draftId).toBe(draftId);
  });

  it('should throw when url claim id is missing', async () => {
    await expect(getClaimIssuePaymentClaim(createReq(''))).rejects.toThrow(
      '[claimIssuePaymentDraftService] claim id is required',
    );
    expect(mockGetDraftClaim).not.toHaveBeenCalled();
    expect(retrieveClaimDetailsSpy).not.toHaveBeenCalled();
  });

  it('should load the claim from CCD and persist a draft when there is no durable draft', async () => {
    const ccdClaim = createClaim(claimId, true);
    const req = createReq();
    mockGetDraftClaim.mockResolvedValueOnce(null);
    retrieveClaimDetailsSpy.mockResolvedValueOnce(ccdClaim);
    mockCreateOrLoadDraft.mockResolvedValueOnce(createManagerResult(ccdClaim));
    mockUpdateDraftClaim.mockResolvedValueOnce(createManagerResult(ccdClaim));

    const result = await getClaimIssuePaymentClaim(req);

    expect(retrieveClaimDetailsSpy).toHaveBeenCalledWith(claimId, req);
    expect(mockCreateOrLoadDraft).toHaveBeenCalledWith(req, ccdClaim);
    expect(mockUpdateDraftClaim).toHaveBeenCalledWith(req, ccdClaim, draftId);
    expect(result.claim).toBe(ccdClaim);
    expect(result.draftId).toBe(draftId);
    expect(req.session.draftId).toBe(draftId);
  });

  it('should throw when there is no durable draft and CCD has no claim', async () => {
    mockGetDraftClaim.mockResolvedValueOnce(null);
    retrieveClaimDetailsSpy.mockResolvedValueOnce(new Claim());

    await expect(getClaimIssuePaymentClaim(createReq())).rejects.toThrow(
      '[claimIssuePaymentDraftService] no draft claim found for payment resume',
    );
    expect(mockCreateOrLoadDraft).not.toHaveBeenCalled();
    expect(mockUpdateDraftClaim).not.toHaveBeenCalled();
  });

  it('should throw when draft case id does not match url claim id', async () => {
    mockGetDraftClaim.mockResolvedValueOnce(createManagerResult(createClaim('0000000000000000')));

    await expect(getClaimIssuePaymentClaim(createReq())).rejects.toThrow(
      '[claimIssuePaymentDraftService] draft does not match claim id',
    );
    expect(retrieveClaimDetailsSpy).not.toHaveBeenCalled();
  });
});
