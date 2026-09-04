import {Request, Response} from 'express';
import eligibleController from '../../../../../../main/routes/features/public/eligibility/eligibleController';
import {
  ELIGIBILITY_HWF_ELIGIBLE_URL,
  ELIGIBILITY_HWF_ELIGIBLE_REFERENCE_URL,
  ELIGIBLE_FOR_THIS_SERVICE_URL,
  CLAIM_BILINGUAL_LANGUAGE_PREFERENCE_URL,
} from '../../../../../../main/routes/urls';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';
import {getYouCanUseContent} from '../../../../../../main/services/features/eligibility/eligibleService';

jest.mock('../../../../../../main/services/features/eligibility/eligibleService', () => ({
  getYouCanUseContent: jest.fn(() => [{title: 'You can use this service'}]),
}));

describe('Eligible Controller', () => {
  const getHandler = getRouteHandler(eligibleController, 'get');
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;

  beforeEach(() => {
    req = {cookies: {}, body: {}, query: {}, url: ELIGIBLE_FOR_THIS_SERVICE_URL};
    res = createMockResponse();
    jest.clearAllMocks();
  });

  it.each([
    ELIGIBILITY_HWF_ELIGIBLE_URL,
    ELIGIBILITY_HWF_ELIGIBLE_REFERENCE_URL,
    ELIGIBLE_FOR_THIS_SERVICE_URL,
  ])('should render you can use this service for %s and set eligibilityCompleted cookie', (url) => {
    req.url = url;

    getHandler(req as Request, res as unknown as Response, jest.fn());

    expect(res.cookie).toHaveBeenCalledWith('eligibilityCompleted', true, expect.objectContaining({httpOnly: true}));
    expect(getYouCanUseContent).toHaveBeenCalledWith(url, expect.any(String));
    expect(res.render).toHaveBeenCalledWith(
      'features/public/eligibility/eligible',
      expect.objectContaining({
        youCanUseContent: [{title: 'You can use this service'}],
        claimTaskListUrl: CLAIM_BILINGUAL_LANGUAGE_PREFERENCE_URL,
        pageTitle: 'PAGES.YOU_CAN_USE.PAGE_TITLE',
      }),
    );
  });

  it('should not overwrite eligibilityCompleted when it is already set', () => {
    req.cookies = {eligibilityCompleted: true};

    getHandler(req as Request, res as unknown as Response, jest.fn());

    expect(res.cookie).not.toHaveBeenCalled();
    expect(res.render).toHaveBeenCalled();
  });
});
