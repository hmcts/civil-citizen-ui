import {Disability} from '../../common/form/models/statementOfMeans/disability';
import {DraftStoreService} from '../../modules/draft-store/draftStoreService';
import {StatementOfMeans} from '../../common/models/statementOfMeans';

export class DisabilityService {


  public async getDisability(claimId: string) {
    const draftStoreService = new DraftStoreService();
    const civilClaimResponse = await draftStoreService.getDraftClaimFromStore(claimId);
    console.log(civilClaimResponse);
    if (civilClaimResponse && civilClaimResponse.case_data && civilClaimResponse.case_data.statementOfMeans && civilClaimResponse.case_data.statementOfMeans.disability) {
      return civilClaimResponse.case_data.statementOfMeans.disability;
    }
    return new Disability('');
  }

  public async saveDisability(claimId: string, disability: Disability) {
    const draftStoreService = new DraftStoreService();
    const civilClaimResponse = await draftStoreService.getDraftClaimFromStore(claimId);
    console.log(civilClaimResponse);
    if (civilClaimResponse && civilClaimResponse.case_data && civilClaimResponse.case_data.statementOfMeans) {
      civilClaimResponse.case_data.statementOfMeans.disability = disability;
    } else {
      const statementOfMeans = new StatementOfMeans();
      statementOfMeans.disability = disability;
      civilClaimResponse.case_data.statementOfMeans = statementOfMeans;
    }
    await draftStoreService.saveDraftClaim(claimId, civilClaimResponse.case_data);
  }
}
