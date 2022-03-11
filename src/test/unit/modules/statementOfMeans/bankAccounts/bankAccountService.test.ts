import {BankAccountService} from '../../../../../main/modules/statementOfMeans/bankAccounts/bankAccountService';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

describe('Bank account service', ()=>{

  it('should return empty bank account rows when data for bank accounts exist in redis', async () =>{
    //Given
    const bankAccountService = new BankAccountService();
    //When
    const result = await bankAccountService.getBankAccounts('234');
    //Then
    expect(result.accounts.length).toBe(2);

  });
});
