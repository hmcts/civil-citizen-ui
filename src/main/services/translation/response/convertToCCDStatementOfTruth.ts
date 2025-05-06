import {QualifiedStatementOfTruthClaimIssue} from 'form/models/statementOfTruth/qualifiedStatementOfTruthClaimIssue';
import {CcdStatementOfTruth} from 'models/ccdResponse/ccdStatementOfTruth';
import {QualifiedStatementOfTruth} from 'form/models/statementOfTruth/qualifiedStatementOfTruth';

export const convertToCCDStatementOfTruth = (statementOfTruthClaimIssue: QualifiedStatementOfTruthClaimIssue): CcdStatementOfTruth => {
  return {
    name: statementOfTruthClaimIssue?.signerName,
    role: statementOfTruthClaimIssue?.signerRole,
  };
};
export const convertToDefendantCCDStatementOfTruth = (statementOfTruth: QualifiedStatementOfTruth): CcdStatementOfTruth => {
  return {
    name: statementOfTruth?.signerName,
    role: statementOfTruth?.signerRole,
  };
};
