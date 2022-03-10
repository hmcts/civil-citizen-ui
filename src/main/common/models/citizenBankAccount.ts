export class CitizenBankAccount {
  typeOfAccount?: string;
  joint?: boolean;
  balance?: string;

  constructor(typeOfAccount?: string,  joint?: boolean,  balance?: string) {
    this.typeOfAccount = typeOfAccount;
    this.joint = joint;
    this.balance = balance;
  }

}
