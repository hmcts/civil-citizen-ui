import {NextFunction, Response} from 'express';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {getClaimById} from 'modules/utilityService';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import {Party} from 'models/party';
import startMediationUploadDocumentsController from 'routes/features/mediation/uploadDocuments/startMediationUploadDocumentsController';
import {START_MEDIATION_UPLOAD_FILES} from 'routes/urls';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));

const mockGetClaimById = getClaimById as jest.Mock;

const claimId = '1111';
const viewPath = 'features/common/static-page';

const invoke = async () => {
  const res = createMockResponse();
  const next = jest.fn() as NextFunction;
  const req = {
    params: {id: claimId},
    body: {},
    query: {},
    cookies: {},
  };
  await getRouteHandler(startMediationUploadDocumentsController, 'get', START_MEDIATION_UPLOAD_FILES)(
    req as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

describe('Mediation Start Upload Documents Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const claim = new Claim();
    claim.respondent1 = new Party();
    claim.respondent1.partyDetails = {firstName: 'John', lastName: 'Smith'};
    mockGetClaimById.mockResolvedValue(claim);
  });

  describe('on GET', () => {
    it('should return Start Mediation Upload Documents page', async () => {
      const {res} = await invoke();

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.MEDIATION.START_PAGE.PAGE_TITLE',
        contents: expect.any(Array),
      }));
      expect(mockGetClaimById).toHaveBeenCalledWith(claimId, expect.anything(), true);
      expect((res.render as jest.Mock).mock.calls[0][1].contents.some(
        (section: {data?: {variables?: {claimId?: string}}}) => section.data?.variables?.claimId === caseNumberPrettify(claimId),
      )).toBe(true);
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('redis failure');
      mockGetClaimById.mockRejectedValue(error);

      const {next} = await invoke();

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
