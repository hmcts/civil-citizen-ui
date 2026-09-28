import {Response} from 'express';
import createQueryCheckYourAnswerController from '../../../../../main/routes/features/queryManagement/createQueryCheckYourAnswerController';
import {QM_CONFIRMATION_URL, QM_CYA} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import {getCancelUrl, saveQueryManagement} from 'services/features/queryManagement/queryManagementService';
import {createQuery, getSummarySections} from 'services/features/queryManagement/createQueryCheckYourAnswerService';
import {CivilServiceClient} from 'client/civilServiceClient';
import {Claim} from 'models/claim';
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
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetClaimById = getClaimById as jest.Mock;

  beforeEach(() => {
    req = {
      params: {id: claimId},
      query: {},
      cookies: {},
      originalUrl: QM_CYA.replace(':id', claimId),
      session: createMockSession({qmShareConfirmed: true}),
    };
    res = createMockResponse();
    next = jest.fn();
    mockGetClaimById.mockResolvedValue(new Claim());
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
  });

  describe('on POST', () => {
    it('should submit the query and redirect to confirmation', async () => {
      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(createQuery).toHaveBeenCalled();
      expect(saveQueryManagement).toHaveBeenCalled();
      expect(req.session.qmShareConfirmed).toBeUndefined();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, QM_CONFIRMATION_URL));
    });
  });
});
