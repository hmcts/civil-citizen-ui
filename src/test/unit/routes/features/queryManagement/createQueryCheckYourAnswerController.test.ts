import {Response} from 'express';
import createQueryCheckYourAnswerController from '../../../../../main/routes/features/queryManagement/createQueryCheckYourAnswerController';
import {QM_CONFIRMATION_URL, QM_CYA, QM_FOLLOW_UP_CYA, QM_FOLLOW_UP_MESSAGE, QUERY_MANAGEMENT_CREATE_QUERY} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import {getCancelUrl, saveQueryManagement} from 'services/features/queryManagement/queryManagementService';
import {createQuery, getSummarySections} from 'services/features/queryManagement/createQueryCheckYourAnswerService';
import {CivilServiceClient} from 'client/civilServiceClient';
import {Claim} from 'models/claim';
import {QueryManagement} from 'form/models/queryManagement/queryManagement';
import {CreateQuery} from 'models/queryManagement/createQuery';
import {SendFollowUpQuery} from 'models/queryManagement/sendFollowUpQuery';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));
jest.mock('services/features/queryManagement/queryManagementService', () => ({
  getCancelUrl: jest.fn(),
  saveQueryManagement: jest.fn(),
}));
jest.mock('services/features/queryManagement/createQueryCheckYourAnswerService', () => ({
  createQuery: jest.fn().mockResolvedValue(undefined),
  getSummarySections: jest.fn((): unknown[] => []),
}));

describe('Create query check your answers Controller', () => {
  const getHandler = getRouteHandler(createQueryCheckYourAnswerController, 'get');
  const postHandler = getRouteHandler(createQueryCheckYourAnswerController, 'post');
  const viewPath = 'features/queryManagement/createQueryCheckYourAnswer.njk';
  const claimId = '12345';
  const queryId = '67890';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetClaimById = getClaimById as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      params: {id: claimId},
      query: {},
      cookies: {},
      originalUrl: QM_CYA.replace(':id', claimId),
      session: createMockSession({qmShareConfirmed: true}),
    };
    res = createMockResponse();
    next = jest.fn();
    const claim = new Claim();
    claim.queryManagement = new QueryManagement();
    claim.queryManagement.createQuery = new CreateQuery();
    claim.queryManagement.sendFollowUpQuery = new SendFollowUpQuery();
    mockGetClaimById.mockResolvedValue(claim);
    (getCancelUrl as jest.Mock).mockReturnValue('/dashboard');
    (saveQueryManagement as jest.Mock).mockResolvedValue(undefined);
    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValue(new Claim());
  });

  describe('on GET', () => {
    it('should render the check your answers page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(getSummarySections).toHaveBeenCalled();
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        summaryRows: [],
        cancelUrl: '/dashboard',
      }));
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('redis failure');
      mockGetClaimById.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('redirects to create query when the draft is missing', async () => {
      (getSummarySections as jest.Mock).mockReturnValueOnce(null);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, QUERY_MANAGEMENT_CREATE_QUERY));
      expect(res.render).not.toHaveBeenCalled();
    });

    it('redirects to the follow-up form when the follow-up draft is missing', async () => {
      req.params = {id: claimId, queryId};
      req.originalUrl = QM_FOLLOW_UP_CYA.replace(':id', claimId).replace(':queryId', queryId);
      (getSummarySections as jest.Mock).mockReturnValueOnce(null);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdParams(claimId, QM_FOLLOW_UP_MESSAGE).replace(':queryId', queryId),
      );
      expect(res.render).not.toHaveBeenCalled();
    });
  });

  describe('on POST', () => {
    it('should submit the query and redirect to confirmation', async () => {
      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(createQuery).toHaveBeenCalled();
      expect(saveQueryManagement).toHaveBeenCalled();
      expect(req.session.qmShareConfirmed).toBeUndefined();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, QM_CONFIRMATION_URL));
    });

    it('submits a follow-up draft and redirects to confirmation', async () => {
      req.params = {id: claimId, queryId};
      req.originalUrl = QM_FOLLOW_UP_CYA.replace(':id', claimId).replace(':queryId', queryId);

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(createQuery).toHaveBeenCalledWith(expect.any(Claim), expect.any(Claim), req, true);
      expect(saveQueryManagement).toHaveBeenCalledWith(claimId, null, 'sendFollowUpQuery', req);
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, QM_CONFIRMATION_URL));
    });

    it('redirects without submitting when the create-query draft is missing', async () => {
      mockGetClaimById.mockResolvedValue(new Claim());

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, QUERY_MANAGEMENT_CREATE_QUERY));
      expect(CivilServiceClient.prototype.retrieveClaimDetails).not.toHaveBeenCalled();
      expect(createQuery).not.toHaveBeenCalled();
      expect(saveQueryManagement).not.toHaveBeenCalled();
    });

    it('redirects without submitting when the follow-up draft is missing', async () => {
      req.params = {id: claimId, queryId};
      req.originalUrl = QM_FOLLOW_UP_CYA.replace(':id', claimId).replace(':queryId', queryId);
      const claim = new Claim();
      claim.queryManagement = new QueryManagement();
      mockGetClaimById.mockResolvedValue(claim);

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdParams(claimId, QM_FOLLOW_UP_MESSAGE).replace(':queryId', queryId),
      );
      expect(CivilServiceClient.prototype.retrieveClaimDetails).not.toHaveBeenCalled();
      expect(createQuery).not.toHaveBeenCalled();
      expect(saveQueryManagement).not.toHaveBeenCalled();
    });
  });
});
