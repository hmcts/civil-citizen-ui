import {Bundle} from 'models/caseProgression/bundles/Bundle';

export class BundleId {
  id: string;
  value: Bundle;

  constructor(id: string, value: Bundle) {
    this.id = id;
    this.value = value;
  }
}
