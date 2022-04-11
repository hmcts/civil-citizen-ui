import * as express from 'express';
import {TOTAL_AMOUNT_CALCULATION_URL} from '../urls';
import {calculateTotalAmount} from '../../common/utils/calculateMonthlyIncomeExpenses/monthlyIncomeExpensesCalculator';

const monthlyExpenseIncomeCalculatorController = express.Router();

monthlyExpenseIncomeCalculatorController.post(TOTAL_AMOUNT_CALCULATION_URL, (req, res) => {
  const scheduledAmounts = req.body;
  const totalAmount = calculateTotalAmount(scheduledAmounts);
  res.status(200).send(totalAmount);
});

export default monthlyExpenseIncomeCalculatorController;
