import { Form } from '../form';
import {BankAccount} from './bankAccount';
import {ArrayMaxSize} from 'class-validator';
import {SELECT_AN_OPTION} from '../../../form/validationErrors/errorMessageConstants';

export class ListOfBanksAndSavings extends Form{
  @ArrayMaxSize(1, {message: SELECT_AN_OPTION})
    rows:BankAccount[];

  constructor(rows : BankAccount[]) {
    super();
    this.rows = rows;
  }
}
