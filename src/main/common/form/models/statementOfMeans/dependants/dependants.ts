import {NumberOfChildren} from './numberOfChildren';

export class Dependants {
  declared?: boolean;
  numberOfChildren?: NumberOfChildren;

  constructor(declared?: boolean, numberOfChildren?: NumberOfChildren) {
    this.declared = declared;
    this.numberOfChildren = numberOfChildren;
  }
}
