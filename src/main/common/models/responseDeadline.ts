import {ResponseOptions} from '../../common/form/models/responseDeadline';
import {AdditionalTimeOptions} from '../form/models/additionalTime';

export interface ResponseDeadline {
  option?: ResponseOptions,
  additionalTime?: AdditionalTimeOptions,
  agreedResponseDeadline?: Date,
}
