import { GenericForm } from 'common/form/models/genericForm';
import { QualifiedStatementOfTruth } from 'common/form/models/statementOfTruth/qualifiedStatementOfTruth';

const tooLongString = '00000000000000000000000000000000000000000000000000000000000000000000000';
describe(('For Qualified Statement Form'), () => {
  it('should throw an error in case of exceeded max length for Qualified statement', async () => {
    const qualifiedStatementOfTruth = new QualifiedStatementOfTruth(true);
    qualifiedStatementOfTruth.signerName = tooLongString;
    qualifiedStatementOfTruth.signerRole = tooLongString;
    const form = new GenericForm(qualifiedStatementOfTruth);
    await form.validate();
    expect(form.hasErrors()).toBeTruthy();
    expect(form.errorFor('signerName')).toEqual('ERRORS.FULL_NAME_TOO_LONG');
    expect(form.errorFor('signerRole')).toEqual('ERRORS.JOB_TITLE_TOO_LONG');
  });
});