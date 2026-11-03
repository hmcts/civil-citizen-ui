import {NextFunction, Response} from 'express';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {deleteDraftClaimFromStore, generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import {Party} from 'models/party';
import {UploadDocuments} from 'models/mediation/uploadDocuments/uploadDocuments';
import mediationDocumentUploadCheckAnswerController from 'routes/features/mediation/uploadDocuments/checkAnswersController';
import {MEDIATION_UPLOAD_DOCUMENTS_CHECK_AND_SEND, MEDIATION_UPLOAD_DOCUMENTS_CONFIRMATION} from 'routes/urls';
import {saveMediationUploadedDocuments} from 'services/features/mediation/uploadDocuments/mediationCheckAnswersService';
import {getTypeOfDocuments} from '../../../../../utils/mocks/Mediation/uploadFilesMediationMocks';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService', () => ({
  generateRedisKey: jest.fn(),
  getCaseDataFromStore: jest.fn(),
  deleteDraftClaimFromStore: jest.fn(),
}));

jest.mock('services/features/mediation/uploadDocuments/mediationCheckAnswersService', () => ({
  saveMediationUploadedDocuments: jest.fn(),
}));

const mockGenerateRedisKey = generateRedisKey as jest.Mock;
const mockGetCaseData = getCaseDataFromStore as jest.Mock;
const mockDeleteDraftClaim = deleteDraftClaimFromStore as jest.Mock;
const mockSaveMediationUploadedDocuments = saveMediationUploadedDocuments as jest.Mock;

const claimId = '1111';
const redisKey = '12345';
const viewPath = 'features/mediation/uploadDocuments/check-answers';

const claimWithDocuments = (): Claim => {
  const claim = new Claim();
  claim.respondent1 = new Party();
  claim.respondent1.partyDetails = {firstName: 'John', lastName: 'Smith'};
  claim.mediationUploadDocuments = new UploadDocuments(getTypeOfDocuments());
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
  await getRouteHandler(mediationDocumentUploadCheckAnswerController, method, MEDIATION_UPLOAD_DOCUMENTS_CHECK_AND_SEND)(
    req as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

const renderedForm = (res: ReturnType<typeof createMockResponse>) =>
  (res.render as jest.Mock).mock.calls[0][1].form;

describe('Mediation check and send Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateRedisKey.mockReturnValue(redisKey);
    mockGetCaseData.mockResolvedValue(claimWithDocuments());
    mockDeleteDraftClaim.mockResolvedValue(undefined);
    mockSaveMediationUploadedDocuments.mockResolvedValue(new Claim());
  });

  describe('on GET', () => {
    it('should open Mediation check your answers page', async () => {
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        topPageContents: expect.any(Array),
        summarySections: expect.anything(),
        bottomPageContents: expect.any(Array),
      }));
    });

    it('should call next when loading check your answers fails', async () => {
      const error = new Error('redis failure');
      mockGetCaseData.mockRejectedValue(error);

      const {next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should redirect to the confirmation page', async () => {
      const {res} = await invoke('post', {body: {signed: true}});

      expect(mockSaveMediationUploadedDocuments).toHaveBeenCalledWith(claimId, expect.any(UploadDocuments), expect.anything());
      expect(mockDeleteDraftClaim).toHaveBeenCalledWith(redisKey);
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, MEDIATION_UPLOAD_DOCUMENTS_CONFIRMATION));
    });

    it('should Valid signed is false', async () => {
      const {res} = await invoke('post');

      const form = renderedForm(res);
      expect(form.hasErrors()).toBe(true);
      expect(form.errorFor('signed')).toBe('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.CHECK_YOUR_ANSWERS_VALIDATION');
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should call next when submitting the documents fails', async () => {
      const error = new Error('redis failure');
      mockSaveMediationUploadedDocuments.mockRejectedValue(error);

      const {next} = await invoke('post', {body: {signed: true}});

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
