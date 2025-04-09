import {QualifiedStatementOfTruthClaimIssue} from "form/models/statementOfTruth/qualifiedStatementOfTruthClaimIssue";
import {CcdStatementOfTruth} from "models/ccdResponse/ccdStatementOfTruth";

export const convertToCCDStatementOfTruth = (statementOfTruthClaimIssue: QualifiedStatementOfTruthClaimIssue): CcdStatementOfTruth => {
  return {
    name: statementOfTruthClaimIssue?.signerName,
    role: statementOfTruthClaimIssue?.signerRole,
  };
};
