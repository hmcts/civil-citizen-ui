import {Request, Response} from 'express';
import qmConfirmationController from '../../../../../main/routes/features/queryManagement/qmConfirmationController';
import {getCancelUrl} from 'services/features/queryManagement/queryManagementService';
import {createMockResponse, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('services/features/queryManagement/queryManagementService', () => ({
  getCancelUrl: jest.fn(() => '/dashboard/12345'),
}));

describe('Query management Confirmation Controller', () => {
  const getHandler = getRouteHandler(qmConfirmationController, 'get');
  const claimId = '12345';

  it('should render the confirmation page', () => {
    const req = {params: {id: claimId}, query: {}, cookies: {}} as Partial<Request>;
    const res = createMockResponse();

    getHandler(req as Request, res as unknown as Response, jest.fn());

    expect(getCancelUrl).toHaveBeenCalledWith(claimId);
    expect(res.render).toHaveBeenCalledWith(
      'features/queryManagement/qm-confirmation-template.njk',
      {cancelUrl: '/dashboard/12345'},
    );
  });
});
