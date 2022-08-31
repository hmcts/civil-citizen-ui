import {PaymentOptionCCD} from './paymentOptionCCD';
import {ClaimUpdate} from '../../models/events/eventDto';

export interface CCDResponse extends ClaimUpdate{
  paymentTypeSelection?: PaymentOptionCCD;

}
