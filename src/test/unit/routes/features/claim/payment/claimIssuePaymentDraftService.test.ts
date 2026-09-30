import {getClaimIssuePaymentClaim} from 'routes/features/claim/payment/claimIssuePaymentDraftService';
import {createOrLoadDraft, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';
import {PaymentInformation} from 'models/feePayment/paymentInformation';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {Party} from 'models/party';
import {getTTLDaysForCategory, TTLCategory} from 'modules/draft-store/ttlConfig';

jest.mock('modules/draft-store/draftStoreManagerService');

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

const createClaim = (id?: string, withApplicant = false, withFeePayment = true): Claim => {
  const claim = new Claim();
  if (id) {
    claim.id = id;
  }
  if (withApplicant) {
    claim.applicant1 = new Party();
  }
  if (withFeePayment) {
    claim.claimDetails = new ClaimDetails();
    claim.claimDetails.claimFeePayment = new PaymentInformation('ext', 'RC-1');
    claim.claimFee = { calculatedAmountInPence: '432100' } as any;
    claim.paymentDetails = new PaymentInformation('ext', 'RC-1');
  }
  return claim;
};

const createManagerResult = (claim: Claim, rawCaseId?: string): DraftClaimManagerResult => ({
  claimResponse: {
    id: draftId,
    case_data: claim,
  } as unknown as CivilClaimResponse,
  rawResponse: {
    draftId,
    caseId: rawCaseId || claim.id,
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

  it('should return local draft claim and draftId when hydrated draft exists for caseId', async () => {
    const localDraftClaim = createClaim(claimId, true, true);
    mockCreateOrLoadDraft.mockResolvedValueOnce(createManagerResult(localDraftClaim, claimId));

    const result = await getClaimIssuePaymentClaim(createReq());

    expect(result.draftId).toBe(draftId);
    expect(result.claim.id).toBe(claimId);
    expect(result.claim.claimDetails.claimFeePayment?.paymentReference).toBe('RC-1');
    expect(mockCreateOrLoadDraft).toHaveBeenCalledWith(expect.anything(), {caseId: claimId});
    expect(retrieveClaimDetailsSpy).not.toHaveBeenCalled();
    expect(mockUpdateDraftClaim).not.toHaveBeenCalled();
  });

  it('should restore session.draftId from local draft when returning draft', async () => {
    const req = createReq();
    const localDraftClaim = createClaim(claimId, true, true);
    mockCreateOrLoadDraft.mockResolvedValueOnce(createManagerResult(localDraftClaim, claimId));

    await getClaimIssuePaymentClaim(req);

    expect(req.session.draftId).toBe(draftId);
  });

  it('should throw when url claim id is missing', async () => {
    await expect(getClaimIssuePaymentClaim(createReq(''))).rejects.toThrow(
      '[claimIssuePaymentDraftService] claim id is required',
    );
    expect(mockCreateOrLoadDraft).not.toHaveBeenCalled();
    expect(retrieveClaimDetailsSpy).not.toHaveBeenCalled();
  });

  it('should load claim from CCD and persist local draft when local draft is unhydrated', async () => {
    const ccdClaim = createClaim(claimId, true, true);
    const unhydratedDraftClaim = createClaim(claimId, false, false);
    const req = createReq();

    mockCreateOrLoadDraft.mockResolvedValueOnce(createManagerResult(unhydratedDraftClaim, claimId));
    retrieveClaimDetailsSpy.mockResolvedValueOnce(ccdClaim);
    mockCreateOrLoadDraft.mockResolvedValueOnce(createManagerResult(ccdClaim, claimId));
    mockUpdateDraftClaim.mockResolvedValueOnce(createManagerResult(ccdClaim, claimId));

    const result = await getClaimIssuePaymentClaim(req);

    expect(retrieveClaimDetailsSpy).toHaveBeenCalledWith(claimId, req);
    expect(ccdClaim.draftClaimCacheTtlDays).toBe(getTTLDaysForCategory(TTLCategory.DRAFT_CLAIM));
    expect(mockCreateOrLoadDraft).toHaveBeenNthCalledWith(1, req, {caseId: claimId});
    expect(mockCreateOrLoadDraft).toHaveBeenNthCalledWith(2, req, ccdClaim);
    expect(mockUpdateDraftClaim).toHaveBeenCalledWith(req, ccdClaim, draftId);
    expect(result.claim).toBe(ccdClaim);
    expect(result.draftId).toBe(draftId);
  });

  it('should throw when local draft is unhydrated and CCD has no claim', async () => {
    const unhydratedDraftClaim = createClaim(claimId, false, false);
    mockCreateOrLoadDraft.mockResolvedValueOnce(createManagerResult(unhydratedDraftClaim, claimId));
    retrieveClaimDetailsSpy.mockResolvedValueOnce(new Claim());

    await expect(getClaimIssuePaymentClaim(createReq())).rejects.toThrow(
      '[claimIssuePaymentDraftService] no claim found',
    );
    expect(mockUpdateDraftClaim).not.toHaveBeenCalled();
  });
});
