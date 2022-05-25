import {StatementOfTruthForm} from '../../../../../../main/common/form/models/statementOfTruth/statementOfTruthForm';
import {GenericForm} from '../../../../../../main/common/form/models/genericForm';
import {SignatureType} from '../../../../../../main/common/models/signatureType';
import {
  DIRECTION_QUESTIONNAIRE_REQUIRED_MESSAGE,
  STATEMENT_OF_TRUTH_REQUIRED_MESSAGE,
} from '../../../../../../main/common/form/validationErrors/errorMessageConstants';


describe('Statement of Truth form validation', () => {
  test('should fail when not signed', () => {
    //Given
    const form = new GenericForm(new StatementOfTruthForm(undefined, ''));
    //When
    form.validateSync();
    //Then
    expect(form.model.type).toBe(SignatureType.BASIC);
    expect(form.hasErrors()).toBe(true);
    expect(form.errorFor('type')).toBeUndefined();
    expect(form.errorFor('signed')).toBe(STATEMENT_OF_TRUTH_REQUIRED_MESSAGE);
    expect(form.errorFor('directionsQuestionnaireSigned')).toBeUndefined();
    expect(form.errorFor('signerName')).toBeUndefined();
    expect(form.errorFor('signerRole')).toBeUndefined();
  });

  test('should pass when basic signature type and direction questionnaire not signed', () => {
    //Given
    const form = new GenericForm(new StatementOfTruthForm(SignatureType.BASIC, 'true', false));
    //When
    form.validateSync();
    //Then
    expect(form.hasErrors()).toBe(false);
  });

  test('should pass when direction questionnaire is signed', () => {
    //Given
    const form = new GenericForm(new StatementOfTruthForm(SignatureType.DIRECTION_QUESTIONNAIRE, 'true', true));
    //When
    form.validateSync();
    //Then
    expect(form.hasErrors()).toBe(false);
  });

  test('should pass when direction questionnaire is not signed', () => {
    //Given
    const form = new GenericForm(new StatementOfTruthForm(SignatureType.DIRECTION_QUESTIONNAIRE, 'true', false));
    //When
    form.validateSync();
    //Then
    expect(form.hasErrors()).toBe(true);
    expect(form.errorFor('type')).toBeUndefined();
    expect(form.errorFor('signed')).toBeUndefined();
    expect(form.errorFor('directionsQuestionnaireSigned')).toBe(DIRECTION_QUESTIONNAIRE_REQUIRED_MESSAGE);
    expect(form.errorFor('signerName')).toBeUndefined();
    expect(form.errorFor('signerRole')).toBeUndefined();

  });
});
