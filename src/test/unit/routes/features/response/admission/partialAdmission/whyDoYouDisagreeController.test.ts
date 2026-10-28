import {Request, Response} from 'express';
import whyDoYouDisagreeController from '../../../../../../../main/routes/features/response/admission/partialAdmission/whyDoYouDisagreeController';
import {
  getWhyDoYouDisagreeForm,
  saveWhyDoYouDisagreeData,
} from 'services/features/response/admission/whyDoYouDisagreeService';
import {WhyDoYouDisagree} from 'form/models/admission/partialAdmission/whyDoYouDisagree';
import {WhyDoYouDisagreeForm} from 'models/whyDoYouDisagreeForm';
import {CITIZEN_TIMELINE_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {ResponseType} from 'form/models/responseType';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('services/features/response/admission/whyDoYouDisagreeService');

describe('Why do you disagree Controller', () => {
  const getHandler = getRouteHandler(whyDoYouDisagreeController, 'get');
  const postHandler = getRouteHandler(whyDoYouDisagreeController, 'post');
  const viewPath = 'features/response/admission/why-do-you-disagree';
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetWhyDoYouDisagreeForm = getWhyDoYouDisagreeForm as jest.Mock;
  const mockSaveWhyDoYouDisagreeData = saveWhyDoYouDisagreeData as jest.Mock;

  const stubForm = (): WhyDoYouDisagreeForm => {
    const form = new WhyDoYouDisagreeForm();
    form.claimAmount = 110;
    form.whyDoYouDisagree = new WhyDoYouDisagree();
    return form;
  };

  beforeEach(async () => {
    req = {params: {id: claimId}, body: {}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    jest.clearAllMocks();
    mockGetWhyDoYouDisagreeForm.mockResolvedValue(stubForm());
    mockSaveWhyDoYouDisagreeData.mockResolvedValue(undefined);
    // Prime module-level claimAmount used by POST
    await getHandler(req as Request, res as unknown as Response, next);
    res = createMockResponse();
    next = jest.fn();
  });

  describe('on GET', () => {
    it('should render the why do you disagree page', async () => {
      await getHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.anything(),
        claimAmount: 110,
      }));
      expect(mockGetWhyDoYouDisagreeForm).toHaveBeenCalledWith(expect.anything(), ResponseType.PART_ADMISSION);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('draft failure');
      mockGetWhyDoYouDisagreeForm.mockRejectedValue(error);

      await getHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when the reason is empty', async () => {
      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.anything(),
      }));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(res.redirect).not.toHaveBeenCalled();
      expect(mockSaveWhyDoYouDisagreeData).not.toHaveBeenCalled();
    });

    it('should save and redirect to the timeline when a reason is provided', async () => {
      req.body = {text: 'Test'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveWhyDoYouDisagreeData).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({text: 'Test'}),
        ResponseType.PART_ADMISSION,
      );
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_TIMELINE_URL));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when saving fails', async () => {
      const error = new Error('draft failure');
      mockSaveWhyDoYouDisagreeData.mockRejectedValue(error);
      req.body = {text: 'Test'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
