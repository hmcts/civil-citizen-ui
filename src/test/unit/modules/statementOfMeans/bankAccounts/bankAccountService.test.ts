import {BankAccountService} from '../../../../../main/modules/statementOfMeans/bankAccounts/bankAccountService';
import * as DraftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {BankAccounts} from '../../../../../main/common/form/models/bankAndSavings/bankAccounts';
import {BankAccount} from '../../../../../main/common/form/models/bankAndSavings/bankAccount';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

describe('Bank account service', ()=>{
  it('should return empty bank account rows when data for bank accounts does not exist draft store', async () =>{
    //Given
    const bankAccountService = new BankAccountService();
    const spyGetCaseDataFromStore = jest.spyOn(DraftStoreService, 'getCaseDataFromStore');
    //When
    const result = await bankAccountService.getBankAccounts('234');
    //Then
    expect(result.accounts.length).toBe(2);
    expect(spyGetCaseDataFromStore).toBeCalled();
  });
  it('should save bank accounts data to draft store', async () =>{
    //Given
    const bankAccountService = new BankAccountService();
    const spySave = jest.spyOn(DraftStoreService,'saveDraftClaim');
    //When
    await bankAccountService.saveBankAccounts('2345', new BankAccounts([new BankAccount('OTHER', 'true', '123')]));
    //Then
    expect(spySave).toBeCalled();
  });
});
