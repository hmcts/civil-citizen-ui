import {Response} from 'express';
import {CaseRole} from 'form/models/caseRoles';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {isCuiGaNroEnabled} from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {getClaimById} from 'modules/utilityService';
import {
  deleteUntickedDocumentsFromStore,
  getDocuments,
  saveCaseProgression,
} from 'services/features/caseProgression/caseProgressionService';
import {UploadDocuments} from 'models/caseProgression/uploadDocumentsType';
import typeOfDocumentsController from 'routes/features/caseProgression/typeOfDocumentsController';
import {CP_UPLOAD_DOCUMENTS_URL, TYPES_OF_DOCUMENTS_URL, UPLOAD_YOUR_DOCUMENTS_URL} from 'routes/urls';
import {createMockResponse, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));

jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient', () => ({
  isCuiGaNroEnabled: jest.fn(),
}));

jest.mock('services/features/caseProgression/caseProgressionService', () => {
  const actual = jest.requireActual('services/features/caseProgression/caseProgressionService');
  return {
    ...actual,
    getDocuments: jest.fn(),
    saveCaseProgression: jest.fn(),
    deleteUntickedDocumentsFromStore: jest.fn(),
  };
});

const mockGetClaimById = getClaimById as jest.Mock;
const mockIsCuiGaNroEnabled = isCuiGaNroEnabled as jest.Mock;
const mockGetDocuments = getDocuments as jest.Mock;
const mockSaveCaseProgression = saveCaseProgression as jest.Mock;
const mockDeleteUnticked = deleteUntickedDocumentsFromStore as jest.Mock;

const claimId = 'aaa';
const viewPath = 'features/caseProgression/typeOfDocuments';

const claimWithRole = (caseRole: CaseRole): Claim => {
  const claim = new Claim();
  claim.caseRole = caseRole;
  claim.totalClaimAmount = 15000;
  claim.applicant1 = new Party();
  return claim;
};

describe('Upload document- type of documents controller', () => {
  const getHandler = getRouteHandler(typeOfDocumentsController, 'get', TYPES_OF_DOCUMENTS_URL);
  const postHandler = getRouteHandler(typeOfDocumentsController, 'post', TYPES_OF_DOCUMENTS_URL);

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsCuiGaNroEnabled.mockResolvedValue(true);
    mockGetDocuments.mockResolvedValue(new UploadDocuments());
    mockSaveCaseProgression.mockResolvedValue(undefined);
    mockDeleteUnticked.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('renders the page for a claimant', async () => {
      const claim = claimWithRole(CaseRole.CLAIMANT);
      mockGetClaimById.mockResolvedValue(claim);
      const res = createMockResponse();
      const req = {params: {id: claimId}, originalUrl: '/type-of-documents', session: {}} as unknown as AppRequest;

      await getHandler(req, res as unknown as Response, jest.fn());

      expect(req.session.previousUrl).toBe('/type-of-documents');
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.anything(),
        isFastTrack: true,
        isGaNroEnabled: true,
        backLinkUrl: constructResponseUrlWithIdParams(claimId, UPLOAD_YOUR_DOCUMENTS_URL),
      }));
    });

    it('renders the page for a defendant', async () => {
      mockGetClaimById.mockResolvedValue(claimWithRole(CaseRole.DEFENDANT));
      const res = createMockResponse();

      await getHandler(
        {params: {id: claimId}, originalUrl: '/type-of-documents', session: {}} as unknown as AppRequest,
        res as unknown as Response,
        jest.fn(),
      );

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        isFastTrack: true,
      }));
      const renderedClaimId = res.render.mock.calls[0][1].claimId as string;
      expect(renderedClaimId.replace(/\s/g, '')).toBe(claimId);
    });

    it('calls next when the claim cannot be loaded', async () => {
      const error = new Error('redis failure');
      mockGetDocuments.mockRejectedValue(error);
      const next = jest.fn();

      await getHandler(
        {params: {id: claimId}, session: {}} as unknown as AppRequest,
        createMockResponse() as unknown as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('re-renders when no document type is selected', async () => {
      mockGetClaimById.mockResolvedValue(claimWithRole(CaseRole.CLAIMANT));
      const res = createMockResponse();

      await postHandler(
        {params: {id: claimId}, body: {}} as unknown as AppRequest,
        res as unknown as Response,
        jest.fn(),
      );

      expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveCaseProgression).not.toHaveBeenCalled();
    });

    it('saves claimant document types and redirects to upload documents', async () => {
      mockGetClaimById.mockResolvedValue(claimWithRole(CaseRole.CLAIMANT));
      const res = createMockResponse();
      const req = {params: {id: claimId}, body: {documents: 'documents', list: 'list'}} as unknown as AppRequest;

      await postHandler(req, res as unknown as Response, jest.fn());

      expect(mockSaveCaseProgression).toHaveBeenCalledWith(req, expect.anything(), 'claimantUploadDocuments');
      expect(mockDeleteUnticked).toHaveBeenCalledWith(req, true);
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CP_UPLOAD_DOCUMENTS_URL));
    });

    it('saves defendant document types and redirects to upload documents', async () => {
      mockGetClaimById.mockResolvedValue(claimWithRole(CaseRole.DEFENDANT));
      const res = createMockResponse();
      const req = {params: {id: claimId}, body: {documents: 'documents', list: 'list'}} as unknown as AppRequest;

      await postHandler(req, res as unknown as Response, jest.fn());

      expect(mockSaveCaseProgression).toHaveBeenCalledWith(req, expect.anything(), 'defendantUploadDocuments');
      expect(mockDeleteUnticked).toHaveBeenCalledWith(req, false);
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CP_UPLOAD_DOCUMENTS_URL));
    });
  });
});
