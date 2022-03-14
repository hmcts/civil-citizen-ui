import { Respondent } from 'response/respondent'
import { StatementOfMeans } from 'response/statementOfMeans'


export class DraftResponse {


  disability?: Disability
  servereDisability?: SevereDisability


  buildObj(input: any) {

    this.disability = new Disability().buildObj(input)
    this.servereDisability = new SevereDisability().buildObj(input)

  }

}
