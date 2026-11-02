import {Response} from 'express';
import {CivilServiceClient} from 'client/civilServiceClient';
import {CaseRole} from 'form/models/caseRoles';
import {Claim} from 'models/claim';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {Party} from 'models/party';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {deleteDraftClaimFromStore, generateRedisKey} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {
  getSummarySections,
  saveUploadedDocuments,
} from 'services/features/caseProgression/checkYourAnswers/checkAnswersService';
import documentUploadCheckAnswerController from 'routes/features/caseProgression/checkAnswersController';
import {CP_CHECK_ANSWERS_URL, CP_EVIDENCE_UPLOAD_SUBMISSION_URL} from 'routes/urls';
import {createMockResponse, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('client/civilServiceClient', () => {
  const methods = {updateTaskStatus: jest.fn()};
  return {CivilServiceClient: jest.fn(() => methods)};
});

jest.mock('modules/draft-store/draftStoreService', () => ({
  generateRedisKey: jest.fn(() => 'redis-key'),
  deleteDraftClaimFromStore: jest.fn(),
}));

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));

jest.mock('services/features/caseProgression/checkYourAnswers/checkAnswersService', () => ({
  getBottomElements: jest.fn((): unknown[] => []),
  getSummarySections: jest.fn(() => ({sections: [] as unknown[]})),
  getTopElements: jest.fn((): unknown[] => []),
  saveUploadedDocuments: jest.fn(),
}));

const civilServiceMethods = new CivilServiceClient('http://localhost') as unknown as {
  updateTaskStatus: jest.Mock;
};
const mockGetClaimById = getClaimById as jest.Mock;
const mockGetSummarySections = getSummarySections as jest.Mock;
const mockSaveUploadedDocuments = saveUploadedDocuments as jest.Mock;

const claimId = '1645882162449409';
const viewPath = 'features/caseProgression/check-answers';

const claimWithRole = (caseRole: CaseRole): Claim => {
  const claim = new Claim();
  claim.caseRole = caseRole;
  claim.totalClaimAmount = 1000;
  claim.applicant1 = new Party();
  claim.caseProgression = new CaseProgression();
  claim.caseProgression.claimantDocuments = {documentsForDisclosure: []} as Claim['caseProgression']['claimantDocuments'];
  claim.caseProgression.defendantDocuments = {documentsForDisclosure: []} as Claim['caseProgression']['defendantDocuments'];
  return claim;
};

describe('Evidence Upload - checkYourAnswers Controller', () => {
  const getHandler = getRouteHandler(documentUploadCheckAnswerController, 'get', CP_CHECK_ANSWERS_URL);
  const postHandler = getRouteHandler(documentUploadCheckAnswerController, 'post', CP_CHECK_ANSWERS_URL);

  beforeEach(() => {
    jest.clearAllMocks();
    mockSaveUploadedDocuments.mockResolvedValue(undefined);
    (deleteDraftClaimFromStore as jest.Mock).mockResolvedValue(undefined);
    civilServiceMethods.updateTaskStatus.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('renders defendant answers', async () => {
      const claim = claimWithRole(CaseRole.DEFENDANT);
      mockGetClaimById.mockResolvedValue(claim);
      const res = createMockResponse();
      const req = {params: {id: claimId}, query: {lang: 'en'}, cookies: {}, originalUrl: '/check', session: {}} as unknown as AppRequest;

      await getHandler(req, res as unknown as Response, jest.fn());

      expect(req.session.previousUrl).toBe('/check');
      expect(mockGetSummarySections).toHaveBeenCalledWith(claim.caseProgression.defendantDocuments, claimId, claim.isSmallClaimsTrackDQ, 'en');
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.anything(),
        summarySections: {sections: []},
      }));
    });

    it('renders claimant answers', async () => {
      const claim = claimWithRole(CaseRole.CLAIMANT);
      mockGetClaimById.mockResolvedValue(claim);
      const res = createMockResponse();

      await getHandler(
        {params: {id: claimId}, query: {}, cookies: {lang: 'cy'}, originalUrl: '/check', session: {}} as unknown as AppRequest,
        res as unknown as Response,
        jest.fn(),
      );

      expect(mockGetSummarySections).toHaveBeenCalledWith(claim.caseProgression.claimantDocuments, claimId, claim.isSmallClaimsTrackDQ, 'cy');
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.any(Object));
    });

    it('calls next when the claim cannot be loaded', async () => {
      const error = new Error('redis failure');
      mockGetClaimById.mockRejectedValue(error);
      const next = jest.fn();

      await getHandler(
        {params: {id: claimId}, query: {}, cookies: {}, session: {}} as unknown as AppRequest,
        createMockResponse() as unknown as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('re-renders when the declaration is not signed', async () => {
      mockGetClaimById.mockResolvedValue(claimWithRole(CaseRole.DEFENDANT));
      const res = createMockResponse();

      await postHandler(
        {params: {id: claimId}, query: {lang: 'en'}, cookies: {}, body: {}, session: {}} as unknown as AppRequest,
        res as unknown as Response,
        jest.fn(),
      );

      expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveUploadedDocuments).not.toHaveBeenCalled();
    });

    it('re-renders claimant answers when the declaration is not signed', async () => {
      const claim = claimWithRole(CaseRole.CLAIMANT);
      mockGetClaimById.mockResolvedValue(claim);
      const res = createMockResponse();

      await postHandler(
        {params: {id: claimId}, query: {}, cookies: {lang: 'cy'}, body: {}, session: {}} as unknown as AppRequest,
        res as unknown as Response,
        jest.fn(),
      );

      expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockGetSummarySections).toHaveBeenCalledWith(claim.caseProgression.claimantDocuments, claimId, claim.isSmallClaimsTrackDQ, 'cy');
    });

    it('saves the documents and redirects to the submission page', async () => {
      const claim = claimWithRole(CaseRole.DEFENDANT);
      mockGetClaimById.mockResolvedValue(claim);
      const res = createMockResponse();
      const req = {params: {id: claimId}, query: {}, cookies: {}, body: {signed: true}, session: {}} as unknown as AppRequest;

      await postHandler(req, res as unknown as Response, jest.fn());

      expect(mockSaveUploadedDocuments).toHaveBeenCalledWith(claim, req);
      expect(generateRedisKey).toHaveBeenCalledWith(req);
      expect(deleteDraftClaimFromStore).toHaveBeenCalledWith('redis-key');
      expect(civilServiceMethods.updateTaskStatus).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CP_EVIDENCE_UPLOAD_SUBMISSION_URL));
    });

    it('updates the hearing task when a task id is on the session', async () => {
      const claim = claimWithRole(CaseRole.CLAIMANT);
      mockGetClaimById.mockResolvedValue(claim);
      const res = createMockResponse();
      const req = {
        params: {id: claimId},
        query: {},
        cookies: {},
        body: {signed: true},
        session: {dashboard: {taskIdHearingUploadDocuments: 'task-1'}},
      } as unknown as AppRequest;

      await postHandler(req, res as unknown as Response, jest.fn());

      expect(civilServiceMethods.updateTaskStatus).toHaveBeenCalledWith('task-1', req);
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CP_EVIDENCE_UPLOAD_SUBMISSION_URL));
    });

    it('calls next when saving fails', async () => {
      const error = new Error('redis failure');
      mockGetClaimById.mockRejectedValue(error);
      const next = jest.fn();

      await postHandler(
        {params: {id: claimId}, query: {}, cookies: {}, body: {signed: true}, session: {}} as unknown as AppRequest,
        createMockResponse() as unknown as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
