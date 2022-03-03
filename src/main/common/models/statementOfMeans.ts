import {Disability} from '../form/models/statement-of-means/disability';


export class StatementOfMeans {
  disability?: Disability;

  deserialize(input: any): StatementOfMeans {
    if (input) {
      this.disability = new Disability(input.disability && input.disability.option);
    }
    return this;
  }
}
