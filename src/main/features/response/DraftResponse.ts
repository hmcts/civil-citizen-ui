import { Respondent } from 'response/respondent'
import { StatementOfMeans } from 'response/statementOfMeans'


export class DraftResponse {


  respondent?: Respondent
  statementOfMeans?: StatementOfMeans
  var employed
  var selfEmployed

  buildObj(input: any) {

    this.respondent = new Respondent().buildObj(input)
    this.statementOfMeans = new StatementOfMeans().buildObj(input)
    this.employed = input.employed
    this.selfEmployed = input.selfEmployed

  }

}
