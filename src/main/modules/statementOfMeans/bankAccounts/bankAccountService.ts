import {BankAccounts} from '../../../common/form/models/bankAndSavings/bankAccounts';
import {BankAccount} from '../../../common/form/models/bankAndSavings/bankAccount';
import {DraftStoreService} from '../../../modules/draft-store/draftStoreService';
import {Claim} from '../../../common/models/claim';
import {StatementOfMeans} from '../../../common/models/statementOfMeans';

export class BankAccountService {


  public async getBankAccounts(claimId: string) {
    const draftStoreService = new DraftStoreService();
    const claim = await draftStoreService.getCaseDataFormStore(claimId);
    console.log(claim);
    if (claim && claim.statementOfMeans && claim.statementOfMeans.bankAccounts) {
      return claim.statementOfMeans.bankAccounts;
    }
    return new BankAccounts([new BankAccount(), new BankAccount()]);
  }

  public async saveBankAccounts(claimId:string, bankAccounts: BankAccounts) {
    const draftStoreService = new DraftStoreService();
    const claim = await draftStoreService.getCaseDataFormStore(claimId);
    console.log(claim);
    this.updateBankAccounts(bankAccounts, claim);
    await draftStoreService.saveDraftClaim(claimId, claim);
  }

  private updateBankAccounts(bankAccounts: BankAccounts, claim: Claim) {
    bankAccounts.removeEmptyAccounts();
    if (claim.statementOfMeans) {
      claim.statementOfMeans.bankAccounts = bankAccounts;
    } else {
      const statementOfMeans = new StatementOfMeans();
      statementOfMeans.bankAccounts = bankAccounts;
      claim.statementOfMeans = statementOfMeans;
    }
  }
}
