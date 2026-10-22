import {CitizenTelephoneNumber} from 'common/form/models/citizenTelephoneNumber';
import {GenericForm} from 'common/form/models/genericForm';

describe('CitizenTelephoneNumber', () => {
  it('should trim telephone number on construct', () => {
    const model = new CitizenTelephoneNumber('  07123456789  ', true, true);
    expect(model.telephoneNumber).toBe('07123456789');
    expect(model.ccdPhoneExist).toBe(true);
    expect(model.mandatoryForParty).toBe(true);
  });

  it('should allow undefined telephone number', () => {
    const model = new CitizenTelephoneNumber();
    expect(model.telephoneNumber).toBeUndefined();
  });

  it('should reject invalid UK telephone numbers', async () => {
    const form = new GenericForm(new CitizenTelephoneNumber('abc'));
    await form.validate();
    expect(form.hasErrors()).toBeTruthy();
    expect(form.errorFor('telephoneNumber')).toBe('ERRORS.VALID_PHONE_NUMBER');
  });

  it('should require a telephone number when mandatory for party', async () => {
    const form = new GenericForm(new CitizenTelephoneNumber(undefined, false, true));
    await form.validate();
    expect(form.hasErrors()).toBeTruthy();
    expect(form.errorFor('telephoneNumber')).toBe('ERRORS.ENTER_TELEPHONE_NUMBER');
  });

  it('should pass validation when not mandatory for party and number omitted', async () => {
    const form = new GenericForm(new CitizenTelephoneNumber(undefined, false, false));
    await form.validate();
    expect(form.hasErrors()).toBeFalsy();
  });

});
