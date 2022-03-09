import {BankAccounts} from 'common/form/models/bankAndSavings/bankAccounts';
import {BankAccount} from 'common/form/models/bankAndSavings/bankAccount';
import {DraftStoreClient} from 'modules/draft-store/draftStoreClient';

export class BankAccountService {
  draftStoreClient = new DraftStoreClient();

  public async getBankAccounts(claimId: string) {
    const claim = await this.draftStoreClient.getDraftClaimFromStore(claimId);
    if (claim && claim.statementOfMeans && claim.statementOfMeans.bankAccounts) {
      return claim.statementOfMeans.bankAccounts;
    }
    return new BankAccounts([new BankAccount(), new BankAccount()]);
  }

  public async saveBankAccounts(claimId: string, bankAccounts: BankAccounts) {
    const claim = await this.draftStoreClient.getDraftClaimFromStore(claimId);
    console.log(claim);
    bankAccounts.removeEmptyAccounts();
    claim.statementOfMeans.bankAccounts = bankAccounts;
    this.draftStoreClient.saveDraftClaim(claimId, claim);
  }
}
