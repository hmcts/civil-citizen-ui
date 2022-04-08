import * as express from 'express';
import {ValidationError} from 'class-validator';

import {PriorityDebts, DebtType, DebtsError} from '../../../common/form/models/statementOfMeans/priorityDebts';
import { PriorityDebtDetails, DebtDetailsError, DebtValidationError } from '../../form/models/statementOfMeans/priorityDebtDetails';
import {checkBoxFields} from './priorityDebtsConstants';

export const convertToForm = (debts: PriorityDebts): PriorityDebts => {
  if (debts) {
    const {mortgage, rent, councilTax, gas, electricity, water, maintenance} =
      debts;
    return new PriorityDebts(
      mortgage,
      rent,
      councilTax,
      gas,
      electricity,
      water,
      maintenance,
    );
  }
  return new PriorityDebts();
};

const convertDebtNameToDisplay = (name: string) => {
  return checkBoxFields.find((field) => field.name === name)?.text;
};

export const convertRequestBodyToForm = (req: express.Request): PriorityDebts => {
  const convertedData: PriorityDebts = new PriorityDebts();
  checkBoxFields
    .map((field) => field.name)
    .forEach((fieldName: DebtType) => {
      Object.keys(req.body).forEach((key) => {
        if (key === fieldName) {
          convertedData[fieldName] = new PriorityDebtDetails();
        }
        if (
          key.includes(fieldName) &&
          req.body[key] &&
          convertedData[fieldName]
        ) {
          convertedData[fieldName].isDeclared = true;
          convertedData[fieldName].name = convertDebtNameToDisplay(fieldName);
          if (key.includes('amount')) {
            convertedData[fieldName].amount = Number(req.body[key]);
          } else if (key.includes('schedule')) {
            convertedData[fieldName].schedule = req.body[key];
          }
        }
      });
    });
  return convertedData;
};

export const formatFormErrors = (rawErrors: ValidationError[]): DebtsError => {
  const formattedErrors: DebtsError = {};
  rawErrors?.forEach((error: ValidationError) => {
    const parentProperty = error.property as keyof DebtsError;
    formattedErrors[parentProperty] = {};

    error.children.forEach((childError: ValidationError) => {
      const childProperty = childError.property as keyof DebtDetailsError;
      const errorText: string = Object.values(childError.constraints)[0];

      formattedErrors[parentProperty][childProperty] = {
        text: errorText,
        href: `#${error.property}-payment-${childError.property}`,
      };
    });
  });
  return formattedErrors;
};

export const listFormErrors = (
  formattedErrors: DebtsError,
): DebtValidationError[] => {
  const errorSummary: DebtValidationError[] = [];
  Object.values(formattedErrors).forEach((errorValue: DebtDetailsError) => {
    Object.values(errorValue).forEach(
      (nestedErrorValue: DebtValidationError) => {
        errorSummary.push(nestedErrorValue);
      },
    );
  });
  return errorSummary;
};

