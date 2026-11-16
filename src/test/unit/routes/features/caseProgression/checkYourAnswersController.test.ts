import {Response} from 'express';
import {CivilServiceClient} from 'client/civilServiceClient';
import {CaseRole} from 'form/models/caseRoles';
import {Claim} from 'models/claim';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {UploadDocuments, UploadDocumentTypes} from 'models/caseProgression/uploadDocumentsType';
import {UploadDocumentsUserForm, WitnessSection} from 'models/caseProgression/uploadDocumentsUserForm';
import {CaseDocument} from 'models/document/caseDocument';
import {Party} from 'models/party';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createNoValidDocumentsError, FILE_UPLOAD_SOURCE} from 'common/utils/fileUploadUtils';
import {deleteDraftClaimFromStore, generateRedisKey} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {
  getSummarySections,
  hasValidNewDocuments,
  saveUploadedDocuments,
} from 'services/features/caseProgression/checkYourAnswers/checkAnswersService';
import documentUploadCheckAnswerController from 'routes/features/caseProgression/checkAnswersController';
import {
  CP_CHECK_ANSWERS_URL,
  CP_EVIDENCE_UPLOAD_SUBMISSION_URL,
  CP_UPLOAD_DOCUMENTS_URL,
  TYPES_OF_DOCUMENTS_URL,
} from 'routes/urls';
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
  hasValidNewDocuments: jest.fn(() => true),
  saveUploadedDocuments: jest.fn(),
}));

const actualCheckAnswersService = jest.requireActual('services/features/caseProgression/checkYourAnswers/checkAnswersService');

const civilServiceMethods = new CivilServiceClient('http://localhost') as unknown as {
  updateTaskStatus: jest.Mock;
};
const mockGetClaimById = getClaimById as jest.Mock;
const mockGetSummarySections = getSummarySections as jest.Mock;
const mockSaveUploadedDocuments = saveUploadedDocuments as jest.Mock;
const mockHasValidNewDocuments = hasValidNewDocuments as jest.Mock;

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

const withSelectedDocumentTypes = (claim: Claim): Claim => {
  const documentTypes = new UploadDocuments([new UploadDocumentTypes(true)], [], [], []);
  claim.caseProgression.claimantUploadDocuments = documentTypes;
  claim.caseProgression.defendantUploadDocuments = documentTypes;
  return claim;
};

const buildAllInvalidDraft = (caseDocument: CaseDocument = undefined): UploadDocumentsUserForm =>
  new UploadDocumentsUserForm([], [], [{witnessName: 'witness', caseDocument} as WitnessSection], [], [], [], [], [], [], [], [], [], [], [], []);

const sessionWithSave = () => ({save: jest.fn((callback: () => void) => callback())});

