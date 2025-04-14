import {convertToCCDStatementOfTruth} from 'services/translation/response/convertToCCDStatementOfTruth';
import {QualifiedStatementOfTruthClaimIssue} from 'form/models/statementOfTruth/qualifiedStatementOfTruthClaimIssue';
import {CcdStatementOfTruth} from 'models/ccdResponse/ccdStatementOfTruth';

describe('translate Statement of Truth to CCD version', () => {

  it('if no value provided should have undefined values', () => {
    const actual = convertToCCDStatementOfTruth(null);
    expect(actual).toEqual({name: undefined, role: undefined});
  });

  it('if value provided is undefined, should have undefined values', () => {
    const actual = convertToCCDStatementOfTruth(undefined);
    expect(actual).toEqual({name: undefined, role: undefined});
  });

  it('if value provided, should have translated values', () => {
    const toBeTranslated: QualifiedStatementOfTruthClaimIssue = new QualifiedStatementOfTruthClaimIssue(true, null, null, 'Clay', 'Mint');
    const expected: CcdStatementOfTruth = {name: 'Clay', role: 'Mint'};
    const actual = convertToCCDStatementOfTruth(toBeTranslated);

    expect(actual).toEqual(expected);
  });
});
