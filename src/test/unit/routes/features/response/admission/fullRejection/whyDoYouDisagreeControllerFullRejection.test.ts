import {Response} from 'express';
import whyDoYouDisagreeFullRejectionController from 'routes/features/response/admission/fullRejection/whyDoYouDisagreeFullRejectionController';
import {CITIZEN_TIMELINE_URL, CITIZEN_WHY_DO_YOU_DISAGREE_FULL_REJECTION_URL} from 'routes/urls';
import {
  getWhyDoYouDisagreeForm,
  saveWhyDoYouDisagreeData,
} from 'services/features/response/admission/whyDoYouDisagreeService';
import {WhyDoYouDisagree} from 'form/models/admission/partialAdmission/whyDoYouDisagree';
import {ResponseType} from 'form/models/responseType';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'models/AppRequest';
import {createMockSession, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('services/features/response/admission/whyDoYouDisagreeService');
jest.mock('modules/draft-store/draftStoreService');

const viewPath = 'features/response/admission/why-do-you-disagree';
const claimId = '12345';

const createStatusResponse = () => {
  const res = {
    render: jest.fn(),
    redirect: jest.fn(),
    status: jest.fn(),
    send: jest.fn(),
  };
  res.status.mockReturnValue(res);
  return res;
};

const invoke = async (method: 'get' | 'post', req: Record<string, unknown> = {}) => {
  const res = createStatusResponse();
  const next = jest.fn();
  await getRouteHandler(whyDoYouDisagreeFullRejectionController, method, CITIZEN_WHY_DO_YOU_DISAGREE_FULL_REJECTION_URL)(
    {
      params: {id: claimId},
      body: {},
      query: {},
      cookies: {},
      session: createMockSession({user: {id: 'user-1'}}),
      ...req,
    } as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

describe('Why do you disagree Full Rejection Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (getWhyDoYouDisagreeForm as jest.Mock).mockResolvedValue({
      claimAmount: 110,
      whyDoYouDisagree: new WhyDoYouDisagree('already explained'),
    });
    (saveWhyDoYouDisagreeData as jest.Mock).mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render the stored disagreement and claim amount', async () => {
      const {res} = await invoke('get');

      expect(getWhyDoYouDisagreeForm).toHaveBeenCalledWith(claimId, ResponseType.FULL_DEFENCE);
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({claimAmount: 110}));
      expect(res.render.mock.calls[0][1].form.model.text).toBe('already explained');
    });

    it('should send 500 when the form cannot be loaded', async () => {
      (getWhyDoYouDisagreeForm as jest.Mock).mockRejectedValue(new Error('redis failure'));

      const {res} = await invoke('get');

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({error: 'redis failure'});
    });
  });

  describe('on POST', () => {
    it('should re-render when the disagreement text is empty', async () => {
      const {res} = await invoke('post', {body: {}});

      expect(res.render.mock.calls[0][0]).toBe(viewPath);
      expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(saveWhyDoYouDisagreeData).not.toHaveBeenCalled();
    });

    it('should save the disagreement and redirect to the timeline', async () => {
      const {res} = await invoke('post', {body: {text: 'Test'}});

      expect(saveWhyDoYouDisagreeData).toHaveBeenCalledWith(
        claimId,
        expect.objectContaining({text: 'Test'}),
        ResponseType.FULL_DEFENCE,
      );
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_TIMELINE_URL));
    });

    it('should send 500 when saving the disagreement fails', async () => {
      (saveWhyDoYouDisagreeData as jest.Mock).mockRejectedValue(new Error('redis failure'));

      const {res} = await invoke('post', {body: {text: 'Test'}});

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({error: 'redis failure'});
    });
  });
});
