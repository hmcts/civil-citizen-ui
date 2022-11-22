import {DefendantDOB} from './defendantDOB';
import {QualifiedStatementOfTruth} from 'form/models/statementOfTruth/qualifiedStatementOfTruth';

export class CCJRequest {
  defendantDOB?: DefendantDOB;
  statementOfTruth?: QualifiedStatementOfTruth;
}
