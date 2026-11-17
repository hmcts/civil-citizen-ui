import {NextFunction, Response} from 'express';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {YesNo} from 'form/models/yesNo';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {CaseRole} from 'form/models/caseRoles';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import mediationCancelUploadController from 'routes/features/mediation/uploadDocuments/mediationCancelUploadController';
import {
  DASHBOARD_CLAIMANT_URL,
  DEFENDANT_SUMMARY_URL,
  MEDIATION_UPLOAD_DOCUMENTS_CANCEL,
} from 'routes/urls';
import {cancelMediationDocumentUpload} from 'services/features/mediation/uploadDocuments/mediationCancelUploadService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService', () => ({
  generateRedisKey: jest.fn(),
  getCaseDataFromStore: jest.fn(),
}));

jest.mock('services/features/mediation/uploadDocuments/mediationCancelUploadService', () => {
  const actual = jest.requireActual('services/features/mediation/uploadDocuments/mediationCancelUploadService');
  return {
    ...actual,
    cancelMediationDocumentUpload: jest.fn(),
  };
});

const mockGenerateRedisKey = generateRedisKey as jest.Mock;
const mockGetCaseData = getCaseDataFromStore as jest.Mock;
const mockCancelUpload = cancelMediationDocumentUpload as jest.Mock;

const claimId = '1111';
const redisKey = '12345';
const viewPath = 'features/mediation/uploadDocuments/cancel-your-upload';

const claimWithAmount = (): Claim => {
  const claim = new Claim();
  claim.totalClaimAmount = 1000;
  return claim;
};

const invoke = async (method: 'get' | 'post', overrides: Partial<AppRequest> = {}) => {
  const res = createMockResponse();
  const next = jest.fn() as NextFunction;
  const req = {
    params: {id: claimId},
    body: {},
    query: {},
    cookies: {},
    session: createMockSession({user: {id: 'user-1'}}),
    ...overrides,
  };
  await getRouteHandler(mediationCancelUploadController, method, MEDIATION_UPLOAD_DOCUMENTS_CANCEL)(
    req as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

const renderedForm = (res: ReturnType<typeof createMockResponse>) =>
  (res.render as jest.Mock).mock.calls[0][1].form;

describe('Mediation Cancel Document Upload Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateRedisKey.mockReturnValue(redisKey);
    mockGetCaseData.mockResolvedValue(claimWithAmount());
    mockCancelUpload.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render page successfully', async () => {
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        cancelYourUploadContents: expect.any(Array),
      }));
    });

    it('should call next when loading the cancel page fails', async () => {
      const error = new Error('redis failure');
      mockGetCaseData.mockRejectedValue(error);

      const {next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should redirect to claimant dashboard when YES is selected and user is claimant', async () => {
      const claim = claimWithAmount();
      claim.caseRole = CaseRole.CLAIMANT;
      mockGetCaseData.mockResolvedValue(claim);

      const {res} = await invoke('post', {body: {option: YesNo.YES}});

      expect(mockCancelUpload).toHaveBeenCalledWith(redisKey, claim, 'user-1');
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL));
    });

    it('should redirect to defendant summary when YES is selected and user is defendant', async () => {
      const {res} = await invoke('post', {body: {option: YesNo.YES}});

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL));
    });

    it('should redirect to the upload documents page when NO is selected and there is no previous url', async () => {
      const {res} = await invoke('post', {body: {option: YesNo.NO}});

      expect(mockCancelUpload).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(`/case/${claimId}/mediation/upload-documents`);
    });

    it('should show error when no option is selected', async () => {
      const {res, next} = await invoke('post', {body: {option: ''}});

      const form = renderedForm(res);
      expect(form.hasErrors()).toBe(true);
      expect(form.errorFor('option')).toBe('ERRORS.VALID_YES_NO_OPTION_NAC_YDW');
      expect(res.redirect).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when cancelling the upload fails', async () => {
      const error = new Error('redis failure');
      mockGetCaseData.mockRejectedValue(error);

      const {next} = await invoke('post', {body: {option: YesNo.YES}});

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
