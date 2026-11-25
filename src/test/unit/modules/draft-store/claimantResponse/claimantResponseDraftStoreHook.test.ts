import {app} from '../../../../../main/app-instance';
import {AppRequest} from 'common/models/AppRequest';
import {Claim} from 'models/claim';
import {CaseState} from 'form/models/claimDetails';
import {TTLCategory} from 'modules/draft-store/ttlConfig';
import {bindRequestContext} from 'common/utils/requestContext';
import {isDraftClaimantResponseDatabaseEnabled} from 'app/auth/launchdarkly/launchDarklyClient';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {writeWithTTL} from 'modules/draft-store/redisWriteHelper';
import {
  readDurableClaimantResponse,
  saveClaimantResponseDraftIfApplicable,
} from 'modules/draft-store/claimantResponse/claimantResponseDraftStoreService';

jest.mock('app/auth/launchdarkly/launchDarklyClient', () => ({
  isDraftClaimantResponseDatabaseEnabled: jest.fn(),
}));

jest.mock('modules/draft-store/redisWriteHelper', () => ({
  writeWithTTL: jest.fn(),
}));

jest.mock('modules/draft-store/claimantResponse/claimantResponseDraftStoreService', () => ({
  readDurableClaimantResponse: jest.fn(),
  saveClaimantResponseDraftIfApplicable: jest.fn(),
}));

const caseId = '1645882162449409';
const userId = '11111111-1111-1111-1111-111111111111';

const request = {
  params: {id: caseId},
  session: {user: {id: userId, accessToken: 'token'}},
} as unknown as AppRequest;

const runWithRequest = <T>(work: () => Promise<T>): Promise<T> => {
  let pending: Promise<T> | undefined;
  bindRequestContext(request, () => {
    pending = work();
  });
  if (!pending) {
    throw new Error('request context was not bound');
  }
  return pending;
};

describe('claimant response draft store hooks', () => {
  const flagMock = isDraftClaimantResponseDatabaseEnabled as jest.Mock;
  const readMock = readDurableClaimantResponse as jest.Mock;
  const saveMock = saveClaimantResponseDraftIfApplicable as jest.Mock;
  const writeMock = writeWithTTL as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    flagMock.mockResolvedValue(false);
    app.locals.draftStoreClient = {
      get: jest.fn().mockResolvedValue(null),
      ttl: jest.fn().mockResolvedValue(-2),
      set: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
    };
  });

  it('reads the durable draft when the flag is on', async () => {
    const durable = new Claim();
    durable.applicant1 = {type: 'INDIVIDUAL'} as Claim['applicant1'];
    durable.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
    flagMock.mockResolvedValue(true);
    readMock.mockResolvedValue(durable);

    const claim = await runWithRequest(() => getCaseDataFromStore(`${caseId}${userId}`));

    expect(claim).toBe(durable);
    expect(readMock).toHaveBeenCalledWith(request, `${caseId}${userId}`);
  });

  it('keeps the redis read when the flag is off', async () => {
    const claim = await runWithRequest(() => getCaseDataFromStore(`${caseId}${userId}`, true));

    expect(readMock).not.toHaveBeenCalled();
    expect(claim.isEmpty()).toBe(true);
  });

  it('does not write redis when the durable save fails', async () => {
    const claim = new Claim();
    claim.applicant1 = {type: 'INDIVIDUAL'} as Claim['applicant1'];
    flagMock.mockResolvedValue(true);
    saveMock.mockRejectedValue(new Error('db down'));

    await expect(runWithRequest(() => saveDraftClaim(`${caseId}${userId}`, claim, true, userId))).rejects.toThrow('db down');
    expect(writeMock).not.toHaveBeenCalled();
  });

  it('writes redis after a durable save is accepted', async () => {
    const claim = new Claim();
    claim.applicant1 = {type: 'INDIVIDUAL'} as Claim['applicant1'];
    flagMock.mockResolvedValue(true);
    saveMock.mockResolvedValue(true);

    await runWithRequest(() => saveDraftClaim(`${caseId}${userId}`, claim, true, userId, TTLCategory.DRAFT_CLAIM));

    expect(saveMock).toHaveBeenCalledWith(request, claim, TTLCategory.DRAFT_CLAIM);
    expect(writeMock).toHaveBeenCalled();
  });
});
