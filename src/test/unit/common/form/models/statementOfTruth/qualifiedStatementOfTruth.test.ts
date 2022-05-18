import {
  QualifiedStatementOfTruth,
} from '../../../../../../main/common/form/models/statementOfTruth/qualifiedStatementOfTruth';
import {GenericForm} from '../../../../../../main/common/form/models/genericForm';
import {
  SIGNER_NAME_REQUIRED, SIGNER_NAME_TOO_LONG,
  SIGNER_ROLE_REQUIRED, SIGNER_ROLE_TOO_LONG,
  STATEMENT_OF_TRUTH_REQUIRED_MESSAGE,
} from '../../../../../../main/common/form/validationErrors/errorMessageConstants';
import {
  SIGNER_NAME_MAX_LENGTH,
  SIGNER_ROLE_MAX_LENGTH,
} from '../../../../../../main/common/form/validators/validationConstraints';

const tooLongSignerName: string = Array(SIGNER_NAME_MAX_LENGTH + 2).join('a');
const tooLongSignerRole: string = Array(SIGNER_ROLE_MAX_LENGTH + 2).join('a');

describe('Qualified Statement of Truth form validation', () => {
  test('should fail when signed is false', () => {
    //Given
    const form = new GenericForm(new QualifiedStatementOfTruth(false));
    //When
    form.validateSync();
    //Then
    expect(form.hasErrors()).toBe(true);
    expect(form.errorFor('type')).toBeUndefined();
    expect(form.errorFor('signed')).toBe(STATEMENT_OF_TRUTH_REQUIRED_MESSAGE);
    expect(form.errorFor('directionsQuestionnaireSigned')).toBeUndefined();
    expect(form.errorFor('signerName')).toBe(SIGNER_NAME_REQUIRED);
    expect(form.errorFor('signerRole')).toBe(SIGNER_ROLE_REQUIRED);
  });

  test('should fail when signer name and/or role is empty', () => {
    //Given
    const form = new GenericForm(new QualifiedStatementOfTruth(true, false, '', ''));
    //When
    form.validateSync();
    //Then
    expect(form.hasErrors()).toBe(true);
    expect(form.errorFor('type')).toBeUndefined();
    expect(form.errorFor('signed')).toBeUndefined();
    expect(form.errorFor('directionsQuestionnaireSigned')).toBeUndefined();
    expect(form.errorFor('signerName')).toBe(SIGNER_NAME_REQUIRED);
    expect(form.errorFor('signerRole')).toBe(SIGNER_ROLE_REQUIRED);
  });

  test('should fail when signer name and/or role has only spaces', () => {
    //Given
    const form = new GenericForm(new QualifiedStatementOfTruth(true, false, ' ', ' '));
    //When
    form.validateSync();
    //Then
    expect(form.hasErrors()).toBe(true);
    expect(form.errorFor('type')).toBeUndefined();
    expect(form.errorFor('signed')).toBeUndefined();
    expect(form.errorFor('directionsQuestionnaireSigned')).toBeUndefined();
    expect(form.errorFor('signerName')).toBe(SIGNER_NAME_REQUIRED);
    expect(form.errorFor('signerRole')).toBe(SIGNER_ROLE_REQUIRED);
  });

  test('should fail when signer name and/or role is too long', () => {
    //Given
    const form = new GenericForm(new QualifiedStatementOfTruth(true, false, tooLongSignerName, tooLongSignerRole));
    //When
    form.validateSync();
    //Then
    expect(form.hasErrors()).toBe(true);
    expect(form.errorFor('type')).toBeUndefined();
    expect(form.errorFor('signed')).toBeUndefined();
    expect(form.errorFor('directionsQuestionnaireSigned')).toBeUndefined();
    expect(form.errorFor('signerName')).toBe(SIGNER_NAME_TOO_LONG);
    expect(form.errorFor('signerRole')).toBe(SIGNER_ROLE_TOO_LONG);
  });
});
