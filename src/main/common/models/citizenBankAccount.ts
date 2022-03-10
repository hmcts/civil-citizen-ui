export class CitizenBankAccount {
  typeOfAccount?: string;
  joint?: string;
  balance?: string;

  constructor(typeOfAccount?: string,  joint?: string,  balance?: string) {
    this.typeOfAccount = typeOfAccount;
    this.joint = joint;
    this.balance = balance;
  }

}
