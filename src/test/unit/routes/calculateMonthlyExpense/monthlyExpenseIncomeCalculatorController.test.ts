import {NextFunction, Response} from 'express';
import {AppRequest} from 'models/AppRequest';
import monthlyExpenseIncomeCalculatorController from 'routes/calculateMonthlyIncomeExpense/monthlyExpenseIncomeCalculatorController';
import {TOTAL_AMOUNT_CALCULATION_URL} from 'routes/urls';
import {getRouteHandler} from '../../../utils/getRouteHandler';

const createCalculatorResponse = () => {
  const res = {
    status: jest.fn(),
    send: jest.fn(),
    json: jest.fn(),
  };
  res.status.mockReturnValue(res);
  return res;
};

describe('Monthly income expense calculator controller', () => {
  describe('on POST', () => {
    it('should calculate amount successfully', async () => {
      const res = createCalculatorResponse();
      const next = jest.fn() as NextFunction;
      const req = {
        body: [{amount: '100', schedule: 'MONTH'}, {amount: '10', schedule: 'MONTH'}],
      };

      await getRouteHandler(monthlyExpenseIncomeCalculatorController, 'post', TOTAL_AMOUNT_CALCULATION_URL)(
        req as unknown as AppRequest,
        res as unknown as Response,
        next,
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith('110');
    });
  });
});
