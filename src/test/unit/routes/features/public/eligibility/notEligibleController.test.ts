import {Request, Response} from 'express';
import notEligibleController from '../../../../../../main/routes/features/public/eligibility/notEligibleController';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';
import {convertToNotEligibleReason} from '../../../../../../main/common/utils/notEligibleReasonConvertor';

jest.mock('../../../../../../main/common/utils/notEligibleReasonConvertor', () => ({
  convertToNotEligibleReason: jest.fn((reason: string) => reason),
}));

describe('Not Eligible Controller', () => {
  const getHandler = getRouteHandler(notEligibleController, 'get');
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {cookies: {}, body: {}, query: {reason: 'claim-value-over-25000'}};
    res = createMockResponse();
    next = jest.fn();
  });

  it('should render the not eligible page with the converted reason', () => {
    getHandler(req as Request, res as unknown as Response, next);

    expect(convertToNotEligibleReason).toHaveBeenCalledWith('claim-value-over-25000');
    expect(res.render).toHaveBeenCalledWith(
      'features/public/eligibility/not-eligible',
      {
        reason: 'claim-value-over-25000',
        pageTitle: 'PAGES.NOT_ELIGIBLE_FOR_SERVICE.PAGE_TITLE',
      },
    );
  });

  it('should call next when rendering fails', () => {
    const error = new Error('render failed');
    res.render.mockImplementation(() => {
      throw error;
    });

    getHandler(req as Request, res as unknown as Response, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
