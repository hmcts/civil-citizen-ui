import {Claim} from 'models/claim';
import {AppRequest} from 'common/models/AppRequest';
import {getDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {BASE_ELIGIBILITY_URL} from 'routes/urls';
import {claimIssueTaskListGuard} from 'routes/guards/claimIssueTaskListGuard';
import {NextFunction, Response} from 'express';

jest.mock('../../../../main/modules/draft-store/draftStoreManagerService');

const mockGetDraftClaim = getDraftClaim as jest.Mock;

const invoke = async (overrides: Partial<AppRequest> = {}) => {
  const req = {
    session: {},
    cookies: {},
    originalUrl: '/claim/task-list',
    ...overrides,
  } as AppRequest;
  const res = {redirect: jest.fn()} as unknown as Response;
  const next = jest.fn() as NextFunction;
  await claimIssueTaskListGuard(req, res, next);
  return {req, res, next};
};

describe('Claim Issue TaskList Guard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to eligibility when there is no draft claim and no eligibility cookie', async () => {
    mockGetDraftClaim.mockResolvedValue(null);

    const {res, next} = await invoke();

    expect(res.redirect).toHaveBeenCalledWith(BASE_ELIGIBILITY_URL);
    expect(next).not.toHaveBeenCalled();
  });

  it('stashes the draft claim, stores the draft id, and calls next()', async () => {
    const createdAt = '2026-08-14T12:00:00.000Z';
    mockGetDraftClaim.mockResolvedValue({
      claimResponse: {case_data: {id: 'claim-123'}},
      createdAt,
      rawResponse: {draftId: 'draft-456'},
      isNew: false,
    });

    const {req, res, next} = await invoke();

    expect(next).toHaveBeenCalledWith();
    expect(res.redirect).not.toHaveBeenCalled();
    expect(req.session.draftId).toBe('draft-456');
    expect(req.locals.claim).toBeInstanceOf(Claim);
    expect(req.locals.claim.draftClaimCreatedAt).toEqual(new Date(createdAt));
    expect(req.locals.claim.isDraftClaim()).toBe(true);
  });

  it('calls next() when the eligibility cookie is set and there is no draft', async () => {
    mockGetDraftClaim.mockResolvedValue(null);

    const {res, next} = await invoke({cookies: {eligibilityCompleted: 'true'}});

    expect(next).toHaveBeenCalledWith();
    expect(res.redirect).not.toHaveBeenCalled();
  });

  it('calls next() for confirmation, fee and pay-fees URLs without an eligibility cookie', async () => {
    mockGetDraftClaim.mockResolvedValue(null);

    const confirmation = await invoke({originalUrl: '/claim/confirmation'});
    const fee = await invoke({originalUrl: '/claim/fee'});

    expect(confirmation.next).toHaveBeenCalledWith();
    expect(fee.next).toHaveBeenCalledWith();
    expect(confirmation.res.redirect).not.toHaveBeenCalled();
  });

  it('calls next with the error when the draft claim lookup fails', async () => {
    const error = new Error('draft store down');
    mockGetDraftClaim.mockRejectedValue(error);

    const {next} = await invoke();

    expect(next).toHaveBeenCalledWith(error);
  });
});
