import {
  BankAccountService,
} from '../../../../../../../main/services/features/response/statementOfMeans/bankAccounts/bankAccountService';
import * as draftStoreService from '../../../../../../../main/modules/draft-store/draftStoreService';
import {BankAccounts} from '../../../../../../../main/common/form/models/bankAndSavings/bankAccounts';
import {BankAccount} from '../../../../../../../main/common/form/models/bankAndSavings/bankAccount';
import {StatementOfMeans} from '../../../../../../../main/common/models/statementOfMeans';
import {CitizenBankAccount} from '../../../../../../../main/common/models/citizenBankAccount';
import {Claim} from '../../../../../../../main/common/models/claim';

jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');


describe('Bank account service', () => {
  it('should return empty bank account rows when data for bank accounts does not exist draft store', async () => {
    //Given
    const bankAccountService = new BankAccountService();
    const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
    //When
    const result = await bankAccountService.getBankAccounts('234');
    //Then
    expect(result.accounts.length).toBe(2);
    expect(spyGetCaseDataFromStore).toBeCalled();
  });
  it('should return populated bank accounts rows when data for bank exists', async () => {
    //Given
    const claim = createClaim();
    const bankAccountService = new BankAccountService();
    const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
    mockGetCaseData.mockImplementation(async () => {
      return claim;
    });
    //When
    const result = await bankAccountService.getBankAccounts('123');
    //Then
    expect(result.accounts.length).toBe(2);
    expect(result.accounts[0].typeOfAccount).toBe('OTHER');
    expect(mockGetCaseData).toBeCalled();
  });
  it('should save bank accounts data to draft store', async () => {
    //Given
    const bankAccountService = new BankAccountService();
    const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
    //When
    await bankAccountService.saveBankAccounts('2345', new BankAccounts([new BankAccount('OTHER', 'true', '123')]));
    //Then
    expect(spySave).toBeCalled();
  });
});

function createClaim() {
  const claim = new Claim();
  const statementOfMeans = new StatementOfMeans();
  statementOfMeans.bankAccounts = [new CitizenBankAccount('OTHER', 'true', '2342')];
  claim.statementOfMeans = statementOfMeans;
  return claim;
}
