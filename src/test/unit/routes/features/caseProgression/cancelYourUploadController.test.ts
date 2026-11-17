import {Response} from 'express';
import {CivilServiceClient} from 'client/civilServiceClient';
import {CaseRole} from 'form/models/caseRoles';
import {YesNo} from 'form/models/yesNo';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {cancelDocumentUpload} from 'services/features/caseProgression/cancelDocumentUpload';
import cancelYourUploadController from 'routes/features/caseProgression/cancelYourUploadController';
import {CP_EVIDENCE_UPLOAD_CANCEL, DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL} from 'routes/urls';
import {createMockResponse, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('client/civilServiceClient', () => {
  const methods = {retrieveClaimDetails: jest.fn()};
  return {CivilServiceClient: jest.fn(() => methods)};
});

jest.mock('modules/draft-store/draftStoreService', () => ({
  generateRedisKey: jest.fn(() => 'redis-key'),
}));

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));

jest.mock('services/features/caseProgression/cancelDocumentUpload', () => ({
  cancelDocumentUpload: jest.fn(),
  getCancelYourUpload: jest.fn(() => [{section: 'cancel'}]),
}));

const civilServiceMethods = new CivilServiceClient('http://localhost') as unknown as {
  retrieveClaimDetails: jest.Mock;
};
const mockGetClaimById = getClaimById as jest.Mock;
const mockCancelDocumentUpload = cancelDocumentUpload as jest.Mock;

const claimId = '1645882162449409';
const viewPath = 'features/caseProgression/cancel-your-upload';

const claimWithRole = (caseRole: CaseRole): Claim => {
  const claim = new Claim();
  claim.caseRole = caseRole;
  claim.totalClaimAmount = 1000;
  claim.applicant1 = new Party();
  return claim;
};

describe('Cancel document upload', () => {
  const getHandler = getRouteHandler(cancelYourUploadController, 'get', CP_EVIDENCE_UPLOAD_CANCEL);
  const postHandler = getRouteHandler(cancelYourUploadController, 'post', CP_EVIDENCE_UPLOAD_CANCEL);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('on GET', () => {
    it('renders the cancel page', async () => {
      const claim = claimWithRole(CaseRole.CLAIMANT);
      civilServiceMethods.retrieveClaimDetails.mockResolvedValue(claim);
      const res = createMockResponse();

      await getHandler(
        {params: {id: claimId}} as unknown as AppRequest,
        res as unknown as Response,
        jest.fn(),
      );

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.anything(),
        cancelYourUploadContents: [{section: 'cancel'}],
      }));
    });

    it('calls next when the claim cannot be loaded', async () => {
      const error = new Error('Test error');
      civilServiceMethods.retrieveClaimDetails.mockRejectedValue(error);
      const next = jest.fn();

      await getHandler(
        {params: {id: claimId}} as unknown as AppRequest,
        createMockResponse() as unknown as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('re-renders when neither Yes nor No is selected', async () => {
      mockGetClaimById.mockResolvedValue(claimWithRole(CaseRole.CLAIMANT));
      const res = createMockResponse();

      await postHandler(
        {params: {id: claimId}, body: {}, session: {}} as unknown as AppRequest,
        res as unknown as Response,
        jest.fn(),
      );

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.anything(),
      }));
      expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockCancelDocumentUpload).not.toHaveBeenCalled();
    });

    it('redirects a claimant to the claimant dashboard when Yes is selected', async () => {
      mockGetClaimById.mockResolvedValue(claimWithRole(CaseRole.CLAIMANT));
      const res = createMockResponse();

      await postHandler(
        {params: {id: claimId}, body: {option: YesNo.YES}, session: {}} as unknown as AppRequest,
        res as unknown as Response,
        jest.fn(),
      );

      expect(mockCancelDocumentUpload).toHaveBeenCalledWith('redis-key');
      expect(generateRedisKey).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL));
    });

    it('redirects a defendant to the defendant summary when Yes is selected', async () => {
      mockGetClaimById.mockResolvedValue(claimWithRole(CaseRole.DEFENDANT));
      const res = createMockResponse();

      await postHandler(
        {params: {id: claimId}, body: {option: YesNo.YES}, session: {}} as unknown as AppRequest,
        res as unknown as Response,
        jest.fn(),
      );

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL));
    });

    it('redirects back to the previous page when No is selected', async () => {
      const previousUrl = '/case/1645882162449409/case-progression/upload-documents';
      mockGetClaimById.mockResolvedValue(claimWithRole(CaseRole.CLAIMANT));
      const res = createMockResponse();

      await postHandler(
        {params: {id: claimId}, body: {option: YesNo.NO}, session: {previousUrl}} as unknown as AppRequest,
        res as unknown as Response,
        jest.fn(),
      );

      expect(mockCancelDocumentUpload).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(previousUrl);
    });
  });
});
