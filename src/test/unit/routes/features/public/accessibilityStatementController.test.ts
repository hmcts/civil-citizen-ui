import {Request, Response} from 'express';
import accessibilityStatementController from 'routes/features/public/accessibilityStatementController';
import {ACCESSIBILITY_STATEMENT_URL, DASHBOARD_URL} from 'routes/urls';
import {createMockResponse, getRouteHandler} from '../../../../utils/getRouteHandler';

describe('Accessibility Statement page', () => {
  it('renders the accessibility statement view', async () => {
    const res = createMockResponse();

    await getRouteHandler(accessibilityStatementController, 'get', ACCESSIBILITY_STATEMENT_URL)(
      {} as Request,
      res as unknown as Response,
      jest.fn(),
    );

    expect(res.render).toHaveBeenCalledWith('features/public/accessibility-statement', {dashboardUrl: DASHBOARD_URL});
  });
});
