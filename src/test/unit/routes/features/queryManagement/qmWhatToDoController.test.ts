import {Request, Response} from 'express';
import qmWhatToDoController from '../../../../../main/routes/features/queryManagement/qmWhatToDoController';
import {QM_INFORMATION_URL, QM_SHARE_QUERY_CONFIRMATION} from 'routes/urls';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {
  getCancelUrl,
  getCaption,
  getQueryManagement,
  saveQueryManagement,
} from 'services/features/queryManagement/queryManagementService';
import {QueryManagement, QualifyingQuestionTypeOption, WhatToDoTypeOption} from 'form/models/queryManagement/queryManagement';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('services/features/queryManagement/queryManagementService');
jest.mock('modules/draft-store/draftStoreService');

describe('Query management what to do Controller', () => {
  const getHandler = getRouteHandler(qmWhatToDoController, 'get');
  const postHandler = getRouteHandler(qmWhatToDoController, 'post');
  const viewPath = 'features/queryManagement/qm-questions-template.njk';
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetQueryManagement = getQueryManagement as jest.Mock;
  const mockSaveQueryManagement = saveQueryManagement as jest.Mock;

  beforeEach(() => {
    req = {
      params: {id: claimId, qmType: WhatToDoTypeOption.MANAGE_HEARING},
      body: {},
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    (draftStoreService.generateRedisKey as jest.Mock).mockReturnValue(claimId);
    mockGetQueryManagement.mockResolvedValue(new QueryManagement());
    mockSaveQueryManagement.mockResolvedValue(undefined);
    (getCancelUrl as jest.Mock).mockReturnValue('/dashboard');
    (getCaption as jest.Mock).mockReturnValue('caption');
  });

  describe('on GET', () => {
    it('should render the qualifying question page', async () => {
      await getHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.anything()}));
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
    });

    it('should save and redirect to information when an option is selected', async () => {
      req.body = {option: QualifyingQuestionTypeOption.CHANGE_THE_HEARING_DATE};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveQueryManagement).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdParams(
          claimId,
          QM_INFORMATION_URL.replace(':qmType', WhatToDoTypeOption.MANAGE_HEARING).replace(':qmQualifyOption', QualifyingQuestionTypeOption.CHANGE_THE_HEARING_DATE),
        ),
      );
    });

    it('should redirect to share query confirmation for something else', async () => {
      req.body = {option: QualifyingQuestionTypeOption.MANAGE_HEARING_SOMETHING_ELSE};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, QM_SHARE_QUERY_CONFIRMATION));
    });
  });
});
