import {getClaimBusinessProcess, getClaimById, getDashboardClaimById, refreshDraftStoreClaimFrom} from 'modules/utilityService';
import {CivilServiceClient} from 'client/civilServiceClient';
import {Claim} from 'models/claim';
import {BusinessProcess} from 'models/businessProcess';
import {AppRequest, AppSession} from 'models/AppRequest';
import {Party} from 'models/party';
import {deleteDraftClaimFromStore, generateRedisKey, getCaseDataFromStore, getDraftClaimFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {TTLCategory} from 'modules/draft-store/ttlConfig';
import {syncCaseReferenceCookie} from 'modules/cookie/caseReferenceCookie';
import {ClaimantResponse} from 'models/claimantResponse';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';

jest.mock('modules/draft-store/draftStoreService', () => ({
  generateRedisKey: jest.fn(),
  getCaseDataFromStore: jest.fn(),
  saveDraftClaim: jest.fn(),
  deleteDraftClaimFromStore: jest.fn(),
  getClaimById: jest.fn(),
  getDraftClaimFromStore: jest.fn(),
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

  describe('getDashboardClaimById', () => {
    const request = {
      params: { id: '1645882162449409' },
      session: { user: { id: 'user-123' } },
    } as unknown as AppRequest;

    beforeEach(() => {
      jest.clearAllMocks();
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(new Claim());
    });

    it('should sync latest claim from civil service and preserve claimant response from cache', async () => {
      const cachedClaim = new Claim();
      cachedClaim.applicant1 = {} as Claim['applicant1'];
      cachedClaim.claimantResponse = new ClaimantResponse();
      const latestClaim = { id: '1645882162449409' } as Claim;

      (getCaseDataFromStore as jest.Mock).mockResolvedValueOnce(cachedClaim);
      jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValueOnce(latestClaim);

      const result = await getDashboardClaimById(request.params.id, request, true);

      expect(result).toBe(latestClaim);
      expect(result.claimantResponse).toBe(cachedClaim.claimantResponse);
      expect(saveDraftClaim as jest.Mock).toHaveBeenCalled();
    });

    it('should preserve an in-progress general application draft from cache', async () => {
      const cachedClaim = new Claim();
      cachedClaim.applicant1 = {} as Claim['applicant1'];
      cachedClaim.generalApplication = new GeneralApplication(new ApplicationType(ApplicationTypeOption.STAY_THE_CLAIM));
      const latestClaim = { id: '1645882162449409' } as Claim;

      (getCaseDataFromStore as jest.Mock).mockResolvedValueOnce(cachedClaim);
      jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValueOnce(latestClaim);

      const result = await getDashboardClaimById(request.params.id, request, true);

      expect(result.generalApplication).toBe(cachedClaim.generalApplication);
    });

    it('should throw an error if the claim does not exist in civil service', async () => {
      (getCaseDataFromStore as jest.Mock).mockResolvedValueOnce(new Claim());
      jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValueOnce(null as unknown as Claim);

      await expect(getDashboardClaimById(request.params.id, request, true)).rejects.toThrow('Case not found...');
    });
  });

  describe('refreshDraftStoreClaimFrom', () => {
    const claimId = '1645882162449409';
    const userId = 'user-123';
    const redisKey = `${claimId}${userId}`;
    let req: AppRequest;
    let claim: Claim;
    let retrieveClaim: jest.SpyInstance;
    const readDraft = getDraftClaimFromStore as jest.Mock;
    const deleteDraft = deleteDraftClaimFromStore as jest.Mock;
    const saveDraft = saveDraftClaim as jest.Mock;
    let savedClaims: Claim[];

    beforeEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
      req = {
        params: {id: claimId},
        session: {user: {id: userId}},
      } as unknown as AppRequest;
      claim = Object.assign(new Claim(), {
        id: claimId,
        claimantResponse: Object.assign(new ClaimantResponse(), {
          fullAdmitSetDateAcceptPayment: new GenericYesNo(YesNo.YES),
        }),
      });
      retrieveClaim = jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValue(claim);
      (generateRedisKey as jest.Mock).mockReturnValue(redisKey);
      readDraft.mockReset().mockResolvedValue({});
      deleteDraft.mockReset().mockResolvedValue(undefined);
      savedClaims = [];
      saveDraft.mockReset().mockImplementation(async (_key: string, saved: Claim) => {
        savedClaims.push(JSON.parse(JSON.stringify(saved)));
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    const expectSavedClaim = (key: string, expectedResponse: ClaimantResponse) => {
      expect(readDraft).toHaveBeenCalledTimes(1);
      expect(readDraft).toHaveBeenCalledWith(key, true);
      expect(retrieveClaim).toHaveBeenCalledTimes(1);
      expect(retrieveClaim).toHaveBeenCalledWith(claimId, req);
      expect(deleteDraft).toHaveBeenCalledTimes(1);
      expect(deleteDraft).toHaveBeenCalledWith(key);
      expect(saveDraft).toHaveBeenCalledTimes(1);
      expect(saveDraft).toHaveBeenCalledWith(key, claim, true, userId, TTLCategory.JOURNEY_CACHE);
      expect(deleteDraft.mock.invocationCallOrder[0]).toBeLessThan(saveDraft.mock.invocationCallOrder[0]);
      expect(savedClaims[0].claimantResponse).toEqual(JSON.parse(JSON.stringify(expectedResponse)));
      expect(req.session.caseReference).toBe(claimId);
    };

    it('refreshes a draft using the claim key when a user-specific key was not requested', async () => {
      const response = claim.claimantResponse;

      expect(await refreshDraftStoreClaimFrom(req)).toBe(claim);

      expectSavedClaim(claimId, response);
      expect(generateRedisKey).not.toHaveBeenCalled();
    });

    it.each([
      ['absent cache entry', undefined],
      ['null cache entry', null],
      ['missing case data', {}],
      ['missing cached response', {case_data: {}}],
      ['null cached response', {case_data: {claimantResponse: null}}],
    ])('retains the CCD response for %s', async (_description, cachedClaim) => {
      readDraft.mockResolvedValue(cachedClaim);
      const response = claim.claimantResponse;

      expect(await refreshDraftStoreClaimFrom(req, true)).toBe(claim);

      expect(claim.claimantResponse).toBe(response);
      expectSavedClaim(redisKey, response);
    });

    it('preserves an in-progress claimant response and general application rather than replacing them with CCD data', async () => {
      const response = Object.assign(new ClaimantResponse(), {
        fullAdmitSetDateAcceptPayment: new GenericYesNo(YesNo.NO),
      });
      const generalApplication = new GeneralApplication(new ApplicationType(ApplicationTypeOption.STAY_THE_CLAIM));
      readDraft.mockResolvedValue({case_data: {claimantResponse: response, generalApplication}});

      const result = await refreshDraftStoreClaimFrom(req, true);

      expect(result.claimantResponse).toBe(response);
      expect(result.generalApplication).toBe(generalApplication);
      expectSavedClaim(redisKey, response);
      expect(savedClaims[0].generalApplication).toEqual(JSON.parse(JSON.stringify(generalApplication)));
    });

    it('does not merge an existing empty response with the translated response', async () => {
      const response = new ClaimantResponse();
      readDraft.mockResolvedValue({case_data: {claimantResponse: response}});

      await refreshDraftStoreClaimFrom(req, true);

      expect(claim.claimantResponse).toBe(response);
      expectSavedClaim(redisKey, response);
    });

    it('throws when civil service has no claim without deleting or saving the draft', async () => {
      retrieveClaim.mockResolvedValue(null);

      await expect(refreshDraftStoreClaimFrom(req, true)).rejects.toThrow('Case not found...');

      expect(deleteDraft).not.toHaveBeenCalled();
      expect(saveDraft).not.toHaveBeenCalled();
      expect(req.session.caseReference).toBeUndefined();
    });

    it('propagates a cache-read failure before retrieving or replacing the claim', async () => {
      const error = new Error('cache read failed');
      readDraft.mockRejectedValue(error);

      await expect(refreshDraftStoreClaimFrom(req, true)).rejects.toBe(error);

      expect(retrieveClaim).not.toHaveBeenCalled();
      expect(deleteDraft).not.toHaveBeenCalled();
      expect(saveDraft).not.toHaveBeenCalled();
    });

    it('propagates a backend-read failure without deleting or saving the draft', async () => {
      const error = new Error('backend read failed');
      retrieveClaim.mockRejectedValue(error);

      await expect(refreshDraftStoreClaimFrom(req, true)).rejects.toBe(error);

      expect(deleteDraft).not.toHaveBeenCalled();
      expect(saveDraft).not.toHaveBeenCalled();
    });

    it('propagates a delete failure without attempting a write', async () => {
      const error = new Error('cache delete failed');
      deleteDraft.mockRejectedValue(error);

      await expect(refreshDraftStoreClaimFrom(req, true)).rejects.toBe(error);

      expect(saveDraft).not.toHaveBeenCalled();
      expect(req.session.caseReference).toBeUndefined();
    });

    it('propagates a write failure without reporting a successful refresh', async () => {
      const error = new Error('cache write failed');
      saveDraft.mockRejectedValue(error);

      await expect(refreshDraftStoreClaimFrom(req, true)).rejects.toBe(error);

      expect(deleteDraft).toHaveBeenCalledWith(redisKey);
      expect(req.session.caseReference).toBeUndefined();
    });
  });
});
