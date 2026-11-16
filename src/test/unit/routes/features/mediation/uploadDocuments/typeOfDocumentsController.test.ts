import {NextFunction, Response} from 'express';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import {Party} from 'models/party';
import {TypeOfMediationDocuments, UploadDocuments} from 'models/mediation/uploadDocuments/uploadDocuments';
import mediationTypeOfDocumentsController from 'routes/features/mediation/uploadDocuments/typeOfDocumentsController';
import {MEDIATION_TYPE_OF_DOCUMENTS, MEDIATION_UPLOAD_DOCUMENTS} from 'routes/urls';
import {saveUploadDocument} from 'services/features/mediation/uploadDocuments/uploadDocumentsService';
import {getTypeOfDocuments} from '../../../../../utils/mocks/Mediation/uploadFilesMediationMocks';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService', () => ({
  generateRedisKey: jest.fn(),
  getCaseDataFromStore: jest.fn(),
}));

jest.mock('services/features/mediation/uploadDocuments/uploadDocumentsService', () => {
  const actual = jest.requireActual('services/features/mediation/uploadDocuments/uploadDocumentsService');
  return {
    ...actual,
    saveUploadDocument: jest.fn(),
  };
});

const mockGenerateRedisKey = generateRedisKey as jest.Mock;
const mockGetCaseData = getCaseDataFromStore as jest.Mock;
const mockSaveUploadDocument = saveUploadDocument as jest.Mock;

const claimId = '1111';
const redisKey = '12345';
const viewPath = 'features/mediation/uploadDocuments/typeOfDocuments';

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
    originalUrl: MEDIATION_TYPE_OF_DOCUMENTS,
    ...overrides,
  };
  await getRouteHandler(mediationTypeOfDocumentsController, method, MEDIATION_TYPE_OF_DOCUMENTS)(
    req as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

const renderedForm = (res: ReturnType<typeof createMockResponse>) =>
  (res.render as jest.Mock).mock.calls[0][1].form;

describe('Mediation Type Of Document Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateRedisKey.mockReturnValue(redisKey);
    mockGetCaseData.mockResolvedValue(claimWithDocuments());
    mockSaveUploadDocument.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should open Mediation type of document page', async () => {
      const {res} = await invoke('get');

      const form = renderedForm(res);
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.UPLOAD_YOUR_DOCUMENTS.TITLE',
      }));
      expect(form.model.typeOfDocuments.some((item: {checked: boolean}) => item.checked)).toBe(true);
    });

    it('should open Mediation type of document page when uploadDocument is missing', async () => {
      mockGetCaseData.mockResolvedValue(new Claim());

      const {res} = await invoke('get');

      const form = renderedForm(res);
      expect(form.model.typeOfDocuments.every((item: {checked: boolean}) => !item.checked)).toBe(true);
    });

    it('should call next when loading the type of documents fails', async () => {
      const error = new Error('redis failure');
      mockGetCaseData.mockRejectedValue(error);

      const {next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should redirect to the mediation Upload documents page', async () => {
      const {res} = await invoke('post', {body: {typeOfDocuments: TypeOfMediationDocuments.YOUR_STATEMENT}});

      expect(mockSaveUploadDocument).toHaveBeenCalledWith(redisKey, expect.any(Array), 'typeOfDocuments');
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, MEDIATION_UPLOAD_DOCUMENTS));
    });

    it('should Valid checkbox when they are not checked', async () => {
      const {res} = await invoke('post', {body: {typeOfDocuments: ''}});

      const form = renderedForm(res);
      expect(form.hasErrors()).toBe(true);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should call next when saving the type of documents fails', async () => {
      const error = new Error('redis failure');
      mockGetCaseData.mockRejectedValue(error);

      const {next} = await invoke('post', {body: {typeOfDocuments: TypeOfMediationDocuments.YOUR_STATEMENT}});

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
