import { Respondent } from 'response/respondent'
import { StatementOfMeans } from 'response/statementOfMeans'


export class DraftResponse {


  party?: Party
  companyDetails?: CompanyDetalis
  var employed
  var selfEmployed

  buildObj(input: any) {

    this.party = new Party().buildObj(input)
    this.companyDetails = new CompanyDetalis().buildObj(input)

  }

}
