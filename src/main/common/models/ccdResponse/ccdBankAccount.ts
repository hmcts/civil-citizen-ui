export interface CCDBankAccount {
  id: string,
  value: {
    balance: number,
    jointAccount: string, // YES or NO
    accountType: string, // TODO: enum AccountType
  }
};

// enum AccountType {
//   CURRENT = 'CURRENT',
//    SAVINGS = 'SAVINGS',
//    ISA = 'ISA',
//    OTHER = 'OTHER',
// }
