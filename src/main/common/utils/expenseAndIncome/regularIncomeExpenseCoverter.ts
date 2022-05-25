import express from 'express';
import {RegularExpenses} from '../../form/models/statementOfMeans/expensesAndIncome/regularExpenses';
import RegularIncome from '../../form/models/statementOfMeans/expensesAndIncome/regularIncome';
import Transaction from '../../form/models/statementOfMeans/expensesAndIncome/transaction';
import OtherTransaction from '../../form/models/statementOfMeans/expensesAndIncome/otherTransaction';

function toRegularExpenseForm(req: express.Request): RegularExpenses {
  const regularExpenses = RegularExpenses.buildEmptyForm();
  requestBodyToForm(req, regularExpenses);
  return regularExpenses;
}

function requestBodyToForm(req: express.Request, transactionModel: RegularExpenses | RegularIncome) {
  if (req.body.declared) {
    if (Array.isArray(req.body.declared)) {
      req.body.declared.forEach((expenseName: string) => {
        updateFormWithResponseData(expenseName, req, transactionModel, transactionModel instanceof RegularIncome);
      });
    } else {
      updateFormWithResponseData(req.body.declared, req, transactionModel, transactionModel instanceof RegularIncome);
    }
  }
}

function toRegularIncomeForm(req: express.Request): RegularIncome {
  const regularIncome = RegularIncome.buildEmptyForm();
  requestBodyToForm(req, regularIncome);
  return regularIncome;
}

function getValueFromRequest(key: string, req: express.Request, isIncome: boolean): Transaction | OtherTransaction {
  if (key === 'other') {
    return OtherTransaction.buildPopulatedForm(req.body.model[key].transactionSources, isIncome);
  }
  return Transaction.buildPopulatedForm(req.body.model[key].transactionSource.name, req.body.model[key].transactionSource.amount, req.body.model[key].transactionSource.schedule, isIncome);
}


function updateFormWithResponseData(key: string, req: express.Request, transactionModel: RegularExpenses | RegularIncome, income: boolean) {
  transactionModel[key] = getValueFromRequest(key, req, income);
}

export {
  toRegularExpenseForm,
  toRegularIncomeForm,
};
