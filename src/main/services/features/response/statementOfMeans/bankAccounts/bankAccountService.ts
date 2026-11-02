import {BankAccounts} from 'common/form/models/bankAndSavings/bankAccounts';
import {BankAccount} from 'common/form/models/bankAndSavings/bankAccount';
import {getResponseClaimById, getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {Claim} from 'models/claim';
import {StatementOfMeans} from 'common/models/statementOfMeans';
import {convertCitizenBankAccountsToForm, convertFormToCitizenBankAccount} from './bankAccountConverter';
import {AppRequest} from 'models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';

export class BankAccountService {
  public async getBankAccounts(req: AppRequest): Promise<BankAccounts> {
    const caseId = getRouteParam(req, 'id');
    const claim = await getResponseClaimById(req, caseId);

    if (claim?.statementOfMeans?.bankAccounts) {
      return convertCitizenBankAccountsToForm(claim.statementOfMeans.bankAccounts);
    }
    return new BankAccounts([new BankAccount(), new BankAccount()]);
  }

  public async saveBankAccounts(req: AppRequest, bankAccounts: BankAccounts) {
    const caseId = getRouteParam(req, 'id');
    const draftResult = await getResponseDraft(req, caseId);
    if (!draftResult) {
      throw new Error('[bankAccountService] no response draft found');
    }
    const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
    const draftId = draftResult.rawResponse?.draftId;

    this.updateBankAccounts(bankAccounts, claim);

    if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
      claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
    }
    await updateResponseDraft(req, caseId, claim, draftId);
  }

  private updateBankAccounts(bankAccounts: BankAccounts, claim: Claim) {
    const citizenAccounts = convertFormToCitizenBankAccount(bankAccounts);

    if (claim.statementOfMeans) {
      claim.statementOfMeans.bankAccounts = citizenAccounts;
    } else {
      const statementOfMeans = new StatementOfMeans();
      statementOfMeans.bankAccounts = citizenAccounts;
      claim.statementOfMeans = statementOfMeans;
    }
  }
}
