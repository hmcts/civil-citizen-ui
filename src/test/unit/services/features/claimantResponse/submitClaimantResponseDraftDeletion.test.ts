import {AppRequest} from 'common/models/AppRequest';
import {Claim} from 'models/claim';
import {CaseState} from 'form/models/claimDetails';
import {CivilServiceClient} from 'client/civilServiceClient';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {deleteClaimantResponseDraft} from 'modules/draft-store/claimantResponse/claimantResponseDraftStoreService';
import {submitClaimantResponse as submitIntention} from 'services/features/claimantResponse/submitClaimantResponse';
import {submitClaimantResponse as submitJudgement} from 'services/features/claimantResponse/submission/submitClaimantResponse';

jest.mock('modules/draft-store/draftStoreService', () => ({
  generateRedisKey: jest.fn().mockReturnValue('redis-key'),
  getCaseDataFromStore: jest.fn(),
}));

jest.mock('modules/draft-store/claimantResponse/claimantResponseDraftStoreService', () => ({
  deleteClaimantResponseDraft: jest.fn(),
}));

jest.mock('services/translation/claimantResponse/claimantResponseCCDTranslation', () => ({
  translateClaimantResponseToCCD: jest.fn().mockReturnValue({}),
}));

jest.mock('services/translation/claimantResponse/ccdRequestJudgementTranslation', () => ({
  translateClaimantResponseRequestJudgementByAdmissionOrDeterminationToCCD: jest.fn(),
  translateClaimantResponseRequestDefaultJudgementByAdmissionToCCD: jest.fn().mockResolvedValue({}),
}));

jest.mock('services/translation/claimantResponse/ccdTranslation', () => ({
  translateClaimantResponseDJToCCD: jest.fn().mockResolvedValue({}),
}));

const caseId = '1645882162449409';
const deleteMock = deleteClaimantResponseDraft as jest.Mock;
const getClaimMock = getCaseDataFromStore as jest.Mock;

const request = {
  params: {id: caseId},
  session: {user: {id: 'user-123', accessToken: 'token'}},
} as unknown as AppRequest;

describe('claimant response submit deletes the durable draft', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deletes the draft after the claimant intention event succeeds', async () => {
    const claim = new Claim();
    claim.applicant1 = {type: 'INDIVIDUAL'} as Claim['applicant1'];
    getClaimMock.mockResolvedValue(claim);
    const submitted = new Claim();
    jest.spyOn(CivilServiceClient.prototype, 'submitClaimantResponseEvent').mockResolvedValue(submitted);

    await expect(submitIntention(request)).resolves.toBe(submitted);
    expect(deleteMock).toHaveBeenCalledWith(request, caseId);
  });

  it('does not delete the draft when the claimant intention event fails', async () => {
    getClaimMock.mockResolvedValue(new Claim());
    jest.spyOn(CivilServiceClient.prototype, 'submitClaimantResponseEvent').mockRejectedValue(new Error('ccd down'));

    await expect(submitIntention(request)).rejects.toThrow('ccd down');
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it('deletes the draft after a request-judgement admission submit', async () => {
    const claim = new Claim();
    claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
    getClaimMock.mockResolvedValue(claim);
    const submitted = new Claim();
    jest.spyOn(CivilServiceClient.prototype, 'submitClaimantResponseForRequestJudgementAdmission').mockResolvedValue(submitted);

    await expect(submitJudgement(request)).resolves.toBe(submitted);
    expect(deleteMock).toHaveBeenCalledWith(request, caseId);
  });

  it('deletes the draft after a default-judgement submit', async () => {
    const claim = new Claim();
    claim.ccdState = CaseState.CASE_ISSUED;
    getClaimMock.mockResolvedValue(claim);
    const submitted = new Claim();
    jest.spyOn(CivilServiceClient.prototype, 'submitClaimantResponseDJEvent').mockResolvedValue(submitted);

    await expect(submitJudgement(request)).resolves.toBe(submitted);
    expect(deleteMock).toHaveBeenCalledWith(request, caseId);
  });
});
