import {ValidationError} from 'class-validator';
import {GenericForm} from 'form/models/genericForm';
import {generateCorrespondenceAddressErrorMessages, PartyDetails} from 'form/models/partyDetails';

describe('generateCorrespondenceAddressErrorMessages', () => {
  it('should append _CORRESPONDENCE to correspondence address child errors and leave other errors unchanged', () => {
    //Given
    const otherError: ValidationError = {property: 'firstName', constraints: {isDefined: 'ERRORS.ENTER_FIRST_NAME'}};
    const correspondenceError: ValidationError = {
      property: 'correspondenceAddress',
      children: [{property: 'addressLine1', constraints: {isNotEmpty: 'ERRORS.VALID_ADDRESS_LINE_1'}}],
    };
    const form = new GenericForm(new PartyDetails({}), [otherError, correspondenceError]);
    //When
    generateCorrespondenceAddressErrorMessages(form);
    //Then
    expect(form.errors?.[0]).toEqual(otherError);
    expect(form.errors?.[1].children?.[0].constraints).toEqual({error: 'ERRORS.VALID_ADDRESS_LINE_1_CORRESPONDENCE'});
  });

  it('should set errors to empty array when errors is undefined', () => {
    //Given
    const form = new GenericForm(new PartyDetails({}));
    //When
    generateCorrespondenceAddressErrorMessages(form);
    //Then
    expect(form.errors).toEqual([]);
  });

  it('should set children to empty array when correspondence address error has no children', () => {
    //Given
    const correspondenceError: ValidationError = {property: 'correspondenceAddress'};
    const form = new GenericForm(new PartyDetails({}), [correspondenceError]);
    //When
    generateCorrespondenceAddressErrorMessages(form);
    //Then
    expect(form.errors?.[0].children).toEqual([]);
  });
});
