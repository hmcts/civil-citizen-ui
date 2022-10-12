import {Request} from 'express';
import {ValidationError} from 'class-validator';
import {PriorityDebts, DebtType, DebtsError} from '../../../common/form/models/statementOfMeans/priorityDebts';
import {PriorityDebtDetails, DebtDetailsError, DebtValidationError} from '../../form/models/statementOfMeans/priorityDebtDetails';
import {checkBoxFields} from './priorityDebtsConstants';
import {GenericForm} from '../../../common/form/models/genericForm';

export const convertToForm = (debts: PriorityDebts): GenericForm<PriorityDebts> => {
  if (debts) {
    const {mortgage, rent, councilTax, gas, electricity, water, maintenance} =
      debts;
    return new GenericForm(new PriorityDebts(
      mortgage,
      rent,
      councilTax,
      gas,
      electricity,
      water,
      maintenance,
    ));
  }
  return new GenericForm(new PriorityDebts());
};

const convertDebtNameToDisplay = (name: string) => {
  return checkBoxFields.find((field) => field.name === name)?.text;
};

export const convertRequestBodyToForm = (req: Request): GenericForm<PriorityDebts> => {
  const convertedData: GenericForm<PriorityDebts> = new GenericForm(new PriorityDebts());
  checkBoxFields
    .map((field) => field.name)
    .forEach((fieldName: DebtType) => {
      Object.keys(req.body).forEach((key) => {
        if (key === fieldName) {
          convertedData.model[fieldName] = new PriorityDebtDetails();
        }
        if (
          key.includes(fieldName) &&
          req.body[key] &&
          convertedData.model[fieldName]
        ) {
          convertedData.model[fieldName].isDeclared = true;
          convertedData.model[fieldName].name = convertDebtNameToDisplay(fieldName);
          if (key.includes('amount')) {
            convertedData.model[fieldName].amount = Number(req.body[key]);
          } else if (key.includes('schedule')) {
            convertedData.model[fieldName].schedule = req.body[key];
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

