import {GenericYesNo} from '../../common/form/models/genericYesNo';

const getGenericOptionForm = (option: string, propertyName: string, errorMessages: any): GenericYesNo => {
  return new GenericYesNo(option, getErrorMessage(propertyName, errorMessages));
};

const getErrorMessage = (propertyName: string, errorMessages: any): string => {
  return (errorMessages[propertyName as keyof typeof errorMessages]) ?
    errorMessages[propertyName as keyof typeof errorMessages] :
    undefined;
};

export {
  getGenericOptionForm,
}
