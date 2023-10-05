import {Bundle} from 'models/caseProgression/bundles/bundle';

export class CCDBundle {
  id: string;
  value: Bundle;

  constructor(id: string, value: Bundle) {
    this.id = id;
    this.value = value;
  }
}
