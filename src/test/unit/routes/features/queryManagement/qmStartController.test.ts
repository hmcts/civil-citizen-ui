import {Request, Response} from 'express';
import qmStartController from '../../../../../main/routes/features/queryManagement/qmStartController';
import {
  APPLICATION_TYPE_URL,
  GA_SUBMIT_OFFLINE,
  QM_FOLLOW_UP_URL,
  QM_SHARE_QUERY_CONFIRMATION,
  QM_WHAT_DO_YOU_WANT_TO_DO_URL,
} from 'routes/urls';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {
  deleteQueryManagement,
  getCancelUrl,
  getQueryManagement,
  saveQueryManagement,
} from 'services/features/queryManagement/queryManagementService';
import {QueryManagement, WhatToDoTypeOption} from 'form/models/queryManagement/queryManagement';
import {getGaRedirectionUrl} from 'services/commons/generalApplicationHelper';
import {CivilServiceClient} from 'client/civilServiceClient';
import {Claim} from 'models/claim';
import {LinKFromValues} from 'models/generalApplication/applicationType';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('services/features/queryManagement/queryManagementService');
jest.mock('services/commons/generalApplicationHelper');
jest.mock('modules/draft-store/draftStoreService');

describe('Query management start Controller', () => {
  const getHandler = getRouteHandler(qmStartController, 'get');
  const postHandler = getRouteHandler(qmStartController, 'post');
  const viewPath = 'features/queryManagement/qm-questions-template.njk';
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetQueryManagement = getQueryManagement as jest.Mock;
  const mockSaveQueryManagement = saveQueryManagement as jest.Mock;
  const mockDeleteQueryManagement = deleteQueryManagement as jest.Mock;
  const mockGenerateRedisKey = draftStoreService.generateRedisKey as jest.Mock;
  const mockGetGaRedirectionUrl = getGaRedirectionUrl as jest.Mock;

  beforeEach(() => {
    req = {params: {id: claimId}, body: {}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    mockGenerateRedisKey.mockReturnValue(claimId);
    mockGetQueryManagement.mockResolvedValue(new QueryManagement());
    mockSaveQueryManagement.mockResolvedValue(undefined);
    mockDeleteQueryManagement.mockResolvedValue(undefined);
    (getCancelUrl as jest.Mock).mockReturnValue('/dashboard');
    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValue(new Claim());
  });

  describe('on GET', () => {
    it('should render the start page', async () => {
      await getHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.QM.WHAT_DO_YOU_WANT_TODO_TITLE',
      }));
      expect(mockDeleteQueryManagement).not.toHaveBeenCalled();
    });

    it('should clear previous QM data when linkFrom=start', async () => {
      req.query = {linkFrom: 'start'};

      await getHandler(req as Request, res as unknown as Response, next);

      expect(mockDeleteQueryManagement).toHaveBeenCalled();
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.anything());
    });

    it('should call next when loading fails', async () => {
      const error = new Error('redis failure');
      mockGetQueryManagement.mockRejectedValue(error);

      await getHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when no option is selected', async () => {
      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.anything());
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveQueryManagement).not.toHaveBeenCalled();
    });

    it('should redirect using the GA helper when CHANGE_CASE is selected', async () => {
      mockGetGaRedirectionUrl.mockResolvedValue(APPLICATION_TYPE_URL + `?linkFrom=${LinKFromValues.start}`);
      req.body = {option: WhatToDoTypeOption.CHANGE_CASE};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdParams(claimId, APPLICATION_TYPE_URL + `?linkFrom=${LinKFromValues.start}`),
      );
    });

    it('should redirect to GA offline when the helper returns that URL', async () => {
      mockGetGaRedirectionUrl.mockResolvedValue(GA_SUBMIT_OFFLINE);
      req.body = {option: WhatToDoTypeOption.CHANGE_CASE};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, GA_SUBMIT_OFFLINE));
    });

    it('should redirect to share query confirmation for GET_SUPPORT', async () => {
      mockGetGaRedirectionUrl.mockResolvedValue('/ga');
      req.body = {option: WhatToDoTypeOption.GET_SUPPORT};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, QM_SHARE_QUERY_CONFIRMATION));
    });

    it('should redirect to follow up for FOLLOW_UP', async () => {
      mockGetGaRedirectionUrl.mockResolvedValue('/ga');
      req.body = {option: WhatToDoTypeOption.FOLLOW_UP};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, QM_FOLLOW_UP_URL));
    });

    it('should redirect to share query confirmation for SOMETHING_ELSE', async () => {
      mockGetGaRedirectionUrl.mockResolvedValue('/ga');
      req.body = {option: WhatToDoTypeOption.SOMETHING_ELSE};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, QM_SHARE_QUERY_CONFIRMATION));
    });

    it('should redirect to what to do for MANAGE_HEARING', async () => {
      mockGetGaRedirectionUrl.mockResolvedValue('/ga');
      req.body = {option: WhatToDoTypeOption.MANAGE_HEARING};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdParams(claimId, QM_WHAT_DO_YOU_WANT_TO_DO_URL.replace(':qmType', WhatToDoTypeOption.MANAGE_HEARING)),
      );
    });

    it('should call next when saving fails', async () => {
      const error = new Error('redis failure');
      mockSaveQueryManagement.mockRejectedValue(error);
      req.body = {option: WhatToDoTypeOption.CHANGE_CASE};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
