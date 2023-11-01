import { Address } from 'common/form/models/address';
import { GenericForm } from 'common/form/models/genericForm';

const tooLongString = '00000000000000000000000000000000000000000000000000000000000000000000000';
describe(('For Address Form'), () => {
  it('should throw an error in case of exceeded max length for address', async () => {
    const address = new Address(tooLongString, tooLongString, tooLongString);
    const form = new GenericForm(address);
    await form.validate();
    expect(form.hasErrors()).toBeTruthy();
    expect(form.errorFor('addressLine1')).toEqual('ERRORS.ADDRESS_LINE_TOO_MANY');
    expect(form.errorFor('addressLine2')).toEqual('ERRORS.ADDRESS_LINE_TOO_MANY');
    expect(form.errorFor('addressLine3')).toEqual('ERRORS.ADDRESS_LINE_TOO_MANY');
  });
});

