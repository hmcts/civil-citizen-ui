import * as express from 'express';
import {TOTAL_AMOUNT_CALCULATION_URL} from '../urls';
import {calculateTotalAmount} from '../../common/utils/calculateMonthlyIncomeExpeses/monthlyIncomeExpensesCalculator';

const monthlyExpenseIncomeCalculatorController = express.Router();

monthlyExpenseIncomeCalculatorController.post(TOTAL_AMOUNT_CALCULATION_URL, (req, res) => {
  const scheduledAmounts = req.body.data;
  const totalAmount = calculateTotalAmount(scheduledAmounts);
  console.log(totalAmount);
  res.send(totalAmount);
});

export default monthlyExpenseIncomeCalculatorController;
