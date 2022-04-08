import {ValidationError} from 'class-validator';

import {PriorityDebts, DebtType, DebtsError} from '../../../common/form/models/statementOfMeans/priorityDebts';
import {PriorityDebtDetails, DebtDetailsError, DebtValidationError } from '../../form/models/statementOfMeans/priorityDebtDetails';
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

export const convertRequestBodyToForm = (reqBody: any): PriorityDebts => {
  const convertedData: PriorityDebts = new PriorityDebts();
  checkBoxFields
    .map((field) => field.name)
    .forEach((fieldName: DebtType) => {
      Object.keys(reqBody).forEach((key) => {
        if (key === fieldName) {
          convertedData[fieldName] = new PriorityDebtDetails();
        }
        if (
          key.includes(fieldName) &&
          reqBody[key] &&
          convertedData[fieldName]
        ) {
          convertedData[fieldName].isDeclared = true;
          convertedData[fieldName].name = convertDebtNameToDisplay(fieldName);
          if (key.includes('amount')) {
            convertedData[fieldName].amount = Number(reqBody[key]);
          } else if (key.includes('schedule')) {
            convertedData[fieldName].schedule = reqBody[key];
          }
        }
      });
    });
  return convertedData;
};

export const formatFormErrors = (rawErrors: ValidationError[]): DebtsError => {
  const formattedErrors: DebtsError = {};
  rawErrors?.forEach((error) => {
    const parentProperty = error.property as keyof DebtsError;
    formattedErrors[parentProperty] = {};

    error.children.forEach((childError: any) => {
      const childProperty = childError.property as keyof DebtDetailsError;
      const errorText: any = Object.values(childError.constraints)[0];

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

