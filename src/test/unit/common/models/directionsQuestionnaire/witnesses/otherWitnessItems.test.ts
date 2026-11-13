import {OtherWitnessItems} from 'models/directionsQuestionnaire/witnesses/otherWitnessItems';
import {GenericForm} from 'form/models/genericForm';

describe('OtherWitnessItems', () => {
  it('should trim the first and last names', () => {
    const witness = new OtherWitnessItems({firstName: '  John ', lastName: ' Doe  ', details: 'Saw it'});

    expect(witness.firstName).toBe('John');
    expect(witness.lastName).toBe('Doe');
    expect(witness.details).toBe('Saw it');
  });

  it('should not throw when constructed without params', () => {
    expect(() => new OtherWitnessItems()).not.toThrow();
  });

  it('should treat non-string names as missing so validation asks for them', () => {
    const witness = new OtherWitnessItems({
      firstName: ['John', 'John'],
      lastName: 42,
      details: 'Saw it',
    } as unknown as OtherWitnessItems);

    const form = new GenericForm(witness);
    form.validateSync();

    expect(witness.firstName).toBeUndefined();
    expect(witness.lastName).toBeUndefined();
    expect(form.errorFor('firstName')).toBe('ERRORS.DEFENDANT_WITNESS_ENTER_FIRST_NAME');
    expect(form.errorFor('lastName')).toBe('ERRORS.DEFENDANT_WITNESS_ENTER_LAST_NAME');
  });
});