const expectNoValidDocumentsRedirect = (req: AppRequest, res: ReturnType<typeof createMockResponse>, url: string, source: string) => {
  expect(req.session.fileUpload).toBe(JSON.stringify(createNoValidDocumentsError()));
  expect(req.session.fileUploadSource).toBe(source);
  expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, url));
  expect(res.render).not.toHaveBeenCalled();
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

    it.each([
      ['missing', undefined],
      ['has no valid documents', buildAllInvalidDraft()],
    ])('redirects to upload documents with the no valid documents error when the upload draft is %s', async (_variant, defendantDocuments) => {
      const claim = withSelectedDocumentTypes(claimWithRole(CaseRole.DEFENDANT));
      claim.caseProgression.defendantDocuments = defendantDocuments;
      mockGetClaimById.mockResolvedValue(claim);
      mockGetSummarySections.mockReturnValueOnce(null);
      const res = createMockResponse();
      const req = {params: {id: claimId}, query: {lang: 'en'}, cookies: {}, session: sessionWithSave()} as unknown as AppRequest;

      await getHandler(req, res as unknown as Response, jest.fn());

      expect(mockGetSummarySections).toHaveBeenCalledWith(defendantDocuments, claimId, claim.isSmallClaimsTrackDQ, 'en');
      expectNoValidDocumentsRedirect(req, res, CP_UPLOAD_DOCUMENTS_URL, FILE_UPLOAD_SOURCE.CP_UPLOAD_DOCUMENTS);
    });

    it('redirects to type of documents when the claim has no case progression', async () => {
      const claim = claimWithRole(CaseRole.DEFENDANT);
      claim.caseProgression = undefined;
      mockGetClaimById.mockResolvedValue(claim);
      mockGetSummarySections.mockReturnValueOnce(null);
      const res = createMockResponse();
      const req = {params: {id: claimId}, query: {lang: 'en'}, cookies: {}, session: sessionWithSave()} as unknown as AppRequest;

      await getHandler(req, res as unknown as Response, jest.fn());

      expect(mockGetSummarySections).toHaveBeenCalledWith(undefined, claimId, claim.isSmallClaimsTrackDQ, 'en');
      expectNoValidDocumentsRedirect(req, res, TYPES_OF_DOCUMENTS_URL, FILE_UPLOAD_SOURCE.CP_TYPE_OF_DOCUMENTS);
    });

    it('redirects to type of documents when the upload was cancelled and no document types are selected', async () => {
      const claim = claimWithRole(CaseRole.DEFENDANT);
      claim.caseProgression.defendantDocuments = undefined;
      claim.caseProgression.defendantUploadDocuments = new UploadDocuments([new UploadDocumentTypes(false)], [], [], []);
      mockGetClaimById.mockResolvedValue(claim);
      mockGetSummarySections.mockReturnValueOnce(null);
      const res = createMockResponse();
      const req = {params: {id: claimId}, query: {lang: 'en'}, cookies: {}, session: sessionWithSave()} as unknown as AppRequest;

      await getHandler(req, res as unknown as Response, jest.fn());

      expectNoValidDocumentsRedirect(req, res, TYPES_OF_DOCUMENTS_URL, FILE_UPLOAD_SOURCE.CP_TYPE_OF_DOCUMENTS);
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

    it('redirects to upload documents without submitting when the upload draft is missing', async () => {
      const claim = withSelectedDocumentTypes(claimWithRole(CaseRole.DEFENDANT));
      claim.caseProgression.defendantDocuments = undefined;
      mockGetClaimById.mockResolvedValue(claim);
      mockHasValidNewDocuments.mockReturnValueOnce(false);
      const res = createMockResponse();
      const req = {params: {id: claimId}, query: {}, cookies: {}, body: {signed: true}, session: sessionWithSave()} as unknown as AppRequest;

      await postHandler(req, res as unknown as Response, jest.fn());

      expect(mockHasValidNewDocuments).toHaveBeenLastCalledWith(undefined);
      expect(mockSaveUploadedDocuments).not.toHaveBeenCalled();
      expectNoValidDocumentsRedirect(req, res, CP_UPLOAD_DOCUMENTS_URL, FILE_UPLOAD_SOURCE.CP_UPLOAD_DOCUMENTS);
    });

    it('redirects to type of documents without submitting when a claimant claim has no case progression', async () => {
      const claim = claimWithRole(CaseRole.CLAIMANT);
      claim.caseProgression = undefined;
      mockGetClaimById.mockResolvedValue(claim);
      mockHasValidNewDocuments.mockReturnValueOnce(false);
      const res = createMockResponse();
      const req = {params: {id: claimId}, query: {}, cookies: {}, body: {signed: true}, session: sessionWithSave()} as unknown as AppRequest;

      await postHandler(req, res as unknown as Response, jest.fn());

      expect(mockHasValidNewDocuments).toHaveBeenLastCalledWith(undefined);
      expect(mockSaveUploadedDocuments).not.toHaveBeenCalled();
      expectNoValidDocumentsRedirect(req, res, TYPES_OF_DOCUMENTS_URL, FILE_UPLOAD_SOURCE.CP_TYPE_OF_DOCUMENTS);
    });

    it.each([
      ['defendant', CaseRole.DEFENDANT, 'no case document', undefined],
      ['claimant', CaseRole.CLAIMANT, 'no case document', undefined],
      ['defendant', CaseRole.DEFENDANT, 'an empty document link', {documentName: 'test.png', documentLink: {}}],
      ['claimant', CaseRole.CLAIMANT, 'an empty document link', {documentName: 'test.png', documentLink: {}}],
    ])('redirects to upload documents without submitting when the %s upload draft has only documents with %s', async (_party, caseRole, _variant, caseDocument) => {
      const claim = withSelectedDocumentTypes(claimWithRole(caseRole));
      const allInvalidDraft = buildAllInvalidDraft(caseDocument as CaseDocument);
      claim.caseProgression.claimantDocuments = allInvalidDraft;
      claim.caseProgression.defendantDocuments = allInvalidDraft;
      mockGetClaimById.mockResolvedValue(claim);
      mockHasValidNewDocuments.mockImplementationOnce(actualCheckAnswersService.hasValidNewDocuments);
      const res = createMockResponse();
      const req = {
        params: {id: claimId},
        query: {},
        cookies: {},
        body: {signed: true},
        session: {...sessionWithSave(), dashboard: {taskIdHearingUploadDocuments: 'task-1'}},
      } as unknown as AppRequest;

      await postHandler(req, res as unknown as Response, jest.fn());

      expect(mockHasValidNewDocuments).toHaveBeenLastCalledWith(allInvalidDraft);
      expect(mockHasValidNewDocuments).toHaveLastReturnedWith(false);
      expect(mockSaveUploadedDocuments).not.toHaveBeenCalled();
      expect(deleteDraftClaimFromStore).not.toHaveBeenCalled();
      expect(civilServiceMethods.updateTaskStatus).not.toHaveBeenCalled();
      expectNoValidDocumentsRedirect(req, res, CP_UPLOAD_DOCUMENTS_URL, FILE_UPLOAD_SOURCE.CP_UPLOAD_DOCUMENTS);
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
