import {Response} from 'express';
import whyDoYouDisagreeController from '../../../../../../../main/routes/features/response/admission/partialAdmission/whyDoYouDisagreeController';
import {CITIZEN_TIMELINE_URL} from 'routes/urls';
import {WhyDoYouDisagree} from 'form/models/admission/partialAdmission/whyDoYouDisagree';
import {WhyDoYouDisagreeForm} from 'models/whyDoYouDisagreeForm';
import {ResponseType} from 'form/models/responseType';
import {getWhyDoYouDisagreeForm, saveWhyDoYouDisagreeData} from 'services/features/response/admission/whyDoYouDisagreeService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('services/features/response/admission/whyDoYouDisagreeService');

describe('Why do you disagree Controller', () => {
  const getHandler = getRouteHandler(whyDoYouDisagreeController, 'get');
  const postHandler = getRouteHandler(whyDoYouDisagreeController, 'post');
  const viewPath = 'features/response/admission/why-do-you-disagree';
  const claimId = '12345';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGenerateRedisKey = generateRedisKey as jest.Mock;
  const mockGetWhyDoYouDisagreeForm = getWhyDoYouDisagreeForm as jest.Mock;
  const mockSaveWhyDoYouDisagreeData = saveWhyDoYouDisagreeData as jest.Mock;
  const renderedForm = () => (res.render as jest.Mock).mock.calls[0][1].form;

  const emptyForm = (): WhyDoYouDisagreeForm => {
    const form = new WhyDoYouDisagreeForm();
    form.claimAmount = 110;
    form.whyDoYouDisagree = new WhyDoYouDisagree();
    return form;
  };

  beforeEach(() => {
    req = {
      params: {id: claimId},
      session: createMockSession({user: {id: 'user-id'}}),
      body: {},
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    mockGenerateRedisKey.mockReturnValue(claimId);
    mockGetWhyDoYouDisagreeForm.mockResolvedValue(emptyForm());
    mockSaveWhyDoYouDisagreeData.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render why do you disagree page successfully', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
        claimAmount: 110,
      }));
    });

    it('should call next when loading the form fails', async () => {
      const error = new Error('error');
      mockGetWhyDoYouDisagreeForm.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    beforeEach(async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);
      res = createMockResponse();
      next = jest.fn();
    });

    it('should re-render when text is not filled', async () => {
      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
        claimAmount: 110,
      }));
      expect(renderedForm().hasErrors()).toBe(true);
      expect(renderedForm().errorFor('text')).toBe('ERRORS.VALID_DISAGREE_REASON_REQUIRED');
    });

    it('should redirect to timeline when text is filled', async () => {
      req.body = {text: 'Test'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveWhyDoYouDisagreeData).toHaveBeenCalledWith(claimId, expect.any(WhyDoYouDisagree), ResponseType.PART_ADMISSION);
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_TIMELINE_URL));
    });

    it('should call next when save fails', async () => {
      const error = new Error('error');
      mockSaveWhyDoYouDisagreeData.mockRejectedValue(error);
      req.body = {text: 'Test'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
