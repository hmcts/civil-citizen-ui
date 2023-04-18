import {GenericYesNo} from '../../common/form/models/genericYesNo';

const getGenericOptionForm = (option: string, propertyName: string, errorMessages: Record<string, string>): GenericYesNo => {
  return new GenericYesNo(option, getErrorMessage(propertyName, errorMessages));
};

const getErrorMessage = (propertyName: string,errorMessages: Record<string, string>): string => {
  return (errorMessages[propertyName]) ? errorMessages[propertyName] : undefined;
};

export {
  getGenericOptionForm,
};
