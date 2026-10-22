import {getGenericOptionForm} from 'services/genericForm/genericFormService';
import {YesNo} from 'form/models/yesNo';

describe('genericFormService', () => {
  it('should create GenericYesNo with matching error message', () => {
    const form = getGenericOptionForm(YesNo.YES, 'option', {option: 'ERRORS.REQUIRED'});

    expect(form.option).toBe(YesNo.YES);
    expect(form.messageName).toBe('ERRORS.REQUIRED');
  });

  it('should create GenericYesNo when property missing from error messages', () => {
    const form = getGenericOptionForm(YesNo.NO, 'missing', {option: 'ERRORS.REQUIRED'});
    expect(form.option).toBe(YesNo.NO);
    expect(form.messageName).toBeUndefined();
  });
});
