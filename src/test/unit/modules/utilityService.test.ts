import {getClaimBusinessProcess, getClaimById, refreshDraftStoreClaimFrom} from 'modules/utilityService';
import {CivilServiceClient} from 'client/civilServiceClient';
import {Claim} from 'models/claim';
import {BusinessProcess} from 'models/businessProcess';
import {AppRequest, AppSession} from 'models/AppRequest';
import {Party} from 'models/party';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {syncCaseReferenceCookie} from 'modules/cookie/caseReferenceCookie';

jest.mock('modules/draft-store/draftStoreService', () => ({
  generateRedisKey: jest.fn(),
  getCaseDataFromStore: jest.fn(),
  saveDraftClaim: jest.fn(),
  deleteDraftClaimFromStore: jest.fn(),
  getClaimById: jest.fn(),
}));

jest.mock('modules/cookie/caseReferenceCookie', () => ({
  syncCaseReferenceCookie: jest.fn(),
}));

describe('Utility service', () => {
  describe('getClaimBusinessProcess', () => {
    const mockRequest = { params: { id: '12345' } } as unknown as AppRequest;

    it('should return business process', async () => {
      //Given
      const claim = new Claim();
      claim.id = '1234';
      const businessProcess = new BusinessProcess();
      const FINISHED = 'FINISHED';
      const CREATE_CLAIM_SPEC = 'CREATE_CLAIM_SPEC';
      businessProcess.status = FINISHED;
      businessProcess.camundaEvent = CREATE_CLAIM_SPEC;
      claim.businessProcess = businessProcess;

      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValueOnce(claim);
      //when
      const results = await getClaimBusinessProcess(claim.id, mockRequest);
      //Then
      expect(results.status).toEqual(FINISHED);
      expect(results.camundaEvent).toEqual(CREATE_CLAIM_SPEC);
    });

    it('should throw Error if case not found', async () => {
      //Given
      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValueOnce(undefined);
      try {
        //when
        await getClaimBusinessProcess('1234', mockRequest);
      } catch (error) {
        //Then
        expect(error.message).toEqual('Case not found...');
      }
    });
  });

  describe('getClaimById', () => {
    const getCaseDataFromStoreMock = getCaseDataFromStore as jest.Mock;
    const syncCaseReferenceCookieMock = syncCaseReferenceCookie as jest.Mock;

    const createSession = (overrides: Partial<AppSession> = {}): AppSession => ({
      user: {
        accessToken: '',
        id: 'user-123',
        email: '',
        givenName: '',
        familyName: '',
        roles: [],
      },
      lang: undefined,
      previousUrl: '',
      claimId: '',
      taskLists: [],
      assignClaimURL: '',
      claimIssueTasklist: false,
      firstContact: {},
      fileUpload: '',
      issuedAt: 0,
      dashboard: {taskIdHearingUploadDocuments: ''},
      qmShareConfirmed: false,
      ...overrides,
    }) as AppSession;

    const createRequest = (sessionOverrides: Partial<AppSession> = {}): AppRequest => ({
      session: createSession(sessionOverrides),
    } as unknown as AppRequest);

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('stores case reference on the session and syncs cookie when claim has an id', async () => {
      const claim = new Claim();
      claim.applicant1 = new Party();
      claim.id = '1645882162449409';
      getCaseDataFromStoreMock.mockResolvedValueOnce(claim);
      const request = createRequest({caseReference: 'existing'});

      const result = await getClaimById('1645882162449409', request);

      expect(result).toBe(claim);
      expect(request.session.caseReference).toBe('1645882162449409');
      expect(syncCaseReferenceCookieMock).toHaveBeenCalledWith(request);
    });

    it('clears case reference from the session and syncs cookie when claim has no id', async () => {
      const claim = new Claim();
      claim.applicant1 = new Party();
      getCaseDataFromStoreMock.mockResolvedValueOnce(claim);
      const request = createRequest({caseReference: 'existing-reference'});

      const result = await getClaimById('draft-claim-id', request);

      expect(result).toBe(claim);
      expect(request.session.caseReference).toBeUndefined();
      expect(syncCaseReferenceCookieMock).toHaveBeenCalledWith(request);
    });
  });

  describe('refreshDraftStoreClaimFrom', () => {
    let req: AppRequest;

    const createSession = (overrides: Partial<AppSession> = {}): AppSession => ({
      user: {
        accessToken: '',
        id: 'user-123',
        email: '',
        givenName: '',
        familyName: '',
        roles: [],
      },
      lang: undefined,
      previousUrl: '',
      claimId: '',
      taskLists: [],
      assignClaimURL: '',
      claimIssueTasklist: false,
      firstContact: {},
      fileUpload: '',
      issuedAt: 0,
      dashboard: {taskIdHearingUploadDocuments: ''},
      qmShareConfirmed: false,
      ...overrides,
    }) as AppSession;

    const createRequest = (sessionOverrides: Partial<AppSession> = {}): AppRequest => ({
      session: createSession(sessionOverrides),
    } as unknown as AppRequest);

    beforeEach(() => {
      req = createRequest({caseReference: undefined, user: { id: 'user-123' } as unknown as AppSession['user']});
    });

    it('should successfully refresh a draft store claim', async () => {
      const claim = {
        isClaimantIntentionPending: jest.fn().mockReturnValue(false),
        id: '1645882162449409',
      } as unknown as Claim;
      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValueOnce(claim);

      const result = await refreshDraftStoreClaimFrom('1645882162449409', req);

      expect(result).toBe(claim);
      expect(req.session.caseReference).toBe('1645882162449409');

    });

    it('should throw an error if the claim does not exist', async () => {
      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValueOnce(null);
      try {
        await refreshDraftStoreClaimFrom('non-existent-claim-id', req);
      } catch (err) {
        expect(err.message).toBe('Case not found...');
      }

      expect(req.session.caseReference).toBeUndefined();
    });
  });
});
