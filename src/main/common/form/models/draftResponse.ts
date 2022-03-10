import {Residence} from 'common/form/models/statement-of-means/residence';

export class DraftResponse {
  externalId: string | undefined;
  residence?: Residence;
}
